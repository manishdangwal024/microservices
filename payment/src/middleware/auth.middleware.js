const jwt = require("jsonwebtoken");

function createAuthMidlleware(role = ["user"]) {
  return function (req, res, next) {
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    try {
      if (!token) {
        return res.status(401).json({
          message: "unauthorized! no token provides",
        });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!role.includes(decoded.role)) {
        return res.status(403).json({
          message: "Forbidden:you does have the permission",
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
}

module.exports = { createAuthMidlleware };
