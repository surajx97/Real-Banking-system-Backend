const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({
      meassage: "unauthorized access",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      meassage: "unauthorized access , token is invalid",
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({
      meassage: "unauthorized access",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      return res.status(403).json({
        message: "forbidden access,not a system user",
      });
    }
    req.user = user;
    console.log(req.user);
    next();
  } catch (error) {
    return res.status(401).json({
      meassage: "unauthorized access , token is invalid",
    });
  }
}

module.exports = { authMiddleware, authSystemUserMiddleware};
