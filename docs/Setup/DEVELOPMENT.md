# Development Guide — ระบบจัดการกิจกรรมมหาวิทยาลัย

คู่มือนี้อธิบายวิธีติดตั้งและรันระบบในเครื่อง Development

---

## Prerequisites

| Tool | Version ขั้นต่ำ | ดาวน์โหลด |
|------|--------------|---------|
| Node.js | 18.x LTS+ | https://nodejs.org |
| npm | 9.x+ | มาพร้อม Node.js |
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Git | 2.x+ | https://git-scm.com |

---

## 1. Clone Repository

```bash
git clone <repository-url>
cd ระบบจัดการกิจกรรมมหาวิทยาลัย
```

---

## 2. ตั้งค่า Environment Variables

คัดลอกไฟล์ template:

```bash
# Windows
copy backend\.env.example backend\.env

# macOS / Linux
cp backend/.env.example backend/.env
```

แก้ไขค่าใน `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3307          # port บน host ที่ expose จาก Docker
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=university_events_db
PORT=5001
JWT_SECRET=your_strong_random_secret_here
NODE_ENV=development
```
---

## 3. เริ่ม Database (Docker)

```bash
docker compose up -d
```

ตรวจสอบว่า container ทำงาน:

```bash
docker ps
# ควรเห็น: mysql-db (healthy) และ phpmyadmin
```

เข้า phpMyAdmin: http://localhost:8080  
- Server: `mysql-db`  
- Username: `root`  
- Password: ค่าที่ตั้งใน `.env`

---

## 4. ตั้งค่าฐานข้อมูล

### วิธีที่ 1 — ผ่าน phpMyAdmin
1. เปิด http://localhost:8080
2. Import `backend/database/schema.sql`
3. Import `backend/database/seeds.sql` (ข้อมูลตัวอย่าง)

### วิธีที่ 2 — ผ่าน setup.sh (macOS/Linux)
```bash
bash setup.sh
```

### วิธีที่ 3 — ผ่าน MySQL CLI
```bash
mysql -h 127.0.0.1 -P 3307 -u root -p < backend/database/schema.sql
mysql -h 127.0.0.1 -P 3307 -u root -p university_events_db < backend/database/seeds.sql
```

---

## 5. ติดตั้ง Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 6. รันระบบ

เปิด Terminal 2 หน้าต่าง:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# Server รันที่ http://localhost:5001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Vite dev server รันที่ http://localhost:5173
```

เปิดเบราว์เซอร์ไปที่ **http://localhost:5173**

---

## 7. ทดสอบ API

ตรวจสอบ health check:
```bash
curl http://localhost:5001/api/health
# {"success":true,"message":"API is running"}
```

### ข้อมูล Seeds สำหรับทดสอบ

| Role | Email | Password |
|------|-------|---------|
| ADMIN | admin@university.ac.th | Password123 |
| LECTURER | somchai@university.ac.th | Password123 |
| LECTURER | wipawadee@university.ac.th | Password123 |
| STUDENT | piya@student.university.ac.th | Password123 |
| STUDENT | napa@student.university.ac.th | Password123 |

---

## 8. โครงสร้างโปรเจกต์

```
project/
├── backend/
│   ├── src/
│   │   ├── app.js              — Express app setup
│   │   ├── server.js           — Server entry point
│   │   ├── config/             — DB, env config
│   │   ├── controllers/        — Business logic
│   │   ├── middlewares/        — Auth, role, error
│   │   ├── routes/             — Route definitions
│   │   ├── validators/         — Zod schemas
│   │   └── utils/              — Helpers (JWT, ApiError)
│   ├── database/
│   │   ├── schema.sql          — DB schema
│   │   └── seeds.sql           — Sample data
│   ├── .env.example            — Template env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js       — Axios instance
│   │   ├── context/            — AuthContext
│   │   ├── pages/              — Route pages
│   │   └── components/         — Reusable components
│   └── package.json
│
├── docs/                       — Project documentation
├── .github/                    — PR template, CI workflows
├── docker-compose.yml          — MySQL + phpMyAdmin
├── setup.sh                    — One-command setup
└── Coding_Standards.md
```

---

## 9. คำสั่ง npm ที่ใช้บ่อย

### Backend
```bash
npm start          # รัน production mode (nodemon)
npm test           # รัน test suite
npm run lint       # ตรวจ ESLint
```

### Frontend
```bash
npm run dev        # Vite dev server (hot reload)
npm run build      # Build สำหรับ production
npm run preview    # Preview production build
npm run lint       # ตรวจ ESLint
```

---

## 10. แก้ปัญหาที่พบบ่อย

### ❌ `ECONNREFUSED` เชื่อมต่อ DB ไม่ได้
- ตรวจว่า Docker container `mysql-db` รันอยู่: `docker ps`
- ตรวจ `DB_PORT` ใน `.env` ตรงกับ port ที่ expose
- รอ MySQL พร้อม: `docker logs mysql-db`

### ❌ `Invalid token` หรือ `Unauthorized`
- ตรวจว่า `JWT_SECRET` ใน `.env` ตั้งค่าแล้ว
- Token อาจหมดอายุ — login ใหม่

### ❌ Frontend ไม่เชื่อม Backend
- ตรวจ `VITE_API_URL` หรือ default ใน `frontend/src/api/client.js`
- Backend ต้องรันที่ port 5001 ก่อน

### ❌ `ERR_REQUIRE_ESM` หรือ module error
- ตรวจ Node.js version: `node -v` (ต้องการ 18+)
- ลบและติดตั้งใหม่: `rm -rf node_modules && npm install`
