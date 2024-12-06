const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    documento: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    metodo: {
        type: String,
        required: true,
        enum: ['efectivo', 'nequi', 'bancolombia', 'daviplata', 'davivienda']
    },
    cuenta: {
        type: String,
        required: true
    },
    wld: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'completado', 'fallido'],
        default: 'pendiente'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar updatedAt antes de cada actualización
TransactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
