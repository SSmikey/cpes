Classroom Project Evaluation System (CPES)

🏗 1️⃣ System Overview
โครงสร้างหลัก

Student → One Page Application

Admin → Dashboard + Form Management

Data Storage → JSON-based

Evaluation → Dynamic Form

Statistics → Form-based Aggregation

👩‍🎓 2️⃣ ฝั่ง Student (One Page)
STEP 1: Registration

กรอก:

student_id

name

year

own_group

ระบบทำ

ตรวจ student_id ซ้ำ

ถ้าไม่มี → สร้าง record

ถ้ามี → ดึง evaluated_projects

STEP 2: Load Active Form

ดึง form ที่ active = true

Render เฉพาะ questions ที่ active = true

ใช้ scale จาก form

STEP 3: Project Selection

แสดงทุก project

Logic:

ถ้า project_id == own_group → disable

ถ้า project อยู่ใน evaluated_projects → disable

อื่น ๆ → กดประเมินได้

STEP 4: Evaluation Submit

Backend Validate:

form_id ต้อง active

student มีอยู่จริง

ห้ามประเมินกลุ่มตัวเอง

ห้ามประเมินซ้ำ

answers ต้องครบทุก question ที่ active

score อยู่ใน scale

ถ้าผ่าน:

บันทึก evaluation

update evaluated_projects

STEP 5: Progress

แสดง:

คุณประเมินแล้ว X / (total_projects - 1)

👨‍🏫 3️⃣ ฝั่ง Admin
A) Dashboard
เลือก Form ก่อน (Dropdown)

แสดง:

รายชื่อกลุ่ม

จำนวนผู้ประเมิน

Mean รวม

SD รวม

Mean รายข้อ

SD รายข้อ

Monitoring Student

| student_id | own_group | evaluated_count | complete? |

complete = evaluated_count == total_projects - 1

B) Form Management
1. ดูรายการ Form

| title | active | action |

2. สร้าง Form ใหม่

title

scale (min, max)

เพิ่มคำถาม

active = false default

3. Clone Form

copy questions

เปลี่ยน title

save เป็นชุดใหม่

4. Activate Form

ต้องมี active ได้แค่ 1 ชุด

auto deactivate ชุดเก่า

5. แก้ไขคำถาม

เปลี่ยน text

เปลี่ยนลำดับ

active/inactive (soft delete เท่านั้น)

❌ ห้าม hard delete ถ้ามี evaluation แล้ว

📦 4️⃣ Data Model Final
projects.json
[
  { "id": "group1", "name": "Smart Dorm" }
]

students.json
{
  "student_id": "65012345",
  "name": "Somjeed",
  "year": 3,
  "own_group": "group3",
  "evaluated_projects": ["group1"],
  "created_at": ""
}

evaluation_forms.json
{
  "form_id": "form_2026",
  "title": "แบบประเมินปี 2569",
  "active": true,
  "scale": { "min": 1, "max": 5 },
  "questions": [
    {
      "id": "q1",
      "text": "ความชัดเจนของแนวคิด",
      "order": 1,
      "active": true
    }
  ]
}

evaluations.json
{
  "evaluation_id": "uuid",
  "form_id": "form_2026",
  "student_id": "65012345",
  "project_id": "group1",
  "answers": {
    "q1": 5,
    "q2": 4
  },
  "submitted_at": ""
}

📊 5️⃣ Statistics Engine

Aggregation ต้องใช้:

filter by form_id
filter by project_id


สำหรับแต่ละ question:

mean = sum(scores) / n
sd = sqrt( Σ(x-mean)^2 / n )


⚠ ถ้า question inactive แต่มีข้อมูลเก่า → ยังต้องคำนวณได้

🔐 6️⃣ Business Rules (สำคัญมาก)

1 student ประเมิน 1 project ได้เพียง 1 ครั้ง

ห้ามประเมิน own_group

1 form active ได้เพียง 1 ชุด

ห้ามลบ question ที่มีข้อมูล

Evaluation ต้องผูกกับ form_id เสมอ

Statistics ต้องแยกตาม form

🌐 7️⃣ API Endpoints
Student

POST /api/register

GET /api/active-form

GET /api/projects

POST /api/evaluate

Admin

GET /api/forms

POST /api/forms

PUT /api/forms/:id

POST /api/forms/:id/activate

GET /api/stats?form_id=

GET /api/students

🎯 8️⃣ System Strength หลังปรับปรุง

Dynamic Form

Multi Form Support

Single Active Control

Historical Data Preserved

Statistical Separation

Soft Delete Safe

Anti-self-evaluation

Anti-duplicate

ระดับโปรเจคตอนนี้ = 9.5/10 จริง ๆ

🚀 ถ้าจะเพิ่มอีกเล็กน้อย (Optional Enhancement)

Role-based access สำหรับ admin

Export CSV

Ranking table

Timestamp analysis

Lock evaluation หลัง deadline