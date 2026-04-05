const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().trim().min(1, 'กรุณาระบุชื่อกิจกรรม').max(255, 'ชื่อกิจกรรมยาวเกินกำหนด'),
  description: z.string().trim().max(4000, 'รายละเอียดกิจกรรมยาวเกินกำหนด').optional().default(''),
  eventDate: z.iso.datetime('รูปแบบวันเวลาไม่ถูกต้อง กรุณาใช้รูปแบบ ISO datetime'),
  location: z.string().trim().min(1, 'กรุณาระบุสถานที่').max(255, 'ชื่อสถานที่ยาวเกินกำหนด'),
  maxParticipants: z
    .number({
      error: 'กรุณาระบุจำนวนผู้เข้าร่วมสูงสุด',
    })
    .int('จำนวนผู้เข้าร่วมสูงสุดต้องเป็นจำนวนเต็ม')
    .positive('จำนวนผู้เข้าร่วมสูงสุดต้องมากกว่า 0'),
});

const updateApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  remark: z.string().trim().max(2000, 'หมายเหตุยาวเกินกำหนด').optional().default(''),
});

const eventIdParamSchema = z.object({
  eventId: z.coerce.number().int().positive('รหัสกิจกรรมต้องเป็นจำนวนเต็มบวก'),
});

module.exports = {
  createEventSchema,
  updateApprovalSchema,
  eventIdParamSchema,
};
