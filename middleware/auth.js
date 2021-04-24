const jwt = require("jsonwebtoken");
const CONSTANT = require("../config/constants");
const secretKey= CONSTANT.jwtSecret;

module.exports = function (req, res, next) {
  // Get token from Header
  const token = req.header("token");

  // check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, Authorization denied" });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token" });
  }
};
