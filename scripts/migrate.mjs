/**
 * migrate.mjs — ย้ายข้อมูลจาก JSON files ไป MongoDB Atlas
 *
 * รันด้วย:
 *   node --env-file=.env.local scripts/migrate.mjs
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../src/data");

// ─── Inline schemas (ไม่ต้อง compile TypeScript) ─────────────────────────────

const ProjectSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
});

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, unique: true },
  name: String,
  year: Number,
  own_group: String,
  evaluated_projects: [String],
  created_at: Date,
});

const QuestionSchema = new mongoose.Schema(
  { id: String, text: String, order: Number, active: Boolean },
  { _id: false }
);

const EvaluationFormSchema = new mongoose.Schema({
  form_id: { type: String, unique: true },
  title: String,
  active: Boolean,
  scale: { min: Number, max: Number },
  deadline: Date,
  questions: [QuestionSchema],
});

const EvaluationSchema = new mongoose.Schema({
  evaluation_id: { type: String, unique: true },
  form_id: String,
  student_id: String,
  project_id: String,
  answers: { type: Map, of: Number },
  submitted_at: Date,
});
EvaluationSchema.index(
  { student_id: 1, project_id: 1, form_id: 1 },
  { unique: true }
);

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String,
  created_at: Date,
});

const Project = mongoose.model("Project", ProjectSchema);
const Student = mongoose.model("Student", StudentSchema);
const EvaluationForm = mongoose.model("EvaluationForm", EvaluationFormSchema);
const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
const User = mongoose.model("User", UserSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ─── Migration ────────────────────────────────────────────────────────────────

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI ไม่พบใน environment");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  // 1. Projects
  const projects = readJson("projects.json");
  let count = 0;
  for (const p of projects) {
    await Project.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true });
    count++;
  }
  console.log(`📦 Projects: migrated ${count} records`);

  // 2. Students
  const students = readJson("students.json");
  count = 0;
  for (const s of students) {
    await Student.findOneAndUpdate(
      { student_id: s.student_id },
      { ...s, created_at: new Date(s.created_at) },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`🎓 Students: migrated ${count} records`);

  // 3. EvaluationForms
  const forms = readJson("evaluation_forms.json");
  count = 0;
  for (const f of forms) {
    await EvaluationForm.findOneAndUpdate(
      { form_id: f.form_id },
      { ...f, deadline: f.deadline ? new Date(f.deadline) : null },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`📋 EvaluationForms: migrated ${count} records`);

  // 4. Evaluations
  const evaluations = readJson("evaluations.json");
  count = 0;
  for (const e of evaluations) {
    await Evaluation.findOneAndUpdate(
      { evaluation_id: e.evaluation_id },
      {
        ...e,
        answers: new Map(Object.entries(e.answers)),
        submitted_at: new Date(e.submitted_at),
      },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`📝 Evaluations: migrated ${count} records`);

  // 5. Users — hash plain-text passwords จาก users.json
  const users = readJson("users.json");
  count = 0;
  for (const u of users) {
    const username = u.username.toLowerCase().trim();
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`   ⚠️  User "${username}" มีอยู่แล้วใน MongoDB — ข้าม`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 12);
    await User.create({
      username,
      password: hashed,
      role: u.role ?? "staff",
      created_at: new Date(),
    });
    console.log(`   ✅ User "${username}" (role: ${u.role}) — hash password แล้ว`);
    count++;
  }
  console.log(`👤 Users: created ${count} new records`);

  await mongoose.disconnect();
  console.log("\n🎉 Migration เสร็จสมบูรณ์!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
