#!/bin/bash
# ==============================================
# setup.sh — ติดตั้งและเตรียมระบบสำหรับ Development
# ระบบจัดการกิจกรรมมหาวิทยาลัย
# ==============================================

set -e  # หยุดทันทีถ้า command ใดล้มเหลว

echo "======================================"
echo " University Event Management System"
echo " Development Setup Script"
echo "======================================"

# ---- ตรวจสอบ dependencies ----
echo ""
echo "[1/6] ตรวจสอบ dependencies..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js ไม่พบ กรุณาติดตั้ง Node.js 18+ ก่อน"
  exit 1
fi
NODE_VERSION=$(node -v)
echo "  ✅ Node.js: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
  echo "❌ npm ไม่พบ"
  exit 1
fi
echo "  ✅ npm: $(npm -v)"

if ! command -v docker &> /dev/null; then
  echo "⚠️  Docker ไม่พบ — ข้าม Docker setup (ต้องตั้งค่า DB ด้วยตัวเอง)"
  DOCKER_AVAILABLE=false
else
  echo "  ✅ Docker: $(docker -v)"
  DOCKER_AVAILABLE=true
fi

# ---- ติดตั้ง backend dependencies ----
echo ""
echo "[2/6] ติดตั้ง backend dependencies..."
cd backend
npm install
echo "  ✅ backend/node_modules พร้อมแล้ว"
cd ..

# ---- ติดตั้ง frontend dependencies ----
echo ""
echo "[3/6] ติดตั้ง frontend dependencies..."
cd frontend
npm install
echo "  ✅ frontend/node_modules พร้อมแล้ว"
cd ..

# ---- ตั้งค่า .env ----
echo ""
echo "[4/6] ตั้งค่า .env..."
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "  ✅ สร้าง backend/.env จาก .env.example แล้ว"
  echo "  ⚠️  กรุณาแก้ไขค่าใน backend/.env ให้ถูกต้องก่อนรันระบบ"
else
  echo "  ✅ backend/.env มีอยู่แล้ว ข้าม"
fi

# ---- เริ่ม Docker (ถ้ามี) ----
echo ""
echo "[5/6] เริ่ม Docker services..."
if [ "$DOCKER_AVAILABLE" = true ]; then
  docker compose up -d
  echo "  ✅ Docker containers เริ่มแล้ว"
  echo "  ⏳ รอ MySQL พร้อม..."
  sleep 8

  # ตรวจสอบว่า MySQL พร้อม
  MYSQL_READY=false
  for i in {1..10}; do
    if docker exec mysql-db mysqladmin ping --silent 2>/dev/null; then
      MYSQL_READY=true
      break
    fi
    echo "  รอ MySQL... ($i/10)"
    sleep 3
  done

  if [ "$MYSQL_READY" = false ]; then
    echo "  ⚠️  MySQL ยังไม่พร้อม — ข้ามขั้นตอน DB migration"
  fi
else
  echo "  ⚠️  ข้าม Docker setup"
fi

# ---- รัน Schema + Seeds ----
echo ""
echo "[6/6] ตั้งค่าฐานข้อมูล..."

# โหลดค่า env
if [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | xargs)
fi

DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3307}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-university_events_db}

# ตรวจสอบว่าเชื่อมต่อ MySQL ได้
if command -v mysql &> /dev/null; then
  echo "  รัน schema.sql..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < backend/database/schema.sql 2>/dev/null && \
    echo "  ✅ schema.sql รันสำเร็จ" || echo "  ⚠️  schema.sql ล้มเหลว (อาจรันไปแล้ว)"

  echo "  รัน seeds.sql..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/database/seeds.sql 2>/dev/null && \
    echo "  ✅ seeds.sql รันสำเร็จ" || echo "  ⚠️  seeds.sql ล้มเหลว"
else
  echo "  ⚠️  mysql client ไม่พบ — กรุณารัน schema.sql และ seeds.sql ด้วยตัวเองผ่าน phpMyAdmin"
  echo "     schema: backend/database/schema.sql"
  echo "     seeds:  backend/database/seeds.sql"
fi

# ---- สรุป ----
echo ""
echo "======================================"
echo " ✅ Setup เสร็จสิ้น!"
echo "======================================"
echo ""
echo " วิธีรันระบบ:"
echo "   Backend:  cd backend && npm start    (port 5001)"
echo "   Frontend: cd frontend && npm run dev  (port 5173)"
echo ""
echo " phpMyAdmin: http://localhost:8080"
echo " Frontend:   http://localhost:5173"
echo "======================================"
