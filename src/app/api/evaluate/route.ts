import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getActiveForm,
  getStudentById,
  addEvaluation,
  upsertStudent,
  hasEvaluated,
} from "@/lib/data";
import { isDeadlinePassed } from "@/lib/stats";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_id, project_id, answers } = body;

  if (!student_id || !project_id || !answers) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  // 1. ตรวจ active form
  const form = await getActiveForm();
  if (!form) {
    return NextResponse.json(
      { error: "ไม่พบแบบประเมินที่เปิดใช้งาน" },
      { status: 400 }
    );
  }

  // 2. ตรวจ deadline (Enhancement)
  if (isDeadlinePassed(form)) {
    return NextResponse.json(
      { error: "หมดเวลาการประเมินแล้ว" },
      { status: 400 }
    );
  }

  // 3. ตรวจ student มีอยู่จริง
  const student = await getStudentById(String(student_id));
  if (!student) {
    return NextResponse.json(
      { error: "ไม่พบข้อมูลนักศึกษา กรุณาลงทะเบียนก่อน" },
      { status: 400 }
    );
  }

  // 4. ห้ามประเมินกลุ่มตัวเอง
  if (student.own_group === String(project_id)) {
    return NextResponse.json(
      { error: "ไม่สามารถประเมินกลุ่มของตนเองได้" },
      { status: 400 }
    );
  }

  // 5. ห้ามประเมินซ้ำ
  if (await hasEvaluated(String(student_id), String(project_id), form.form_id)) {
    return NextResponse.json(
      { error: "คุณได้ประเมินกลุ่มนี้ไปแล้ว" },
      { status: 400 }
    );
  }

  // 6. ตรวจ answers ครบทุก active question
  const activeQuestions = form.questions.filter((q) => q.active);
  const missingQuestions = activeQuestions.filter(
    (q) => answers[q.id] === undefined || answers[q.id] === null
  );
  if (missingQuestions.length > 0) {
    return NextResponse.json(
      { error: "กรุณาตอบคำถามให้ครบทุกข้อ" },
      { status: 400 }
    );
  }

  // 7. ตรวจ score อยู่ใน scale
  for (const q of activeQuestions) {
    const score = Number(answers[q.id]);
    if (
      isNaN(score) ||
      score < form.scale.min ||
      score > form.scale.max
    ) {
      return NextResponse.json(
        {
          error: `คะแนนต้องอยู่ระหว่าง ${form.scale.min} ถึง ${form.scale.max}`,
        },
        { status: 400 }
      );
    }
  }

  // บันทึก evaluation
  const evaluation = {
    evaluation_id: uuidv4(),
    form_id: form.form_id,
    student_id: String(student_id),
    project_id: String(project_id),
    answers: Object.fromEntries(
      activeQuestions.map((q) => [q.id, Number(answers[q.id])])
    ),
    submitted_at: new Date().toISOString(),
  };

  await addEvaluation(evaluation);

  // อัปเดต evaluated_projects ของ student
  const updatedStudent = {
    ...student,
    evaluated_projects: [...student.evaluated_projects, String(project_id)],
  };
  await upsertStudent(updatedStudent);

  return NextResponse.json({ success: true, evaluation }, { status: 201 });
}
