# Code Review Checklist — ระบบจัดการกิจกรรมมหาวิทยาลัย

ใช้ Checklist นี้ทุกครั้งก่อน approve Pull Request

---

## 🔒 Security

- [ ] ไม่มี hardcoded password, API key, หรือ secret ในโค้ด
- [ ] ไม่มีไฟล์ `.env` ถูก commit
- [ ] SQL query ทั้งหมดใช้ parameterized query (ไม่มี string concatenation)
- [ ] Input ทุกตัวที่มาจาก user ผ่าน validation (Zod) ก่อนใช้งาน
- [ ] Password ถูก hash ด้วย bcrypt ก่อนเก็บลง DB เสมอ
- [ ] Response ไม่รวม `password` field กลับไปยัง client

---

## 🔑 Authentication & Authorization

- [ ] Route ที่ต้องการ auth มี `requireAuth` middleware
- [ ] Route ที่จำกัดสิทธิ์มี `requireRole([...])` middleware
- [ ] การสมัครกิจกรรมจำกัดเฉพาะ STUDENT role
- [ ] การสร้าง/อนุมัติกิจกรรมจำกัดเฉพาะ LECTURER/ADMIN

---

## ✅ Functionality & Logic

- [ ] โค้ดทำในสิ่งที่ PR description ระบุไว้ครบถ้วน
- [ ] Edge cases ได้รับการจัดการ (empty data, null, boundary values)
- [ ] Error handling ครอบคลุม: ส่ง appropriate HTTP status + message
- [ ] Database transaction ใช้เมื่อ operation ต้องการ atomicity
- [ ] ไม่มี logic ซ้ำกันที่ควรจะ refactor เป็น helper

---

## 📋 Code Quality

- [ ] โค้ดตรงตาม [Coding Standards](../Coding_Standards.md)
- [ ] ตั้งชื่อตัวแปร/ฟังก์ชันสื่อความหมาย
- [ ] ไม่มี `console.log` debugging ค้างในโค้ด
- [ ] ไม่มี commented-out code ที่ไม่จำเป็น
- [ ] ฟังก์ชันไม่ยาวเกิน 50 บรรทัด (ถ้ายาวกว่าควร refactor)
- [ ] ใช้ `const`/`let` ไม่ใช้ `var`
- [ ] Async/await ใช้อย่างถูกต้อง ไม่มี unhandled promise rejection

---

## 🗄️ Database

- [ ] Query มี WHERE clause เมื่อจำเป็น (ไม่ SELECT * โดยไม่มีเงื่อนไข)
- [ ] SELECT ระบุ column ที่ต้องการ ไม่ใช้ `SELECT *` ใน production
- [ ] Index ที่จำเป็นมีอยู่แล้วใน schema (เช่น foreign keys)
- [ ] Migration script (ถ้ามีการเปลี่ยน schema) อยู่ใน `database/migrations/`

---

## 🧪 Testing

- [ ] Feature ใหม่มี test ครอบคลุม happy path
- [ ] Bug fix มี test ที่พิสูจน์ว่า bug ไม่เกิดซ้ำ
- [ ] Tests ทั้งหมดผ่าน (`npm test`)
- [ ] ไม่มี test ที่ skip โดยไม่มีเหตุผล

---

## 📱 Frontend (ถ้า PR เกี่ยวข้อง)

- [ ] ใช้ Function Component ไม่ใช้ Class Component
- [ ] ไม่มี state mutation โดยตรง
- [ ] `useCallback` ใช้กับ function ที่อยู่ใน `useEffect` deps
- [ ] API error จัดการ และแสดงข้อความที่เข้าใจได้ให้ user
- [ ] Loading state แสดงระหว่างรอ API
- [ ] ไม่มี hardcoded URL — ใช้ `apiClient` จาก `src/api/client.js`

---

## 📄 Documentation

- [ ] อัปเดต `DEVELOPMENT.md` ถ้ามีขั้นตอน setup ใหม่
- [ ] อัปเดต `.env.example` ถ้าเพิ่ม environment variable ใหม่
- [ ] README อัปเดตถ้ามีการเปลี่ยนแปลงสำคัญ

---

## Reviewer Sign-off

| Reviewer | วันที่ | ผล |
|---------|-------|-----|
| | | ✅ Approved / 🔄 Changes Requested |
