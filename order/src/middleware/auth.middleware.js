const jwt = require("jsonwebtoken");

function createAuthMiddleware(roles = ["user"]) {
  return function AuthMiddleware(req, res, next) {
    try {
      const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized:No token provided",
        });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          message: "forbidden isufficient permission",
        });
      }
      req.user = decoded;
      next();
    } catch (errror) {
      return res.staus(500).json({
        message: "Internal server error",
      });
    }
  };
}


module.exports=createAuthMiddleware