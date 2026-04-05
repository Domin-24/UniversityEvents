const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return next(new ApiError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return next(new ApiError(401, 'โทเคนไม่ถูกต้องหรือหมดอายุ'));
  }
}

module.exports = {
  requireAuth,
};
