# Security Assessment Report

## Project
ระบบจัดการกิจกรรมมหาวิทยาลัย (Event Management System)

## Assessment Info
- Assessment Date: 2026-04-04
- Assessor: QA / DevOps Team
- Scope: Backend API, Frontend dependencies, authentication flow, input validation
  - คำอธิบาย: ประเมินเฉพาะความปลอดภัยในโค้ดและ dependency ของระบบปัจจุบัน
- Method: Source review + dependency audit + configuration review
  - คำอธิบาย: ตรวจโค้ดจริง + รันเครื่องมือ audit + เช็กการตั้งค่าพื้นฐาน

## 1. Scope and Criteria (ขอบเขตและเกณฑ์)

### In Scope
- Authentication and authorization controls
- Input validation and SQL injection prevention
- Dependency vulnerability posture
- API security middleware baseline

- ตรวจเรื่องการล็อกอิน/สิทธิ์การเข้าถึง
- ตรวจการป้องกันข้อมูล input ผิดรูปแบบและ SQL Injection
- ตรวจช่องโหว่จากแพ็กเกจที่ใช้งาน
- ตรวจ middleware ด้านความปลอดภัยพื้นฐานของ API

### Out of Scope
- Full penetration testing
- Dynamic application security testing (DAST) with external scanner
- Infrastructure/cloud hardening (production)

- ยังไม่ได้ทำ penetration test เต็มรูปแบบ
- ยังไม่ได้สแกนแบบ DAST ด้วยเครื่องมือภายนอก
- ยังไม่รวมการ hardening ระดับ production/cloud

## 2. Evidence Collected (หลักฐานที่เก็บ)

### Source Code Review
- Helmet and CORS middleware enabled in `backend/src/app.js`
- JWT token verification in `backend/src/middlewares/auth.js`
- Password hashing and verification using `bcryptjs` in `backend/src/controllers/auth.controller.js`
- Parameterized SQL queries used in auth flow in `backend/src/controllers/auth.controller.js`

- มีเกราะพื้นฐานด้าน HTTP security (`helmet`)
- มีการตรวจ JWT ก่อนเข้า endpoint ที่ต้องล็อกอิน
- รหัสผ่านไม่เก็บแบบ plain text (hash ด้วย bcrypt)
- query ฝั่ง auth ใช้ parameterized query

### Dependency Audits
Commands executed:

```bash
cd backend
npm audit --audit-level=moderate --json

cd ../frontend
npm audit --audit-level=moderate --json
```

หมายเหตุ: คำสั่ง audit อาจคืนค่า exit code = 1 เมื่อพบช่องโหว่ (ถือว่าเป็นพฤติกรรมปกติของ npm audit)

## 3. Findings Summary (สรุปผลที่พบ)

### 3.1 Backend Dependency Findings
- Total vulnerabilities: 3
- High: 2
- Moderate: 1
- Critical: 0

Packages flagged:
- `path-to-regexp` (high/moderate, ReDoS/DoS advisory)
- `picomatch` (high/moderate)
- `brace-expansion` (moderate)

คำอธิบายภาษาไทย:
- ฝั่ง backend ยังมีช่องโหว่ระดับสูง 2 รายการ ต้องแก้ก่อนส่ง production

### 3.2 Frontend Dependency Findings
- Total vulnerabilities: 2
- High: 1
- Moderate: 1
- Critical: 0

Packages flagged:
- `picomatch` (high/moderate)
- `brace-expansion` (moderate)

คำอธิบายภาษาไทย:
- ฝั่ง frontend ยังมีช่องโหว่ระดับสูง 1 รายการ ควรอัปเดต dependency

### 3.3 Security Control Observations
- Strengths:
  - JWT-based authentication exists
  - Role-based access control exists via middleware and route guards
  - Parameterized query pattern exists (reduces SQL injection risk)
  - Passwords are hashed with bcrypt
- Gaps:
  - No dedicated security test report file before this assessment
  - Dependency vulnerabilities remain unresolved
  - No explicit rate limiting middleware found in current backend app initialization

- จุดแข็ง: โครง auth และการป้องกัน SQL injection มีแล้ว
- ช่องว่าง: dependency ยังมีช่องโหว่ และยังไม่เห็น rate limiting ชัดเจนใน app initialization

## 4. Risk Rating (ระดับความเสี่ยง)

- Current Overall Security Risk: Medium
- Rationale:
  - No critical vulnerabilities reported
  - High severity dependency issues still open
  - Core auth and query security controls are present

- ภาพรวมอยู่ระดับกลาง เพราะไม่มี critical แต่ยังมี high ที่ต้องปิด

## 5. Remediation Plan (แผนแก้ไข)

### Priority 1 (High)
1. Upgrade vulnerable dependency tree (backend/frontend) using safe updates.
2. Re-run `npm audit` until high vulnerabilities are removed or documented with justification.

### Priority 2 (Medium)
1. Add API rate limiting middleware for `/api/auth` and high-traffic endpoints.
2. Add dedicated security test cases (auth abuse, input tampering, role escalation attempts).

### Priority 3 (Hardening)
1. Add CI gate for vulnerability threshold (fail on high/critical).
2. Add periodic dependency audit task in CI schedule.

คำแนะนำภาษาไทยแบบสั้น:
- ทำ Priority 1 ก่อนเสมอ เพราะกระทบคะแนนและความปลอดภัยโดยตรง
- เมื่อแก้แล้วให้แนบผล audit รอบใหม่ในรายงานนี้ทันที

## 6. Re-test Checklist (เช็กลิสต์ทดสอบซ้ำ)

- [ ] Backend `npm audit` high = 0
- [ ] Frontend `npm audit` high = 0
- [ ] Rate limiting enabled and verified
- [ ] Security tests added and passing
- [ ] CI security gate enabled

## 7. Conclusion 

Security assessment has been performed and documented. Baseline application security controls are present, but dependency vulnerabilities (including high severity) must be remediated before claiming production-ready security posture.

สรุป
มีการประเมินความปลอดภัยและบันทึกหลักฐานครบแล้ว ระบบมีพื้นฐานที่ดี แต่ยังต้องปิดช่องโหว่ dependency ระดับสูงก่อน จึงจะถือว่าพร้อมใช้งาน
