export interface Project {
  id: string;
  name: string;
}

export interface Student {
  student_id: string;
  name: string;
  year: number;
  own_group: string;
  evaluated_projects: string[];
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

export interface EvaluationForm {
  form_id: string;
  title: string;
  active: boolean;
  scale: { min: number; max: number };
  deadline: string | null;
  questions: Question[];
}

export interface Evaluation {
  evaluation_id: string;
  form_id: string;
  student_id: string;
  project_id: string;
  answers: Record<string, number>;
  submitted_at: string;
}

// Statistics types
export interface QuestionStat {
  question_id: string;
  question_text: string;
  mean: number;
  sd: number;
  count: number;
}

export interface ProjectStat {
  project_id: string;
  project_name: string;
  evaluator_count: number;
  overall_mean: number;
  overall_sd: number;
  per_question: QuestionStat[];
}

// Student monitoring
export interface StudentMonitor {
  student_id: string;
  name: string;
  own_group: string;
  evaluated_count: number;
  total_to_evaluate: number;
  complete: boolean;
}
