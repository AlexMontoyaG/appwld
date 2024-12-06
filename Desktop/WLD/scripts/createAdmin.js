require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createAdmin = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Verificar si ya existe un admin
        const adminExists = await Admin.findOne({ email: 'admin@worldcoincucuta.com' });
        if (adminExists) {
            console.log('El administrador ya existe');
            process.exit(0);
        }

        // Crear hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Crear admin
        const admin = new Admin({
            nombre: 'Administrador',
            email: 'admin@worldcoincucuta.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Administrador creado exitosamente');
        console.log('Email: admin@worldcoincucuta.com');
        console.log('Contraseña: admin123');
        console.log('Por favor, cambia la contraseña después del primer inicio de sesión');

    } catch (error) {
        console.error('Error creando administrador:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
