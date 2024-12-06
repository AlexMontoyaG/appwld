const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Admin = require('../models/Admin');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// Middleware de validación para login
const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
];

// Login de administrador
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Verificar si el admin existe
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Crear token JWT
        const payload = {
            admin: {
                id: admin.id,
                role: 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('adminToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 28800000 // 8 horas
                });
                res.json({ success: true, token });
            }
        );

        // Registrar actividad
        logger.logUserActivity(admin.id, 'LOGIN', { email });

    } catch (err) {
        logger.error('Error en login de admin:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener estadísticas del dashboard
router.get('/dashboard/stats', auth, async (req, res) => {
    try {
        const totalUsuarios = await Transaction.distinct('email').count();
        const totalWLD = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: '$wld' } } }
        ]);
        const totalTransacciones = await Transaction.countDocuments();

        res.json({
            totalUsuarios,
            totalWLD: totalWLD[0]?.total || 0,
            totalTransacciones
        });
    } catch (err) {
        logger.error('Error obteniendo estadísticas:', err);
        res.status(500).json({ message: 'Error obteniendo estadísticas' });
    }
});

// Obtener usuarios con paginación y búsqueda
router.get('/users', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const searchQuery = search ? {
            $or: [
                { nombre: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { documento: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const total = await Transaction.distinct('email', searchQuery).count();
        
        const users = await Transaction.aggregate([
            { $match: searchQuery },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$email',
                    nombre: { $first: '$nombre' },
                    email: { $first: '$email' },
                    documento: { $first: '$documento' },
                    telefono: { $first: '$telefono' },
                    totalWLD: { $sum: '$wld' },
                    ultimaTransaccion: { $max: '$createdAt' }
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        logger.error('Error obteniendo usuarios:', err);
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

// Obtener transacciones con paginación y filtros
router.get('/transactions', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const date = req.query.date;
        const search = req.query.search;

        let query = {};

        if (status) query.estado = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }
        if (search) {
            query.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { documento: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        logger.error('Error obteniendo transacciones:', err);
        res.status(500).json({ message: 'Error obteniendo transacciones' });
    }
});

// Exportar transacciones
router.get('/transactions/export', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 });

        const csvFields = ['ID', 'Fecha', 'Nombre', 'Email', 'Documento', 'Teléfono', 'Método', 'WLD', 'Estado'];
        const csvRows = transactions.map(t => [
            t._id,
            new Date(t.createdAt).toLocaleDateString(),
            t.nombre,
            t.email,
            t.documento,
            t.telefono,
            t.metodo,
            t.wld,
            t.estado
        ]);

        // Crear CSV
        const csvContent = [
            csvFields.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transacciones-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
    } catch (err) {
        logger.error('Error exportando transacciones:', err);
        res.status(500).json({ message: 'Error exportando transacciones' });
    }
});

// Obtener transacciones con paginación
router.get('/transactions', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments();

        res.json({
            transactions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        logger.error('Error obteniendo transacciones:', err);
        res.status(500).json({ message: 'Error obteniendo transacciones' });
    }
});

// Exportar transacciones a CSV
router.get('/transactions/export', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        
        // Crear CSV
        const fields = ['ID', 'Nombre', 'Email', 'Método', 'WLD', 'Estado', 'Fecha'];
        const csv = transactions.map(t => [
            t._id,
            t.nombre,
            t.email,
            t.metodo,
            t.wld,
            t.estado,
            t.createdAt
        ].join(','));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transacciones.csv');
        res.write(fields.join(',') + '\n');
        res.write(csv.join('\n'));
        res.end();

        // Registrar actividad
        logger.logUserActivity(req.admin.id, 'EXPORT_TRANSACTIONS');

    } catch (err) {
        logger.error('Error exportando transacciones:', err);
        res.status(500).json({ message: 'Error exportando transacciones' });
    }
});

// Actualizar estado de transacción
router.put('/transactions/:id', auth, async (req, res) => {
    try {
        const { estado } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }

        // Registrar actividad
        logger.logUserActivity(req.admin.id, 'UPDATE_TRANSACTION', {
            transactionId: req.params.id,
            newStatus: estado
        });

        res.json(transaction);
    } catch (err) {
        logger.error('Error actualizando transacción:', err);
        res.status(500).json({ message: 'Error actualizando transacción' });
    }
});

// Cambiar contraseña
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Obtener el admin actual
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        
        // Guardar los cambios
        await admin.save();

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        logger.error('Error al cambiar contraseña:', err);
        res.status(500).json({ message: 'Error al cambiar la contraseña' });
    }
});

module.exports = router;
