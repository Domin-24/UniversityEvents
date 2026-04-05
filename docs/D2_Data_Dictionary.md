# D2 Data Dictionary

## users
| Column | Type | Null | Key | Description |
|---|---|---|---|---|
| user_id | INT | NO | PK | รหัสผู้ใช้ |
| name | VARCHAR(120) | NO |  | ชื่อผู้ใช้ |
| email | VARCHAR(190) | NO | UNIQUE | อีเมลผู้ใช้ |
| password | VARCHAR(255) | NO |  | รหัสผ่านแบบ hash |
| role | ENUM('STUDENT','LECTURER','ADMIN') | NO |  | บทบาทผู้ใช้ |
| created_at | TIMESTAMP | YES |  | วันที่สร้างข้อมูล |

## events
| Column | Type | Null | Key | Description |
|---|---|---|---|---|
| event_id | INT | NO | PK | รหัสกิจกรรม |
| create_by | INT | NO | FK(users.user_id) | ผู้สร้างกิจกรรม |
| title | VARCHAR(255) | NO |  | ชื่อกิจกรรม |
| description | TEXT | YES |  | รายละเอียดกิจกรรม |
| event_date | DATETIME | NO |  | วันเวลาเริ่มกิจกรรม |
| location | VARCHAR(255) | NO |  | สถานที่ |
| max_participants | INT | NO |  | จำนวนผู้เข้าร่วมสูงสุด |
| approval_status | ENUM('PENDING','APPROVED','REJECTED') | NO |  | สถานะการอนุมัติ |
| event_status | ENUM('OPEN','FULL','CLOSED','CANCELLED') | NO |  | สถานะกิจกรรม |
| created_at | TIMESTAMP | YES |  | วันที่สร้าง |
| updated_at | TIMESTAMP | YES |  | วันที่แก้ไขล่าสุด |

## registrations
| Column | Type | Null | Key | Description |
|---|---|---|---|---|
| reg_id | INT | NO | PK | รหัสการลงทะเบียน |
| user_id | INT | NO | FK(users.user_id) | ผู้ลงทะเบียน |
| event_id | INT | NO | FK(events.event_id) | กิจกรรมที่ลงทะเบียน |
| register_date | DATETIME | YES |  | วันที่ลงทะเบียน |
| status | ENUM('REGISTERED','CANCELLED','WAITLISTED') | NO |  | สถานะการลงทะเบียน |
| check_in_time | DATETIME | YES |  | เวลาเช็กอิน |
| check_status | BOOLEAN | NO |  | สถานะเช็กอิน |

Constraint สำคัญ:
- UNIQUE(user_id, event_id)

## approvals
| Column | Type | Null | Key | Description |
|---|---|---|---|---|
| approval_id | INT | NO | PK | รหัสการอนุมัติ |
| event_id | INT | NO | FK(events.event_id) | กิจกรรมที่ถูกพิจารณา |
| approved_by | INT | NO | FK(users.user_id) | ผู้อนุมัติ/ปฏิเสธ |
| status | ENUM('APPROVED','REJECTED') | NO |  | ผลการพิจารณา |
| remark | TEXT | YES |  | หมายเหตุ |
| approved_at | TIMESTAMP | YES |  | วันที่พิจารณา |

## feedback
| Column | Type | Null | Key | Description |
|---|---|---|---|---|
| feedback_id | INT | NO | PK | รหัสความคิดเห็น |
| user_id | INT | NO | FK(users.user_id) | ผู้ให้ feedback |
| event_id | INT | NO | FK(events.event_id) | กิจกรรมที่ให้ feedback |
| rating | INT | NO |  | คะแนน 1-5 |
| comment_text | TEXT | YES |  | ความคิดเห็น |
| created_at | TIMESTAMP | YES |  | วันที่บันทึก |

Constraint สำคัญ:
- CHECK rating >= 1 AND rating <= 5
- UNIQUE(user_id, event_id)
