const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.role = decoded.role
        req.id = decoded.id
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token verification failed' });
    }
};

module.exports = authenticateToken;