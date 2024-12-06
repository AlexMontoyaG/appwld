require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Importar rutas
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => logger.info('Conectado a MongoDB'))
.catch(err => logger.error('Error conectando a MongoDB:', err));

// Configuración de seguridad básica
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://code.jquery.com', 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
});
app.use('/api/', limiter);

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Rutas de la API
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Ruta para el panel de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'settings.html'));
});

app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'users.html'));
});

app.get('/admin/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'transactions.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Servidor ejecutándose en el puerto ${PORT}`);
});
