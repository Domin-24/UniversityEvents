# Team Communication Plan — ระบบจัดการกิจกรรมมหาวิทยาลัย

**อัปเดตล่าสุด:** มีนาคม 2026

---

## 1. ข้อมูลทีม

| Role | ความรับผิดชอบหลัก |
|------|-----------------|
| นักพัฒนา Backend | API, business logic, database queries |
| นักพัฒนา Frontend | React UI, state management, API integration |
| นักพัฒนา DB/DevOps | Schema design, migrations, Docker, CI/CD |
| Team Lead / QA | Planning, code review, testing strategy |

---

## 2. ช่องทางการสื่อสาร

| ช่องทาง | วัตถุประสงค์ | เวลาตอบ |
|---------|------------|---------|
| **LINE Group** | แจ้งข่าวด่วน, บล็อกเข้าทำงานไม่ได้, นัดหมายด่วน | ภายใน 2 ชั่วโมง |
| **GitHub Issues** | รายงาน bug, feature request, ติดตามงาน | ภายใน 1 วันทำการ |
| **GitHub PR Comments** | Code review, ข้อเสนอแนะเฉพาะโค้ด | ภายใน 2 วันทำการ |
| **GitHub Discussions** | ถกเถียงออกแบบ, decision log | ภายใน 2 วันทำการ |
| **Meeting (on-site/online)** | Sprint planning, retrospective | ตามนัด |

---

## 3. ตารางการประชุม

| การประชุม | ความถี่ | ระยะเวลา | วันเวลา | ผู้รับผิดชอบ |
|-----------|--------|---------|---------|------------|
| **Daily Stand-up** | ทุกวัน | 15 นาที | 09:00 น. | Team Lead หมุนเวียน |
| **Sprint Planning** | ทุก 2 สัปดาห์ | 1 ชั่วโมง | วันจันทร์ต้น Sprint | Team Lead |
| **Sprint Review** | ทุก 2 สัปดาห์ | 30 นาที | วันศุกร์ท้าย Sprint | ทุกคน |
| **Sprint Retrospective** | ทุก 2 สัปดาห์ | 30 นาที | วันศุกร์ท้าย Sprint | Team Lead |
| **Code Review Session** | ตามต้องการ | 45 นาที | ตามนัด | Senior developer |

### รูปแบบ Daily Stand-up (3 คำถาม)
1. **เมื่อวานทำอะไร?** — งานที่ทำเสร็จ
2. **วันนี้จะทำอะไร?** — งานที่วางแผน
3. **มีบล็อกอะไรไหม?** — ปัญหาที่ต้องการความช่วยเหลือ

---

## 4. นโยบาย Git / GitHub

### Commit
- Commit ทุกครั้งที่งานหน่วยย่อยเสร็จ (ไม่เก็บสะสม)
- ใช้รูปแบบ commit message ตาม [Coding_Standards.md](../Coding_Standards.md#9-git--commit-message)

### Branch
- สร้าง branch ใหม่ทุกครั้งสำหรับ feature หรือ fix
- ตั้งชื่อตามรูปแบบ: `feature/us-07-event-registration`, `fix/date-format-bug`
- ลบ branch หลัง merge แล้ว

### Pull Request
- PR ทุกอันต้องผ่าน review อย่างน้อย 1 คน ก่อน merge
- ใช้ [PR Template](.github/pull_request_template.md) ทุกครั้ง
- Merge เฉพาะเมื่อ CI ผ่านและได้รับ approve

### Branch Protection (main)
- ห้าม push ตรง `main`
- ต้องการ 1 reviewer approval
- CI ต้องผ่านก่อน merge

---

## 5. การแจ้งปัญหาและบล็อก

**ถ้าบล็อกทำงานไม่ได้:**
1. แจ้งใน LINE Group ทันที พร้อมอธิบายปัญหา
2. ถ้าไม่แก้ได้ภายใน 2 ชั่วโมง — แจ้ง Team Lead โดยตรง
3. เปิด GitHub Issue พร้อม label `blocked`

**ถ้าพบ Bug ใน production หรือ develop:**
1. เปิด GitHub Issue ทันที ใส่ label `bug` + `priority: high`
2. แจ้งใน LINE Group
3. Assign ให้ผู้รับผิดชอบทันที

---

## 6. การตัดสินใจ (Decision Log)

ทุกการตัดสินใจสำคัญทางเทคนิคต้องบันทึกใน **GitHub Discussion** หรือ commit message พร้อม context:

- อะไรที่ถูกตัดสินใจ
- ทำไมถึงตัดสินใจแบบนี้ (alternatives ที่พิจารณา)
- ผลกระทบที่คาดว่าจะเกิด

---

## 7. SLA (Service Level Agreement)

| สถานการณ์ | เวลาตอบสนองสูงสุด |
|-----------|------------------|
| ตอบ PR review comment | 2 วันทำการ |
| แก้ไข requested changes ใน PR | 2 วันทำการ |
| ตอบคำถามใน GitHub Issue | 1 วันทำการ |
| แก้ไข Critical bug | ภายใน 4 ชั่วโมง |
| แก้ไข High priority bug | ภายใน 1 วันทำการ |

