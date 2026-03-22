const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const ApiError = require('../utils/apiError');
const { signAccessToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);

    const [existingRows] = await pool.query(
      'SELECT user_id FROM users WHERE email = ? LIMIT 1',
      [payload.email],
    );

    if (existingRows.length > 0) {
      throw new ApiError(409, 'อีเมลนี้ถูกใช้งานแล้ว');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [payload.name, payload.email, passwordHash, payload.role],
    );

    const token = signAccessToken({
      userId: result.insertId,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    });

    return res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        token,
        user: {
          userId: result.insertId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);

    const [rows] = await pool.query(
      `SELECT user_id, name, email, password, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [payload.email],
    );

    if (rows.length === 0) {
      throw new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const token = signAccessToken({
      userId: user.user_id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }
    return next(err);
  }
}

function me(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

module.exports = {
  register,
  login,
  me,
};
