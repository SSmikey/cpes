import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import StudentModel from "@/models/Student";
import EvaluationFormModel from "@/models/EvaluationForm";
import EvaluationModel from "@/models/Evaluation";
import type { Project, Student, EvaluationForm, Evaluation } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function toProject(doc: Record<string, unknown>): Project {
  return {
    id: doc.id as string,
    name: doc.name as string,
  };
}

function toStudent(doc: Record<string, unknown>): Student {
  return {
    student_id: doc.student_id as string,
    name: doc.name as string,
    year: doc.year as number,
    own_group: doc.own_group as string,
    evaluated_projects: (doc.evaluated_projects as string[]) ?? [],
    created_at:
      doc.created_at instanceof Date
        ? doc.created_at.toISOString()
        : String(doc.created_at),
  };
}

function toForm(doc: Record<string, unknown>): EvaluationForm {
  const questions = (doc.questions as Array<Record<string, unknown>>) ?? [];
  return {
    form_id: doc.form_id as string,
    title: doc.title as string,
    active: doc.active as boolean,
    scale: doc.scale as { min: number; max: number },
    deadline: doc.deadline
      ? new Date(doc.deadline as string | Date).toISOString()
      : null,
    questions: questions.map((q) => ({
      id: q.id as string,
      text: q.text as string,
      order: q.order as number,
      active: q.active as boolean,
    })),
  };
}

function toEvaluation(doc: Record<string, unknown>): Evaluation {
  const raw = doc.answers;
  const answers: Record<string, number> =
    raw instanceof Map
      ? Object.fromEntries(raw)
      : (raw as Record<string, number>);
  return {
    evaluation_id: doc.evaluation_id as string,
    form_id: doc.form_id as string,
    student_id: doc.student_id as string,
    project_id: doc.project_id as string,
    answers,
    submitted_at:
      doc.submitted_at instanceof Date
        ? doc.submitted_at.toISOString()
        : String(doc.submitted_at),
  };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  await connectDB();
  const docs = await ProjectModel.find({}).lean();
  return docs.map((d) => toProject(d as unknown as Record<string, unknown>));
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  await connectDB();
  const docs = await StudentModel.find({}).lean();
  return docs.map((d) => toStudent(d as unknown as Record<string, unknown>));
}

export async function getStudentById(student_id: string): Promise<Student | undefined> {
  await connectDB();
  const doc = await StudentModel.findOne({ student_id }).lean();
  return doc ? toStudent(doc as unknown as Record<string, unknown>) : undefined;
}

export async function upsertStudent(student: Student): Promise<void> {
  await connectDB();
  await StudentModel.findOneAndUpdate(
    { student_id: student.student_id },
    {
      $set: {
        name: student.name,
        year: student.year,
        own_group: student.own_group,
        evaluated_projects: student.evaluated_projects,
        created_at: new Date(student.created_at),
      },
    },
    { upsert: true, new: true }
  );
}

// ─── Evaluation Forms ─────────────────────────────────────────────────────────

export async function getForms(): Promise<EvaluationForm[]> {
  await connectDB();
  const docs = await EvaluationFormModel.find({}).lean();
  return docs.map((d) => toForm(d as unknown as Record<string, unknown>));
}

export async function getActiveForm(): Promise<EvaluationForm | undefined> {
  await connectDB();
  const doc = await EvaluationFormModel.findOne({ active: true }).lean();
  return doc ? toForm(doc as unknown as Record<string, unknown>) : undefined;
}

export async function getFormById(form_id: string): Promise<EvaluationForm | undefined> {
  await connectDB();
  const doc = await EvaluationFormModel.findOne({ form_id }).lean();
  return doc ? toForm(doc as unknown as Record<string, unknown>) : undefined;
}

// ─── Evaluations ──────────────────────────────────────────────────────────────

export async function getEvaluations(): Promise<Evaluation[]> {
  await connectDB();
  const docs = await EvaluationModel.find({}).lean();
  return docs.map((d) => toEvaluation(d as unknown as Record<string, unknown>));
}

export async function addEvaluation(evaluation: Evaluation): Promise<void> {
  await connectDB();
  await EvaluationModel.create({
    evaluation_id: evaluation.evaluation_id,
    form_id: evaluation.form_id,
    student_id: evaluation.student_id,
    project_id: evaluation.project_id,
    answers: new Map(Object.entries(evaluation.answers)),
    submitted_at: new Date(evaluation.submitted_at),
  });
}

export async function hasEvaluated(
  student_id: string,
  project_id: string,
  form_id: string
): Promise<boolean> {
  await connectDB();
  const count = await EvaluationModel.countDocuments({
    student_id,
    project_id,
    form_id,
  });
  return count > 0;
}
