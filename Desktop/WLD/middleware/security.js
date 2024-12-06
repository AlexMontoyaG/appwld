const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('../utils/logger');

// Configuración de Rate Limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos por defecto
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // límite de solicitudes por ventana
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.',
    handler: (req, res) => {
        logger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            error: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.'
        });
    }
});

// Configuración de Helmet
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://code.jquery.com', 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
};

// Middleware para prevenir ataques de fuerza bruta en el login
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 intentos
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente más tarde.',
    handler: (req, res) => {
        logger.logSecurityEvent('LOGIN_ATTEMPTS_EXCEEDED', {
            ip: req.ip,
            email: req.body.email
        });
        res.status(429).json({
            error: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente más tarde.'
        });
    }
});

// Middleware para validar y sanitizar datos de entrada
const sanitizeInput = (req, res, next) => {
    // Implementar sanitización de datos aquí
    next();
};

// Middleware para detectar y prevenir inyección SQL
const preventSQLInjection = (req, res, next) => {
    // Implementar prevención de SQL injection aquí
    next();
};

module.exports = {
    limiter,
    helmetConfig,
    loginLimiter,
    sanitizeInput,
    preventSQLInjection
};
