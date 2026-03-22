const ApiError = require('../utils/apiError');

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'));
    }

    return next();
  };
}

module.exports = {
  requireRole,
};
