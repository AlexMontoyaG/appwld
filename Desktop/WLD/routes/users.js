const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// Validación para nueva transacción
const validateTransaction = [
    body('nombre').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('documento').trim().notEmpty(),
    body('telefono').trim().notEmpty(),
    body('metodo').isIn(['efectivo', 'nequi', 'bancolombia', 'daviplata', 'davivienda']),
    body('cuenta').trim().notEmpty(),
    body('wld').isNumeric().toFloat()
];

// Crear nueva transacción
router.post('/transaction', validateTransaction, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const transaction = new Transaction({
            ...req.body,
            estado: 'pendiente'
        });

        await transaction.save();

        logger.info('Nueva transacción creada', {
            transactionId: transaction._id,
            email: transaction.email
        });

        res.status(201).json(transaction);
    } catch (err) {
        logger.error('Error creando transacción:', err);
        res.status(500).json({ message: 'Error creando transacción' });
    }
});

// Obtener estado de transacción por ID
router.get('/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }
        res.json(transaction);
    } catch (err) {
        logger.error('Error obteniendo transacción:', err);
        res.status(500).json({ message: 'Error obteniendo transacción' });
    }
});

// Obtener transacciones por email
router.get('/transactions/:email', async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            email: req.params.email 
        }).sort({ createdAt: -1 });
        
        res.json(transactions);
    } catch (err) {
        logger.error('Error obteniendo transacciones:', err);
        res.status(500).json({ message: 'Error obteniendo transacciones' });
    }
});

module.exports = router;
