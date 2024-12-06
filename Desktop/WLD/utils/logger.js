const winston = require('winston');
const path = require('path');

// Crear directorio de logs si no existe
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'worldcoin-service' },
    transports: [
        // Escribir logs de error en error.log
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Escribir todos los logs en combined.log
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// Si no estamos en producción, también log a la consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Función para log de actividad de usuario
logger.logUserActivity = (userId, action, details) => {
    logger.info('User Activity', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

// Función para log de errores de seguridad
logger.logSecurityEvent = (type, details) => {
    logger.warn('Security Event', {
        type,
        details,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
