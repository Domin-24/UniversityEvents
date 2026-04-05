# Sprint 1 Backlog — ระบบจัดการกิจกรรมมหาวิทยาลัย

**Sprint Duration:** สัปดาห์ที่ 1–2 (2 สัปดาห์)  
**Sprint Goal:** ระบบสามารถ register/login, สร้างกิจกรรม, อนุมัติ, และสมัครเข้าร่วมกิจกรรมได้ครบ flow

---

## User Stories

---

### US-01 — ลงทะเบียนผู้ใช้ใหม่
**As a** นิสิตหรืออาจารย์  
**I want to** สร้างบัญชีใหม่ด้วยชื่อ, อีเมล, รหัสผ่าน และ role  
**So that** ฉันสามารถเข้าใช้ระบบได้

**Story Points:** 3  
**Assigned:** นักพัฒนา Backend  
**Status:** ✅ Done  
**Dependencies:** ไม่มี

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T1.1 | สร้าง POST /api/auth/register endpoint | 2h |
| T1.2 | เพิ่ม Zod validation (email, password min 8) | 1h |
| T1.3 | Hash password ด้วย bcrypt | 1h |
| T1.4 | ป้องกัน email ซ้ำ (409 Conflict) | 0.5h |
| T1.5 | Return JWT token หลัง register สำเร็จ | 0.5h |

---

### US-02 — เข้าสู่ระบบ
**As a** ผู้ใช้ที่ลงทะเบียนแล้ว  
**I want to** login ด้วยอีเมลและรหัสผ่าน  
**So that** ฉันได้รับ JWT token สำหรับใช้งานระบบ

**Story Points:** 2  
**Assigned:** นักพัฒนา Backend  
**Status:** ✅ Done  
**Dependencies:** US-01

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T2.1 | สร้าง POST /api/auth/login endpoint | 1h |
| T2.2 | ตรวจ email/password ด้วย bcrypt compare | 1h |
| T2.3 | Return JWT + user info เมื่อ login สำเร็จ | 0.5h |
| T2.4 | Handle invalid credentials (401) | 0.5h |

---

### US-03 — หน้า Login / Register UI
**As a** ผู้ใช้ใหม่  
**I want to** เห็นฟอร์ม login และ register ที่ใช้งานง่าย  
**So that** ฉันสามารถเข้าสู่ระบบผ่านเว็บเบราว์เซอร์ได้

**Story Points:** 3  
**Assigned:** นักพัฒนา Frontend  
**Status:** ✅ Done  
**Dependencies:** US-01, US-02

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T3.1 | สร้าง LoginPage component พร้อม form | 2h |
| T3.2 | สร้าง RegisterPage component พร้อม role selector | 2h |
| T3.3 | ทำ AuthContext (JWT, user state) | 1.5h |
| T3.4 | Protected route redirect ถ้าไม่ได้ login | 1h |
| T3.5 | Redirect ไป dashboard หลัง login/register | 0.5h |

---

### US-04 — สร้างกิจกรรม (อาจารย์/แอดมิน)
**As an** อาจารย์หรือแอดมิน  
**I want to** สร้างกิจกรรมใหม่โดยกำหนดชื่อ, คำอธิบาย, วันที่, สถานที่, จำนวนที่นั่ง  
**So that** นิสิตสามารถเห็นและสมัครเข้าร่วมได้

**Story Points:** 5  
**Assigned:** นักพัฒนา Backend  
**Status:** ✅ Done  
**Dependencies:** US-01, US-02

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T4.1 | สร้าง POST /api/events endpoint | 2h |
| T4.2 | Validate input ด้วย Zod schema | 1h |
| T4.3 | เก็บ event ใน DB ด้วย status PENDING | 1h |
| T4.4 | Guard route ด้วย requireRole(['LECTURER','ADMIN']) | 0.5h |
| T4.5 | Normalize ISO date เป็น MySQL DATETIME format | 0.5h |

---

### US-05 — อนุมัติ/ปฏิเสธกิจกรรม
**As an** อาจารย์หรือแอดมิน  
**I want to** ดูรายการกิจกรรมที่รอการอนุมัติ และอนุมัติหรือปฏิเสธพร้อม remark  
**So that** กิจกรรมที่ผ่านการตรวจสอบแล้วเท่านั้นที่นิสิตจะเห็น

**Story Points:** 5  
**Assigned:** นักพัฒนา Backend  
**Status:** ✅ Done  
**Dependencies:** US-04

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T5.1 | GET /api/approvals/pending — รายการรอ approve | 1.5h |
| T5.2 | PATCH /api/approvals/:eventId — approve/reject | 2h |
| T5.3 | บันทึกประวัติใน approvals table | 1h |
| T5.4 | Guard route สำหรับ LECTURER/ADMIN เท่านั้น | 0.5h |

---

### US-06 — ดูรายการกิจกรรม (นิสิต)
**As a** นิสิต  
**I want to** เห็นรายการกิจกรรมที่ได้รับการอนุมัติแล้ว พร้อมข้อมูลที่นั่งว่าง  
**So that** ฉันสามารถตัดสินใจสมัครเข้าร่วมได้

**Story Points:** 3  
**Assigned:** นักพัฒนา Backend + Frontend  
**Status:** ✅ Done  
**Dependencies:** US-05

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T6.1 | GET /api/events — รายการ approved events | 1h |
| T6.2 | JOIN registrations เพื่อคำนวณ registeredCount | 1.5h |
| T6.3 | แสดง remainingSlots ใน response | 0.5h |
| T6.4 | Frontend: แสดง event cards ใน Dashboard | 2h |

---

### US-07 — สมัครเข้าร่วมกิจกรรม (นิสิต)
**As a** นิสิต  
**I want to** กดสมัครเข้าร่วมกิจกรรมที่เปิดรับสมัคร  
**So that** ฉันมีสิทธิ์เข้าร่วมกิจกรรมนั้น และระบบบันทึกการลงทะเบียนของฉัน

**Story Points:** 8  
**Assigned:** นักพัฒนา Backend + Frontend  
**Status:** ✅ Done  
**Dependencies:** US-06

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T7.1 | POST /api/events/:id/register endpoint | 2h |
| T7.2 | ตรวจสอบ: event ต้อง APPROVED และ OPEN | 1h |
| T7.3 | ป้องกัน double-registration (409) | 1h |
| T7.4 | Transaction: ตรวจที่นั่ง + insert + update status | 2h |
| T7.5 | อัปเดต event_status เป็น FULL ถ้าเต็ม | 1h |
| T7.6 | จำกัดสิทธิ์เฉพาะ STUDENT role | 0.5h |
| T7.7 | Frontend: ปุ่ม "สมัคร" พร้อม disabled state | 1.5h |

---

### US-08 — ยกเลิกการสมัคร (นิสิต)
**As a** นิสิต  
**I want to** ยกเลิกการสมัครกิจกรรมที่ฉันเคยสมัครไว้  
**So that** ที่นั่งของฉันกลับมาให้คนอื่นสมัครได้

**Story Points:** 5  
**Assigned:** นักพัฒนา Backend + Frontend  
**Status:** ✅ Done  
**Dependencies:** US-07

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T8.1 | PATCH /api/events/:id/cancel-registration | 1.5h |
| T8.2 | Transaction: update status + reopen event slot | 2h |
| T8.3 | ตรวจว่า registration เป็นของ user ที่ขอยกเลิก | 1h |
| T8.4 | Frontend: ปุ่ม "ยกเลิก" ใน event card | 1h |
| T8.5 | จำกัดสิทธิ์เฉพาะ STUDENT role | 0.5h |

---

### US-09 — ดูประวัติการสมัคร (นิสิต)
**As a** นิสิต  
**I want to** ดูรายการกิจกรรมที่ตัวเองเคยสมัครทั้งหมด  
**So that** ฉันสามารถติดตามสถานะการสมัครของตัวเองได้

**Story Points:** 3  
**Assigned:** นักพัฒนา Backend + Frontend  
**Status:** ✅ Done  
**Dependencies:** US-07

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T9.1 | GET /api/events/registrations/me endpoint | 1.5h |
| T9.2 | JOIN events table สำหรับข้อมูล event | 1h |
| T9.3 | Frontend: แสดงรายการ "การสมัครของฉัน" | 1.5h |

---

### US-10 — Dashboard สำหรับอาจารย์
**As an** อาจารย์  
**I want to** เห็น Dashboard ที่รวมฟอร์มสร้างกิจกรรม + รายการรอ approve  
**So that** ฉันสามารถจัดการกิจกรรมได้จากที่เดียว

**Story Points:** 5  
**Assigned:** นักพัฒนา Frontend  
**Status:** ✅ Done  
**Dependencies:** US-04, US-05, US-06

**Tasks:**
| # | Task | ประมาณการ |
|---|------|-----------|
| T10.1 | Role-gate สำหรับ section สร้างกิจกรรม | 1h |
| T10.2 | ฟอร์มสร้างกิจกรรมใน Dashboard | 2h |
| T10.3 | แสดง Approval Queue | 1.5h |
| T10.4 | ปุ่ม Approve/Reject พร้อม remark input | 1h |

---

## Sprint Summary

| US | Story | Points | Status |
|----|-------|--------|--------|
| US-01 | ลงทะเบียนผู้ใช้ | 3 | ✅ Done |
| US-02 | Login | 2 | ✅ Done |
| US-03 | Login/Register UI | 3 | ✅ Done |
| US-04 | สร้างกิจกรรม | 5 | ✅ Done |
| US-05 | อนุมัติกิจกรรม | 5 | ✅ Done |
| US-06 | ดูรายการกิจกรรม | 3 | ✅ Done |
| US-07 | สมัครกิจกรรม | 8 | ✅ Done |
| US-08 | ยกเลิกการสมัคร | 5 | ✅ Done |
| US-09 | ดูประวัติการสมัคร | 3 | ✅ Done |
| US-10 | Dashboard อาจารย์ | 5 | ✅ Done |
| **รวม** | | **42 pts** | |

---

## Dependencies Map

```
US-01 ──► US-02 ──► US-03
   └──────────────► US-04 ──► US-05 ──► US-06 ──► US-07 ──► US-08
                                                         └──► US-09
                              US-05
                              US-04
                              US-06 ──► US-10
```
