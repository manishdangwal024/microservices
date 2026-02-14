const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded;
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
}

module.exports = { authMiddleware };
