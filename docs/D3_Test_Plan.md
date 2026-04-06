# D3 Test Plan

## 1. Introduction

- โปรเจกต์: ระบบจัดการกิจกรรมมหาวิทยาลัย (University Event Management System)
- เวอร์ชัน: 1.0
- วันที่: 30 มีนาคม 2569
- ผู้เขียน: ทีม QA

วัตถุประสงค์ของเอกสารนี้คือกำหนดขอบเขต กลยุทธ์ เครื่องมือ และเกณฑ์การทดสอบสำหรับระบบจัดการกิจกรรมมหาวิทยาลัย โดยครอบคลุมทั้ง Unit, Integration และ UAT เพื่อยืนยันความถูกต้องของฟังก์ชันหลักก่อนส่งมอบงาน

## 2. Testing Scope

### ฟีเจอร์ที่ทดสอบ

- การจัดการบัญชีผู้ใช้: สมัครสมาชิก, เข้าสู่ระบบ, ตรวจสอบข้อมูลผู้ใช้จาก token
- การควบคุมสิทธิ์ตามบทบาท: STUDENT, LECTURER, ADMIN
- การจัดการกิจกรรม: สร้างกิจกรรม, ดูรายการกิจกรรม, ดูกิจกรรมของตนเอง
- การอนุมัติกิจกรรม: ดูรายการรออนุมัติ, อนุมัติหรือปฏิเสธกิจกรรม
- การลงทะเบียนกิจกรรม: ลงทะเบียน, ดูประวัติการลงทะเบียน, ยกเลิกการลงทะเบียน
- การจัดการข้อผิดพลาดของ API: 400, 401, 403, 404

### ฟีเจอร์ที่ไม่ทดสอบ (ใน D3)

- การทดสอบโหลดระดับสูงแบบพร้อมกันหลายร้อยผู้ใช้
- การทดสอบความปลอดภัยเชิงเจาะระบบเต็มรูปแบบ (penetration testing)
- การทดสอบโครงสร้างพื้นฐาน production จริง
- การทดสอบ end-to-end ด้วย browser automation เต็มรูปแบบ

## 3. กลยุทธ์การทดสอบ (Testing Strategy)

### 3.1 Unit Testing

- ทดสอบ: function, validation, middleware, controller logic
- Framework: Jest
- เป้าหมาย coverage: ไม่น้อยกว่า 80%
- ขอบเขตหลัก:
  - auth validator
  - event validator
  - role/jwt utility
  - auth controller
  - approval controller
  - event controller
  - error handler

ตัวอย่างหัวข้อที่ครอบคลุมใน Unit:
- register/login validation
- JWT sign/verify
- role-based access middleware
- business rules ของ event และ approval
- error mapping ของ middleware

### 3.2 Integration Testing

- ทดสอบ: การทำงานร่วมกันของ route + middleware + controller
- Framework: Jest + Supertest
- ขอบเขต: 5 ชุดทดสอบหลัก

Authentication Flow
- สมัครสมาชิกข้อมูลผิดรูปแบบ -> 400
- สมัครสมาชิกอีเมลซ้ำ -> 409
- เข้าสู่ระบบไม่ถูกต้อง -> 401
- เข้าสู่ระบบสำเร็จ -> 200 พร้อม token

Event Management API
- ดึงรายการกิจกรรมสาธารณะ -> 200
- สร้างกิจกรรมโดยไม่ล็อกอิน -> 401
- นิสิตพยายามสร้างกิจกรรม -> 403
- อาจารย์สร้างกิจกรรมสำเร็จ -> 201

Registration API
- ลงทะเบียนโดยไม่ล็อกอิน -> 401
- ผู้ใช้บทบาทไม่ถูกต้องลงทะเบียน -> 403
- นิสิตดูรายการลงทะเบียนของตนเอง -> 200

Approval API
- นิสิตเข้าคิวอนุมัติ -> 403
- ผู้มีสิทธิ์เข้าคิวอนุมัติ -> 200
- eventId ไม่ถูกต้องตอนอนุมัติ -> 400

Error Handling
- เรียกเส้นทางที่ไม่มีอยู่ -> 404
- ส่ง payload ผิดรูปแบบ -> 400

### 3.3 System Testing / End-to-End (Manual Flow)

- ทดสอบ: กระบวนการใช้งานหลักแบบต้นทางถึงปลายทาง
- ขอบเขต: 5 สถานการณ์

Scenario 1: สมัครสมาชิกและเข้าสู่ระบบ
- ผู้ใช้สมัครสมาชิก -> เข้าสู่ระบบ -> เข้าหน้า dashboard

Scenario 2: อาจารย์สร้างกิจกรรม
- login บทบาทอาจารย์ -> create event -> ตรวจสถานะ PENDING

Scenario 3: อนุมัติกิจกรรม
- ผู้มีสิทธิ์อนุมัติเปิดคิว -> approve -> กิจกรรมปรากฏในรายการสาธารณะ

Scenario 4: นิสิตลงทะเบียนและยกเลิก
- นิสิตลงทะเบียนกิจกรรม -> ตรวจในประวัติ -> ยกเลิก -> สถานะ CANCELLED

Scenario 5: ตรวจสอบสิทธิ์ตามบทบาท
- นิสิตพยายามทำงานของอาจารย์ -> 403
- เรียก endpoint ที่ต้อง auth โดยไม่ส่ง token -> 401

### 3.4 UAT (User Acceptance Testing)

ทดสอบกับตัวแทนผู้ใช้จริงตามบทบาทหลักของระบบ:
- นิสิต: สมัคร/ล็อกอิน/ลงทะเบียน/ยกเลิก
- อาจารย์: สร้างกิจกรรม
- ผู้อนุมัติ: จัดการคิวอนุมัติ
- QA Lead: ตรวจ flow รวมและสิทธิ์การเข้าถึง

หมายเหตุ: รายละเอียด UAT แต่ละสถานการณ์อยู่ในเอกสาร D3 UAT Scenarios

## 4. Test Tools and Environment

### เครื่องมือ

- Unit Testing: Jest
- Integration Testing: Supertest
- API Validation เสริม: Postman
- Coverage: Istanbul (ผ่าน Jest)

### สภาพแวดล้อม

- Frontend Development: http://localhost:5173
- Backend API: http://localhost:5001/api
- Database: MySQL

### Test Database

- ฐานข้อมูลทดสอบตาม environment ของ backend
- โครงสร้างอ้างอิงจาก backend/database/schema.sql

## 5. Test Metrics

เกณฑ์วัดผลหลัก:
- ความครอบคลุมโค้ด (Statements): >= 80%
- อัตราผ่านการทดสอบ: 100%
- จำนวนปัญหาระดับวิกฤตที่ยอมรับได้: 0
- lint error ก่อนส่งงาน: ต้องเป็น 0

ผลล่าสุดที่บันทึกในรอบ D3:
- Test Suites: 12 ผ่านทั้งหมด
- Tests: 69 ผ่านทั้งหมด
- Coverage (Statements): 94.2%
- Coverage (Branches): 73.58%

## 6. Exit Criteria

ระบบถือว่าพร้อมผ่าน D3 เมื่อ:
- Test suite ทั้งหมดผ่าน
- ไม่มี lint error
- Coverage มากกว่าเกณฑ์ขั้นต่ำ
- UAT scenario หลักผ่านครบ

## 7. Deliverables

- เอกสาร Test Plan ฉบับนี้
- เอกสาร Test Cases
- เอกสาร UAT Scenarios
- รายงาน Coverage
- รายงานสถานะ D3
