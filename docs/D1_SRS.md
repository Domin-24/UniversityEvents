# D1 — Software Requirements Specification (SRS)

## ระบบจัดการกิจกรรมมหาวิทยาลัย (Event Management System)

## ข้อมูลเอกสาร

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสเอกสาร | D1_SRS |
| เวอร์ชัน | 1.0 |
| สถานะ | Approved for Submission |

## ทีม
- 65160109 นางสาวกมลชนก เรืองแสน
- 65160118 พชรพล เชิดชู
- 65160248 นายทิษณุ กลิ่นกำธรกุล
- 65160263 นายรพีพัฒน์ ทับทอง
- 65160377 นายเทพเมธี ศรีพล

## สารบัญ
1. บทนำ
2. คำอธิบายโดยรวม
3. ความต้องการเฉพาะ
4. ความต้องการอินเทอร์เฟซภายนอก
5. ฟีเจอร์ระบบ
6. ความต้องการอื่น ๆ

## 1. บทนำ (INTRODUCTION)

### 1.1 วัตถุประสงค์ (Purpose)
เอกสารนี้จัดทำขึ้นเพื่อระบุความต้องการของซอฟต์แวร์ ระบบจัดการกิจกรรมมหาวิทยาลัย (Event Management System) ซึ่งเป็นระบบบนเว็บที่ช่วยให้ นักศึกษา อาจารย์ และผู้ดูแลระบบ สามารถ:
- สร้างกิจกรรม
- สมัครเข้าร่วมกิจกรรม
- เช็กชื่อผู้เข้าร่วม
- ดูรายงานและสถิติของกิจกรรม

เอกสารนี้ทำหน้าที่เป็นข้อตกลงระหว่างทีมพัฒนา ผู้สอน และผู้มีส่วนได้ส่วนเสีย

### 1.2 ขอบเขต (Scope)
ระบบ Event Management System ประกอบด้วยฟังก์ชันหลักดังนี้:
- การสมัครสมาชิกและเข้าสู่ระบบ
- การสร้าง แก้ไข และอนุมัติกิจกรรม
- การแสดงรายการกิจกรรม
- การสมัครเข้าร่วมกิจกรรม
- การจำกัดจำนวนผู้เข้าร่วม
- การเช็กชื่อและบันทึกการเข้าร่วม
- การดูประวัติการเข้าร่วมกิจกรรม
- ระบบรายงานสรุปผลและ Dashboard
- การประเมินความพึงพอใจหลังจบกิจกรรม
- การค้นหาและกรองกิจกรรม

### 1.3 ภาพรวมเอกสาร (Document Overview)
เอกสารนี้แบ่งออกเป็น 6 หัวข้อหลัก:
- บทนำ: ให้ข้อมูลพื้นฐานเกี่ยวกับโครงการ
- คำอธิบายโดยรวม: อธิบายบริบทและลักษณะทั่วไป
- ความต้องการเฉพาะ: ระบุรายละเอียดความต้องการ
- อินเทอร์เฟซภายนอก: กำหนดการเชื่อมต่อระบบ
- ฟีเจอร์ระบบ: อธิบายฟีเจอร์แต่ละรายการ
- ความต้องการอื่นๆ: กฎและข้อกำหนดเพิ่มเติม

### 1.4 เอกสารอ้างอิง (References)
- IEEE Std 830-1998 – IEEE Recommended Practice for Software Requirements Specifications
- IEEE Std 29148-2018 – Systems and Software Engineering — Life Cycle Processes — Requirements Engineering
- SWEBOK Version 3.0
- WCAG 2.1 – https://www.w3.org/WAI/WCAG21/quickref/
- พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) – https://www.pdpc.go.th/
- OWASP Top 10 – Web Application Security Risks
- เอกสารอ้างอิงด้านการพัฒนาระบบเว็บและฐานข้อมูลสำหรับสถาบันการศึกษา

### 1.5 ข้อตกลงเอกสาร (Document Conventions)
- REQ-XXX : ความต้องการเชิงหน้าที่ (Functional Requirements)
- NFREQ-XXX : ความต้องการที่ไม่ใช่เชิงหน้าที่ (Non-Functional Requirements)
- BR-XXX : กฎทางธุรกิจของระบบ (Business Rules)
- DR-XXX : ความต้องการด้านข้อมูล (Data Requirements)
- LC-XXX : ความต้องการด้านกฎหมายและข้อบังคับ (Legal / Compliance Requirements)
- [TBD] : รายการที่ยังไม่ได้กำหนดรายละเอียด
- [Optional] : ฟังก์ชันเพิ่มเติมในอนาคต

## 2. คำอธิบายโดยรวม (OVERALL DESCRIPTION)

### 2.1 มุมมองผลิตภัณฑ์ (Product Perspective)
ระบบจัดการกิจกรรมมหาวิทยาลัยเป็น Web Application แบบ Client-Server รองรับการใช้งานผ่านคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน

### 2.2 ฟังก์ชันผลิตภัณฑ์ (Product Functions)
- สมัครผู้ใช้ใหม่ (นักศึกษา/อาจารย์)
- เข้าสู่ระบบ
- สร้างกิจกรรมใหม่
- แก้ไขรายละเอียดกิจกรรม
- แสดงรายการกิจกรรม
- สมัครเข้าร่วมกิจกรรม
- จำกัดจำนวนผู้เข้าร่วมและปิดรับอัตโนมัติ
- เช็กชื่อและบันทึกการเข้าร่วม
- ดูประวัติการเข้าร่วม
- แสดงรายงานและ Dashboard
- อนุมัติ/ปฏิเสธกิจกรรมก่อนเผยแพร่
- ประเมินความพึงพอใจหลังเข้าร่วม
- ค้นหาและกรองกิจกรรม

### 2.3 ประเภทผู้ใช้ (User Classes)
- นักศึกษา (Student)
- อาจารย์/ผู้จัดกิจกรรม (Instructor/Event Organizer)
- ผู้ดูแลระบบ (Administrator)

### 2.4 สภาพแวดล้อมการทำงาน (Operating Environment)
- Server: Cloud หรือ On-Premise
- RAM Server: 4-8 GB
- CPU: 2 vCPU ขึ้นไป
- Storage: 50 GB ขึ้นไป
- Client: PC/Laptop/Tablet/Smartphone
- OS Server: Ubuntu 20.04 LTS+ หรือ Windows Server
- OS Client: Windows 10+, macOS 10.15+, iOS 14+, Android 10+
- Browsers: Chrome, Firefox, Safari, Edge (อย่างน้อย 2 เวอร์ชันย้อนหลัง)

### 2.5 ข้อจำกัด (Design and Implementation Constraints)
- Frontend: React
- Backend: Node.js / Express
- Database: MySQL
- ทำตามกรอบเวลาในรายวิชา
- ใช้เครื่องมือ Open Source เป็นหลัก
- ทีมขนาดจำกัด ต้องรับหลายบทบาท

### 2.6 สมมติฐานและการพึ่งพา (Assumptions and Dependencies)
- ผู้ใช้มีอินเทอร์เน็ตและอุปกรณ์สำหรับใช้งาน
- ข้อมูลกิจกรรมถูกกรอกอย่างถูกต้อง
- ระบบใช้งานในบริบทมหาวิทยาลัย
- พึ่งพาเครือข่ายและฐานข้อมูลสำหรับการให้บริการ

## 3. ความต้องการเฉพาะ (SPECIFIC REQUIREMENTS)

### 3.1 ความต้องการเชิงหน้าที่ (FUNCTIONAL REQUIREMENTS)
- REQ-001: การสมัครผู้ใช้ (Registration) — Priority: HIGH — Status: Approved
- REQ-002: การเข้าสู่ระบบ (Login) — Priority: HIGH — Status: Approved
- REQ-003: การสร้างกิจกรรม (Create Event) — Priority: HIGH — Status: Approved
- REQ-004: การแก้ไขกิจกรรม (Edit Event) — Priority: MEDIUM — Status: Approved
- REQ-005: การแสดงรายการกิจกรรม (View Event List) — Priority: HIGH — Status: Approved
- REQ-006: การสมัครเข้าร่วมกิจกรรม (Event Registration) — Priority: HIGH — Status: Approved
- REQ-007: การจำกัดจำนวนผู้เข้าร่วม (Participant Limitation) — Priority: HIGH — Status: Approved
- REQ-008: การเช็กชื่อเข้าร่วมกิจกรรม (Attendance Check) — Priority: HIGH — Status: Approved
- REQ-009: การดูประวัติการเข้าร่วมกิจกรรม (Participation History) — Priority: MEDIUM — Status: Approved
- REQ-010: รายงานสรุปผลและแดชบอร์ด (Report and Dashboard) — Priority: MEDIUM — Status: Approved
- REQ-011: การอนุมัติกิจกรรม (Event Approval) — Priority: HIGH — Status: Approved
- REQ-012: การประเมินความพึงพอใจ (Satisfaction Evaluation) — Priority: MEDIUM — Status: Approved
- REQ-013: การค้นหาและกรองกิจกรรม (Search and Filter) — Priority: HIGH — Status: Approved

### 3.2 ความต้องการที่ไม่ใช่เชิงหน้าที่ (NON-FUNCTIONAL REQUIREMENTS)
- NFREQ-001: Performance
  - โหลดหน้าเว็บไม่เกิน 3 วินาทีบนเครือข่าย 4G
  - ค้นหา/แสดงรายการกิจกรรมไม่เกิน 2 วินาที
  - รองรับผู้ใช้พร้อมกันอย่างน้อย 1,000 คน
  - Availability ไม่น้อยกว่า 99.9%
- NFREQ-002: Security
  - ใช้ HTTPS (TLS 1.3)
  - เก็บรหัสผ่านแบบ hash ด้วย bcrypt
  - ป้องกัน SQL Injection ด้วย prepared statements
  - มี rate limit ไม่เกิน 100 requests/นาที/IP
  - RBAC ตามบทบาทผู้ใช้
- NFREQ-003: Usability
  - รองรับ Responsive Design
  - ยึดแนวทาง WCAG 2.1 AA
  - ข้อความแจ้งเตือนชัดเจน
- NFREQ-004: Reliability
  - สำรองข้อมูลรายวัน
  - MTTR ไม่เกิน 4 ชั่วโมง
  - มีแผนกู้คืนระบบ
- NFREQ-005: Scalability
  - รองรับผู้ใช้ 1,000 คนระยะแรก
  - ขยายได้ถึง 10,000 คนในอนาคต

## 4. ความต้องการอินเทอร์เฟซภายนอก (EXTERNAL INTERFACE REQUIREMENTS)

### 4.1 อินเทอร์เฟซผู้ใช้ (User Interfaces)
- User Website: Responsive, React
- หน้าหลัก: Login/Register, รายการกิจกรรม, รายละเอียดกิจกรรม, สมัครกิจกรรม, ประวัติ, ประเมินความพึงพอใจ
- Admin/Organizer Dashboard: SPA สำหรับสร้าง/แก้ไข/อนุมัติกิจกรรม เช็กชื่อ ดูรายงาน และจัดการผู้ใช้

### 4.2 อินเทอร์เฟซฮาร์ดแวร์ (Hardware Interfaces)
- Cloud Server + MySQL
- Client: คอมพิวเตอร์ แท็บเล็ต สมาร์ตโฟน

### 4.3 อินเทอร์เฟซซอฟต์แวร์ (Software Interfaces)
- Email Service สำหรับยืนยัน/แจ้งเตือน
- Database: MySQL
- Authentication: JSON Web Token (JWT)

### 4.4 อินเทอร์เฟซการสื่อสาร (Communication Interfaces)
- HTTPS (TLS 1.3)
- JSON
- RESTful API
- Rate Limit: 100 requests/นาที/ผู้ใช้
- API response time ไม่เกิน 500 ms (p95)

## 5. ฟีเจอร์ระบบ (SYSTEM FEATURES)

### 5.1 User Account Management
- สมัครสมาชิก
- เข้าสู่ระบบ
- ออกจากระบบ
- ความต้องการที่เกี่ยวข้อง: REQ-001, REQ-002

### 5.2 Event Lifecycle Management
- สร้างกิจกรรม
- แก้ไขกิจกรรม
- อนุมัติ/ปฏิเสธกิจกรรม
- ความต้องการที่เกี่ยวข้อง: REQ-003, REQ-004, REQ-011

### 5.3 Event Participation
- สมัครกิจกรรม
- ปิดรับสมัครอัตโนมัติเมื่อเต็ม
- ความต้องการที่เกี่ยวข้อง: REQ-006, REQ-007

### 5.4 Attendance and Reporting
- เช็กชื่อผู้เข้าร่วม
- รายงานและสถิติกิจกรรม
- ความต้องการที่เกี่ยวข้อง: REQ-008, REQ-010

## 6. ความต้องการอื่น ๆ (OTHER REQUIREMENTS)

### 6.1 กฎทางธุรกิจ (Business Rules)
- BR-001: สมัครได้เฉพาะกิจกรรมที่เปิดรับ
- BR-002: ผู้ใช้หนึ่งคนสมัครกิจกรรมเดิมได้ครั้งเดียว
- BR-003: กิจกรรมต้องอนุมัติก่อนเผยแพร่
- BR-004: ประเมินได้เฉพาะผู้ที่เข้าร่วมจริง

### 6.2 ความต้องการด้านข้อมูล (Data Requirements)
- DR-001: ข้อมูลผู้ใช้ (ชื่อ-นามสกุล อีเมล ประเภทผู้ใช้)
- DR-002: ข้อมูลกิจกรรม (ชื่อ วันเวลา สถานที่ จำนวนสูงสุด)
- DR-003: ข้อมูลการเข้าร่วม (รหัสผู้ใช้ รหัสกิจกรรม สถานะ)

### 6.3 กฎหมายและข้อบังคับ (Legal / Compliance)
- LC-001: ปฏิบัติตาม PDPA
- LC-002: ข้อมูลส่วนบุคคลต้องเข้ารหัสในการจัดเก็บ
- LC-003: ผู้ใช้สามารถขอลบข้อมูลส่วนตัวได้
- LC-004: ระบบต้องมี audit log
