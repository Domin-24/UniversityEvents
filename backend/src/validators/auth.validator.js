const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อ').max(120, 'ชื่อยาวเกินกำหนด'),
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['STUDENT', 'LECTURER']).optional().default('STUDENT'),
});

const loginSchema = z.object({
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
