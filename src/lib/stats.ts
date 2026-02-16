import type {
  EvaluationForm,
  Project,
  ProjectStat,
  QuestionStat,
  StudentMonitor,
} from "@/types";
import { getEvaluations, getStudents } from "@/lib/data";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function sd(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function calcProjectStats(
  form: EvaluationForm,
  project: Project
): ProjectStat {
  const evaluations = getEvaluations().filter(
    (e) => e.form_id === form.form_id && e.project_id === project.id
  );

  // Collect all question ids that appear in any evaluation (including inactive)
  const allQuestionIds = new Set<string>();
  evaluations.forEach((e) => {
    Object.keys(e.answers).forEach((qid) => allQuestionIds.add(qid));
  });

  // Per-question stats — includes inactive questions that still have data
  const per_question: QuestionStat[] = Array.from(allQuestionIds)
    .map((qid) => {
      const scores = evaluations
        .map((e) => e.answers[qid])
        .filter((v) => v !== undefined);

      const question = form.questions.find((q) => q.id === qid);
      return {
        question_id: qid,
        question_text: question?.text ?? qid,
        mean: parseFloat(mean(scores).toFixed(2)),
        sd: parseFloat(sd(scores).toFixed(2)),
        count: scores.length,
      };
    })
    .sort((a, b) => {
      const orderA =
        form.questions.find((q) => q.id === a.question_id)?.order ?? 999;
      const orderB =
        form.questions.find((q) => q.id === b.question_id)?.order ?? 999;
      return orderA - orderB;
    });

  // Overall stats: average of all scores across all questions
  const allScores = evaluations.flatMap((e) => Object.values(e.answers));

  return {
    project_id: project.id,
    project_name: project.name,
    evaluator_count: evaluations.length,
    overall_mean: parseFloat(mean(allScores).toFixed(2)),
    overall_sd: parseFloat(sd(allScores).toFixed(2)),
    per_question,
  };
}

export function calcAllProjectStats(
  form: EvaluationForm,
  projects: Project[]
): ProjectStat[] {
  return projects.map((p) => calcProjectStats(form, p));
}

export function calcStudentMonitor(
  form_id: string,
  total_projects: number
): StudentMonitor[] {
  const students = getStudents();
  const evaluations = getEvaluations().filter((e) => e.form_id === form_id);

  return students.map((student) => {
    const evaluated_count = evaluations.filter(
      (e) => e.student_id === student.student_id
    ).length;

    const to_evaluate = total_projects - 1; // ไม่นับกลุ่มตัวเอง

    return {
      student_id: student.student_id,
      name: student.name,
      own_group: student.own_group,
      evaluated_count,
      total_to_evaluate: to_evaluate,
      complete: evaluated_count >= to_evaluate,
    };
  });
}

export function isDeadlinePassed(form: EvaluationForm): boolean {
  if (!form.deadline) return false;
  return new Date() > new Date(form.deadline);
}

export function calcRanking(
  stats: ProjectStat[]
): (ProjectStat & { rank: number })[] {
  return [...stats]
    .sort((a, b) => b.overall_mean - a.overall_mean)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}
