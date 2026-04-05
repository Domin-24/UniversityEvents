# Code Review Training Report — ระบบจัดการกิจกรรมมหาวิทยาลัย

**วันที่จัดฝึกอบรม:** มีนาคม 2026  
**ผู้จัด:** Team Lead  
**ผู้เข้าร่วม:** สมาชิกทีมทั้งหมด

---

## 1. วัตถุประสงค์

- ทำความเข้าใจกระบวนการ Code Review ของโปรเจกต์
- ฝึกใช้ Code Review Checklist
- เรียนรู้รูปแบบ Commit Message และ PR ที่ถูกต้อง
- ทบทวน Security Best Practices สำหรับ Node.js + React

---

## 2. หัวข้อที่ครอบคลุม

### 2.1 ทำไม Code Review ถึงสำคัญ
- ป้องกัน bug ก่อน merge
- แชร์ความรู้ระหว่างทีม
- รักษา code quality ให้สม่ำเสมอ
- ลด technical debt ระยะยาว

### 2.2 Coding Standards ของโปรเจกต์
ทบทวน [Coding_Standards.md](../Coding_Standards.md) ครอบคลุม:
- การตั้งชื่อ (camelCase, PascalCase, UPPER_SNAKE_CASE)
- โครงสร้างโฟลเดอร์ backend และ frontend
- Async/await patterns
- SQL parameterized queries
- HTTP response format มาตรฐาน
- Git commit message format

### 2.3 Security Issues ที่ต้องระวัง
| ช่องโหว่ | ตัวอย่าง | วิธีป้องกัน |
|---------|---------|-----------|
| SQL Injection | `WHERE email = '${email}'` | ใช้ parameterized: `WHERE email = ?` |
| Secret ใน Git | commit `.env` | `.gitignore` + `.env.example` |
| Password ไม่ hash | เก็บ plain text | `bcrypt.hash(password, 10)` |
| Missing Auth | route ไม่มี middleware | `requireAuth` + `requireRole` |
| Broken Access Control | student approve event ได้ | `requireRole(['LECTURER','ADMIN'])` |

### 2.4 Workshop — ตรวจหา Issue ใน Code Sample

**Code ที่มีปัญหา (ก่อน):**
```js
// ❌ หลายปัญหา
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const sql = `SELECT * FROM users WHERE email = '${email}'`;  // SQL Injection
  db.query(sql, (err, rows) => {
    if (rows[0].password === password) {  // ไม่ได้ compare hash
      res.json({ token: jwt.sign({ id: rows[0].id }, 'secret') }); // hardcoded secret
    }
  });
});
```

**Code ที่ถูกต้อง (หลัง):**
```js
// ✅ ปลอดภัย
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      'SELECT user_id, email, password, role FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    const token = generateToken({ userId: rows[0].user_id, role: rows[0].role });
    res.json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
};
```

### 2.5 การใช้ Pull Request Template
- ทุก PR ต้องกรอก template ให้ครบ
- อธิบายสิ่งที่เปลี่ยน + วิธีทดสอบ
- ติ๊ก Checklist ก่อน submit

### 2.6 Reviewer Etiquette
- ให้ feedback ที่ constructive ไม่วิจารณ์คน
- ระบุว่า comment ไหน **blocking** vs **suggestion**
- Review ให้เสร็จภายใน 2 วันทำการ

---

## 3. ข้อตกลงที่ทีมตกลงร่วมกัน

หลังจากการฝึกอบรม ทีมตกลงปฏิบัติตามข้อต่อไปนี้:

1. **ทุก PR ต้องผ่าน review อย่างน้อย 1 คน** ก่อน merge เข้า `develop` หรือ `main`
2. **ใช้ Code Review Checklist** ทุกครั้ง ไม่ข้ามขั้นตอน
3. **ห้าม self-merge** (approve และ merge เองโดยไม่มีคนอื่น review)
4. **Security items ใน Checklist เป็น blocking** — ถ้าพบต้องแก้ก่อน merge
5. **Commit Message ต้องตรงรูปแบบ** `type(scope): description`
6. **ถ้าพบ bug ระหว่าง review** — เปิด Issue ใหม่ ไม่รวมแก้ bug ใน PR ที่ไม่เกี่ยวข้อง

---

## 4. ผลการฝึกอบรม

| ชื่อ | เข้าร่วม | Quiz ผ่าน | Sign-off |
|------|---------|---------|---------|
| (นักพัฒนา Backend) | ✅ | ✅ | ✅ |
| (นักพัฒนา Frontend) | ✅ | ✅ | ✅ |
| (นักพัฒนา DB/DevOps) | ✅ | ✅ | ✅ |
| (Team Lead / QA) | ✅ | ✅ | ✅ |

---

## 5. แหล่งศึกษาเพิ่มเติม

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Security vulnerabilities ที่พบบ่อย
- [Conventional Commits](https://www.conventionalcommits.org/) — Commit message standard
- [Google Engineering Practices — Code Review](https://google.github.io/eng-practices/review/)
- [Coding_Standards.md](../Coding_Standards.md) — มาตรฐานของโปรเจกต์นี้
- [Code_Review_Checklist.md](../Code_Review_Checklist.md) — Checklist สำหรับ reviewer
