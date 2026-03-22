# Coding Standards — ระบบจัดการกิจกรรมมหาวิทยาลัย

> เวอร์ชัน 1.0 | อัปเดตล่าสุด: มีนาคม 2026  
> ทีมทั้งหมดต้องปฏิบัติตามมาตรฐานนี้ก่อน merge โค้ดทุกครั้ง

---

## สารบัญ

1. [การตั้งชื่อ (Naming Conventions)](#1-การตั้งชื่อ-naming-conventions)
2. [โครงสร้างไฟล์และโฟลเดอร์ (File & Folder Structure)](#2-โครงสร้างไฟล์และโฟลเดอร์)
3. [การเขียน JavaScript / Node.js (Backend)](#3-javascript--nodejs-backend)
4. [การเขียน React (Frontend)](#4-react-frontend)
5. [การจัดการ API และ HTTP Response](#5-api-และ-http-response)
6. [การจัดการฐานข้อมูล (Database)](#6-ฐานข้อมูล-database)
7. [ความปลอดภัย (Security)](#7-ความปลอดภัย-security)
8. [การทดสอบ (Testing)](#8-การทดสอบ-testing)
9. [Git & Commit Message](#9-git--commit-message)
10. [Code Review](#10-code-review)

---

## 1. การตั้งชื่อ (Naming Conventions)

### ตัวแปรและฟังก์ชัน
- ใช้ **camelCase** สำหรับตัวแปรและฟังก์ชันทั้งหมด

```js
// ✅ ถูกต้อง
const eventDate = new Date();
function registerForEvent(userId, eventId) { ... }

// ❌ ผิด
const EventDate = new Date();
function Register_For_Event(UserId, EventId) { ... }
```

### คลาสและ Component
- ใช้ **PascalCase** สำหรับคลาสและ React Component

```js
// ✅ ถูกต้อง
class UserService { ... }
function DashboardPage() { return <div>...</div>; }

// ❌ ผิด
class userService { ... }
function dashboardPage() { ... }
```

### ค่าคงที่
- ใช้ **UPPER_SNAKE_CASE** สำหรับค่าคงที่ระดับ module

```js
// ✅ ถูกต้อง
const MAX_PARTICIPANTS = 500;
const JWT_EXPIRES_IN = '7d';

// ❌ ผิด
const maxParticipants = 500;
const jwtExpiresIn = '7d';
```

### ไฟล์
| ประเภท | รูปแบบ | ตัวอย่าง |
|--------|--------|---------|
| Controller | `kebab-case.controller.js` | `event.controller.js` |
| Route | `kebab-case.routes.js` | `event.routes.js` |
| Middleware | `camelCase.js` | `auth.js`, `role.js` |
| React Page | `PascalCase.jsx` | `DashboardPage.jsx` |
| React Component | `PascalCase.jsx` | `ProtectedRoute.jsx` |
| CSS Module | `PascalCase.module.css` | `EventCard.module.css` |

---

## 2. โครงสร้างไฟล์และโฟลเดอร์

```
backend/src/
├── config/        — การตั้งค่าระบบ (db, env)
├── controllers/   — Business logic, ไม่มี SQL ตรงๆ
├── middlewares/   — Express middleware (auth, role, error)
├── routes/        — Route definitions เท่านั้น
├── validators/    — Zod schemas ตรวจ input
└── utils/         — Helper functions ที่ใช้หลายที่

frontend/src/
├── api/           — Axios instance และ API call functions
├── components/    — Reusable components
├── context/       — React Context (AuthContext)
├── pages/         — หน้าแต่ละหน้า (route-level)
└── assets/        — รูปภาพ, icons
```

**กฎ:**
- Controller ห้ามมี SQL query ตรงๆ — ใช้ผ่าน db pool เท่านั้น
- Route file ห้ามมี business logic — เรียก controller เท่านั้น
- ห้าม hardcode ค่า config ใน source code — ใช้ `.env` เสมอ

---

## 3. JavaScript / Node.js (Backend)

### การประกาศตัวแปร
- ใช้ `const` เป็นค่าเริ่มต้น, ใช้ `let` เมื่อต้อง reassign
- ห้ามใช้ `var`

```js
// ✅ ถูกต้อง
const pool = require('../config/db');
const [rows] = await pool.query(sql, params);

// ❌ ผิด
var pool = require('../config/db');
```

### Async / Await
- ใช้ `async/await` เสมอ ห้ามใช้ `.then()` ซ้อนกัน
- ทุก controller function ต้องมี try/catch หรือใช้ error middleware

```js
// ✅ ถูกต้อง
const createEvent = async (req, res, next) => {
  try {
    const [result] = await pool.query(sql, params);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ❌ ผิด
const createEvent = (req, res) => {
  pool.query(sql, params).then(result => {
    pool.query(sql2, params2).then(result2 => { ... });
  });
};
```

### Destructuring
- ใช้ destructuring เมื่อดึงค่าจาก object หรือ array

```js
// ✅ ถูกต้อง
const { userId, role } = req.user;
const [rows] = await pool.query(sql, params);

// ❌ ผิด
const userId = req.user.userId;
const result = await pool.query(sql, params);
const rows = result[0];
```

### Error Handling
- ใช้ `ApiError` class สำหรับ throw error ใน business logic

```js
const ApiError = require('../utils/apiError');

if (!event) {
  throw new ApiError(404, 'Event not found');
}
```

---

## 4. React (Frontend)

### Component Style
- ใช้ **Function Component** เท่านั้น ห้ามใช้ Class Component
- Props ต้องรับผ่าน destructuring

```jsx
// ✅ ถูกต้อง
function EventCard({ title, date, location, onRegister }) {
  return (
    <div className="event-card">
      <h3>{title}</h3>
      <p>{location}</p>
      <button onClick={onRegister}>สมัคร</button>
    </div>
  );
}

// ❌ ผิด
class EventCard extends React.Component { ... }
```

### Hooks
- เรียก hooks ที่ top-level ของ component เท่านั้น
- ใช้ `useCallback` สำหรับ function ที่ถูกส่งเป็น prop หรืออยู่ใน `useEffect` deps
- ใช้ `useMemo` สำหรับ computation ที่ cost สูง

```jsx
// ✅ ถูกต้อง
const loadEvents = useCallback(async () => {
  const res = await apiClient.get('/events');
  setEvents(res.data.data);
}, []);

useEffect(() => { loadEvents(); }, [loadEvents]);
```

### การ Render แบบ Conditional
```jsx
// ✅ ถูกต้อง — ใช้ && หรือ ternary
{isLoggedIn && <UserMenu />}
{loading ? <Spinner /> : <EventList events={events} />}

// ❌ ผิด — ห้ามใช้ if ใน JSX โดยตรง
```

### การจัดการ State
- State ที่ share หลาย component ใช้ Context หรือ prop drilling สูงสุด 2 ระดับ
- ห้าม mutate state โดยตรง

```js
// ✅ ถูกต้อง
setEvents(prev => [...prev, newEvent]);

// ❌ ผิด
events.push(newEvent);
setEvents(events);
```

---

## 5. API และ HTTP Response

### รูปแบบ Response มาตรฐาน

```json
// Success
{
  "success": true,
  "message": "Event created successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Event not found"
}

// List
{
  "success": true,
  "data": [ ... ],
  "total": 25
}
```

### HTTP Status Codes
| Status | ใช้เมื่อ |
|--------|---------|
| 200 | GET, PATCH สำเร็จ |
| 201 | POST สร้างสำเร็จ |
| 400 | Validation error, bad request |
| 401 | ไม่มี token หรือ token ไม่ถูกต้อง |
| 403 | มี token แต่ไม่มีสิทธิ์ |
| 404 | ไม่พบ resource |
| 409 | Conflict (เช่น email ซ้ำ) |
| 500 | Server error |

### Route Naming
```
GET    /api/events              — ดูรายการ
GET    /api/events/:id          — ดูรายการเดียว
POST   /api/events              — สร้าง
PATCH  /api/events/:id          — แก้ไขบางส่วน
DELETE /api/events/:id          — ลบ
POST   /api/events/:id/register — action พิเศษ
```

---

## 6. ฐานข้อมูล (Database)

### SQL Style
- Keywords เป็นตัวใหญ่ทั้งหมด: `SELECT`, `FROM`, `WHERE`, `JOIN`
- ชื่อตารางและคอลัมน์เป็น `snake_case`

```sql
-- ✅ ถูกต้อง
SELECT e.event_id, e.title, COUNT(r.reg_id) AS registered_count
FROM events e
LEFT JOIN registrations r ON r.event_id = e.event_id
  AND r.status = 'REGISTERED'
WHERE e.approval_status = 'APPROVED'
GROUP BY e.event_id;

-- ❌ ผิด
select event_id, title from events where approval_status = 'approved';
```

### Parameterized Queries
- ห้าม string concatenation ใน SQL เด็ดขาด — ใช้ parameterized เสมอ

```js
// ✅ ถูกต้อง
await pool.query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ ผิด (SQL Injection risk!)
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Transaction
- ทุก operation ที่ต้องการ atomicity ต้องใช้ transaction

```js
const conn = await pool.getConnection();
await conn.beginTransaction();
try {
  await conn.query(sql1, params1);
  await conn.query(sql2, params2);
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();
}
```

---

## 7. ความปลอดภัย (Security)

### รหัสผ่าน
- Hash ด้วย `bcryptjs` rounds ≥ 10 เสมอ
- ห้าม log หรือ return password field

```js
// ✅ ถูกต้อง
const hashed = await bcrypt.hash(password, 10);

// SELECT ต้องไม่รวม password
const [rows] = await pool.query(
  'SELECT user_id, name, email, role FROM users WHERE email = ?',
  [email]
);
```

### JWT
- เก็บ secret ใน `.env` เสมอ
- Token expiry ไม่ควรเกิน 7 วัน

### Input Validation
- Validate ทุก user input ด้วย Zod ก่อน controller ทำงาน
- Sanitize ข้อมูลก่อน insert ลง DB

### ข้อมูลลับ
- ห้าม commit ไฟล์ `.env` ลง Git
- ใช้ `.env.example` เป็น template เท่านั้น

---

## 8. การทดสอบ (Testing)

### หลักการ
- ทุก API endpoint ต้องมีอย่างน้อย 1 integration test
- Test ครอบคลุม: happy path, error case, permission check

### โครงสร้าง Test File
```
tests/
├── auth.test.js
├── event.test.js
└── registration.test.js
```

### ตัวอย่าง Test
```js
describe('POST /api/events/:id/register', () => {
  it('should register student successfully', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject non-student role', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${lecturerToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

## 9. Git & Commit Message

### รูปแบบ Commit Message
```
<type>(<scope>): <short description>

[optional body]
```

| Type | ใช้เมื่อ |
|------|---------|
| `feat` | เพิ่ม feature ใหม่ |
| `fix` | แก้ bug |
| `docs` | แก้ documentation |
| `style` | แก้ formatting ไม่มีผลกับ logic |
| `refactor` | ปรับโค้ดโดยไม่เพิ่ม feature หรือแก้ bug |
| `test` | เพิ่ม/แก้ test |
| `chore` | งาน build system, dependencies |

**ตัวอย่าง:**
```
feat(event): add registration cancellation endpoint
fix(auth): handle expired JWT token gracefully
docs(readme): update local setup instructions
test(registration): add full slot rejection test case
```

### Branch Strategy
```
main          — Production-ready code
develop       — Integration branch
feature/*     — Feature branches
fix/*         — Bug fix branches
```

**กฎ:**
- ห้าม push ตรง `main` — ต้องผ่าน PR เท่านั้น
- Branch name ต้องสื่อความหมาย: `feature/event-registration`, `fix/date-format-bug`

---

## 10. Code Review

### ผู้ Review ต้องตรวจ
- [ ] โค้ดตรงตาม Coding Standards นี้
- [ ] ไม่มี hardcoded secrets หรือ credentials
- [ ] SQL ใช้ parameterized query
- [ ] Error handling ครบถ้วน
- [ ] ไม่มี `console.log` debugging ค้างในโค้ด production
- [ ] Test ผ่านทั้งหมด

### SLA
- Review ให้เสร็จภายใน **2 วันทำการ**
- ถ้า approve ต้องมีอย่างน้อย 1 approval จากสมาชิกทีม

---

## Sign-off

| ชื่อ | Role | วันที่ Sign off |
|------|------|----------------|
| | นักพัฒนา Backend | |
| | นักพัฒนา Frontend | |
| | นักพัฒนา DB/DevOps | |
| | Team Lead / QA | |
