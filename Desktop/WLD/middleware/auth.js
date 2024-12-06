const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Obtener token del header Authorization, x-auth-token o cookie
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : (req.cookies.token || req.header('x-auth-token'));

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded.admin;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token no válido' });
    }
};
