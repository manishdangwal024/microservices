const jwt = require("jsonwebtoken");

function createAuthMiddleware(role = ["user"]) {
  return function authMiddleware(req, res, next) {
    try {
      const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized:No token provided",
        });
      }
      const decoded = jwt.verify(token,process.env.token);
      if(!role.includes(decoded.role)){
        return res.status(403).json({
            message:"forbidden:insufficient permission"
        })
      };
      req.user=decoded;
      next();
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized:Invalid token"
        })
    }
  };
}

module.exports=createAuthMiddleware
