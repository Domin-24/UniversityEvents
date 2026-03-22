-- ==============================================
-- seeds.sql — ข้อมูลตัวอย่างสำหรับ Development
-- ระบบจัดการกิจกรรมมหาวิทยาลัย
-- ==============================================

USE university_events_db;

-- ==============================================
-- ผู้ใช้งาน (password: Password123)
-- bcrypt hash ของ "Password123" rounds=10
-- ==============================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin System',   'admin@university.ac.th',     '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'ADMIN'),
  ('อาจารย์สมชาย',   'somchai@university.ac.th',   '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'LECTURER'),
  ('อาจารย์วิภาวดี', 'wipawadee@university.ac.th', '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'LECTURER'),
  ('นิสิตปิยะ',       'piya@student.university.ac.th',   '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'STUDENT'),
  ('นิสิตนภา',        'napa@student.university.ac.th',   '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'STUDENT'),
  ('นิสิตธนกร',       'thanakorn@student.university.ac.th', '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'STUDENT'),
  ('นิสิตพิมพ์ชนก',   'pimchanok@student.university.ac.th', '$2b$10$8KzaNdKIMyOkASXvLKMT6.GcQnLPLz.n54JEYoQCdRVzCbQJWr6Yq', 'STUDENT')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ==============================================
-- กิจกรรม (สร้างโดย อ.สมชาย user_id=2)
-- ==============================================
INSERT INTO events (create_by, title, description, event_date, location, max_participants, approval_status, event_status) VALUES
  (2, 'สัมมนาเทคโนโลยี AI สำหรับนิสิต',
   'บรรยายพิเศษเรื่อง Artificial Intelligence และ Machine Learning ในยุคปัจจุบัน พร้อมกิจกรรม Workshop',
   '2026-04-15 09:00:00', 'ห้องประชุมใหญ่ อาคาร A', 100,
   'APPROVED', 'OPEN'),

  (2, 'กิจกรรมจิตอาสาทำความสะอาดชุมชน',
   'ร่วมกันทำความสะอาดพื้นที่โดยรอบมหาวิทยาลัย เพื่อสร้างจิตสาธารณะ',
   '2026-04-20 07:30:00', 'ลานกิจกรรมหน้าอาคาร B', 50,
   'APPROVED', 'OPEN'),

  (2, 'ค่ายพัฒนาทักษะการเขียนโปรแกรม',
   'ค่าย 2 วัน เรียนรู้ Full-Stack Development ด้วย Node.js และ React',
   '2026-05-01 08:00:00', 'ห้องคอมพิวเตอร์ 301', 30,
   'APPROVED', 'OPEN'),

  (3, 'Workshop การออกแบบ UX/UI เบื้องต้น',
   'เรียนรู้หลักการออกแบบ User Experience และ User Interface สำหรับแอปพลิเคชัน',
   '2026-05-10 13:00:00', 'ห้อง Design Lab', 25,
   'PENDING', 'OPEN'),

  (2, 'กิจกรรมรับน้องอย่างสร้างสรรค์',
   'กิจกรรมสร้างความสัมพันธ์ระหว่างรุ่นพี่รุ่นน้อง ในรูปแบบที่สนุกสนานและปลอดภัย',
   '2026-06-01 10:00:00', 'สนามกีฬา', 200,
   'APPROVED', 'OPEN')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ==============================================
-- บันทึกการอนุมัติ
-- ==============================================
INSERT INTO approvals (event_id, approved_by, status, remark) VALUES
  (1, 2, 'APPROVED', 'เนื้อหาเหมาะสม อนุมัติให้จัดได้'),
  (2, 2, 'APPROVED', 'กิจกรรมดี เป็นประโยชน์ต่อชุมชน'),
  (3, 1, 'APPROVED', 'อนุมัติ เนื้อหาตรงตามวัตถุประสงค์'),
  (5, 1, 'APPROVED', 'อนุมัติ ตามนโยบายมหาวิทยาลัย')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ==============================================
-- การลงทะเบียนกิจกรรม (นิสิต)
-- ==============================================
INSERT INTO registrations (user_id, event_id, status) VALUES
  (4, 1, 'REGISTERED'),
  (5, 1, 'REGISTERED'),
  (6, 1, 'REGISTERED'),
  (4, 2, 'REGISTERED'),
  (7, 2, 'REGISTERED'),
  (5, 3, 'REGISTERED'),
  (6, 3, 'REGISTERED')
ON DUPLICATE KEY UPDATE status = VALUES(status);
