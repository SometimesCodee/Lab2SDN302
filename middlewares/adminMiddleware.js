const authenticateToken = require("./authenticateToken");
const userModel = require("../model/user");

const adminMiddleware = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, only admin allowed' });
    }

    const user = await userModel.findById(req.id).select("id role");
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  });
};

module.exports = adminMiddleware;
