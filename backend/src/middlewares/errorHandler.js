function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'ไม่พบเส้นทาง API ที่เรียกใช้',
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    details: err.details || undefined,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
