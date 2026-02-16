import fs from "fs";
import path from "path";
import type { Project, Student, EvaluationForm, Evaluation } from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Projects
export function getProjects(): Project[] {
  return readJson<Project[]>("projects.json");
}

export function saveProjects(projects: Project[]): void {
  writeJson("projects.json", projects);
}

// Students
export function getStudents(): Student[] {
  return readJson<Student[]>("students.json");
}

export function saveStudents(students: Student[]): void {
  writeJson("students.json", students);
}

export function getStudentById(student_id: string): Student | undefined {
  return getStudents().find((s) => s.student_id === student_id);
}

export function upsertStudent(student: Student): void {
  const students = getStudents();
  const index = students.findIndex((s) => s.student_id === student.student_id);
  if (index === -1) {
    students.push(student);
  } else {
    students[index] = student;
  }
  saveStudents(students);
}

// Evaluation Forms
export function getForms(): EvaluationForm[] {
  return readJson<EvaluationForm[]>("evaluation_forms.json");
}

export function saveForms(forms: EvaluationForm[]): void {
  writeJson("evaluation_forms.json", forms);
}

export function getActiveForm(): EvaluationForm | undefined {
  return getForms().find((f) => f.active === true);
}

export function getFormById(form_id: string): EvaluationForm | undefined {
  return getForms().find((f) => f.form_id === form_id);
}

// Evaluations
export function getEvaluations(): Evaluation[] {
  return readJson<Evaluation[]>("evaluations.json");
}

export function saveEvaluations(evaluations: Evaluation[]): void {
  writeJson("evaluations.json", evaluations);
}

export function addEvaluation(evaluation: Evaluation): void {
  const evaluations = getEvaluations();
  evaluations.push(evaluation);
  saveEvaluations(evaluations);
}

export function hasEvaluated(
  student_id: string,
  project_id: string,
  form_id: string
): boolean {
  return getEvaluations().some(
    (e) =>
      e.student_id === student_id &&
      e.project_id === project_id &&
      e.form_id === form_id
  );
}
