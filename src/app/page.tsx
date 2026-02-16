"use client";

import { useState, useCallback } from "react";
import type { Project, EvaluationForm, Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Step = "register" | "evaluate";

interface EvalState {
  student: Student;
  form: EvaluationForm;
  projects: Project[];
}

export default function StudentPage() {
  const [step, setStep] = useState<Step>("register");
  const [evalState, setEvalState] = useState<EvalState | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [regForm, setRegForm] = useState({
    student_id: "",
    name: "",
    year: "",
    own_group: "",
  });

  const loadEvalState = useCallback(async (student: Student) => {
    const [formRes, projectsRes] = await Promise.all([
      fetch("/api/active-form"),
      fetch("/api/projects"),
    ]);
    const { form } = await formRes.json();
    const { projects } = await projectsRes.json();
    setEvalState({ student, form, projects });
    setStep("evaluate");
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!regForm.student_id || !regForm.name || !regForm.year || !regForm.own_group) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...regForm, year: Number(regForm.year) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }
    await loadEvalState(data.student);
  };

  const handleSelectProject = (project: Project) => {
    if (!evalState) return;
    const { student, form } = evalState;
    if (project.id === student.own_group) return;
    if (student.evaluated_projects.includes(project.id)) return;
    setSelectedProject(project);
    const defaultAnswers: Record<string, number> = {};
    form.questions.filter((q) => q.active).forEach((q) => {
      defaultAnswers[q.id] = form.scale.min;
    });
    setAnswers(defaultAnswers);
    setError("");
    setSuccessMsg("");
  };

  const handleSubmitEval = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!evalState || !selectedProject) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: evalState.student.student_id,
        project_id: selectedProject.id,
        answers,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }
    const updatedStudent: Student = {
      ...evalState.student,
      evaluated_projects: [...evalState.student.evaluated_projects, selectedProject.id],
    };
    setEvalState({ ...evalState, student: updatedStudent });
    setSelectedProject(null);
    setSuccessMsg(`ประเมิน "${selectedProject.name}" เรียบร้อยแล้ว ✓`);
  };

  // --- REGISTER STEP ---
  if (step === "register") {
    return (
      <main className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">ระบบประเมินโปรเจค</CardTitle>
            <CardDescription>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sid">รหัสนักศึกษา</Label>
                <Input id="sid" placeholder="เช่น 65012345"
                  value={regForm.student_id}
                  onChange={(e) => setRegForm({ ...regForm, student_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input id="name" placeholder="ชื่อ นามสกุล"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">ชั้นปี</Label>
                <Input id="year" type="number" placeholder="1–4" min={1} max={6}
                  value={regForm.year}
                  onChange={(e) => setRegForm({ ...regForm, year: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grp">รหัสกลุ่มของตัวเอง</Label>
                <Input id="grp" placeholder="เช่น group1"
                  value={regForm.own_group}
                  onChange={(e) => setRegForm({ ...regForm, own_group: e.target.value })} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">เข้าสู่ระบบ</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  // --- EVALUATE STEP ---
  if (!evalState) return null;
  const { student, form, projects } = evalState;
  const totalToEvaluate = projects.length - 1;
  const evaluatedCount = student.evaluated_projects.length;
  const progressPct = totalToEvaluate > 0 ? (evaluatedCount / totalToEvaluate) * 100 : 0;
  const activeQuestions = form.questions.filter((q) => q.active).sort((a, b) => a.order - b.order);
  const isDeadlinePassed = form.deadline ? new Date() > new Date(form.deadline) : false;

  return (
    <main className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>{form.title}</CardTitle>
                <CardDescription>
                  {student.name} ({student.student_id}) — กลุ่ม {student.own_group}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isDeadlinePassed && <Badge variant="destructive">ปิดรับการประเมินแล้ว</Badge>}
                <Badge variant="outline">คะแนน {form.scale.min}–{form.scale.max}</Badge>
              </div>
            </div>
            {form.deadline && (
              <p className="text-xs text-muted-foreground mt-1">
                กำหนดส่ง: {new Date(form.deadline).toLocaleString("th-TH")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ประเมินแล้ว</span>
                <span>{evaluatedCount} / {totalToEvaluate} กลุ่ม</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Success message */}
        {successMsg && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {successMsg}
          </div>
        )}

        {/* Evaluation form for selected project */}
        {selectedProject && !isDeadlinePassed && (
          <Card className="border-primary ring-1 ring-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">ประเมิน: {selectedProject.name}</CardTitle>
              <CardDescription>
                เลือกคะแนน {form.scale.min}–{form.scale.max} สำหรับแต่ละเกณฑ์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEval} className="space-y-5">
                {activeQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-sm leading-relaxed">
                      {q.order}. {q.text}
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from(
                        { length: form.scale.max - form.scale.min + 1 },
                        (_, i) => form.scale.min + i
                      ).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: score })}
                          className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
                            answers[q.id] === score
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-input"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "กำลังส่ง..." : "ส่งการประเมิน"}
                  </Button>
                  <Button type="button" variant="outline"
                    onClick={() => { setSelectedProject(null); setError(""); }}>
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Project cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            รายการกลุ่ม
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => {
              const isOwn = project.id === student.own_group;
              const isDone = student.evaluated_projects.includes(project.id);
              const isSelected = selectedProject?.id === project.id;
              const canEvaluate = !isOwn && !isDone && !isDeadlinePassed;

              return (
                <Card
                  key={project.id}
                  className={`transition-all ${
                    isSelected
                      ? "border-primary ring-1 ring-primary"
                      : canEvaluate
                      ? "cursor-pointer hover:border-primary/50 hover:shadow-sm"
                      : "opacity-55"
                  }`}
                  onClick={() => canEvaluate && handleSelectProject(project)}
                >
                  <CardContent className="pt-4 pb-4 flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{project.name}</span>
                    <span className="shrink-0">
                      {isOwn && <Badge variant="secondary">กลุ่มของฉัน</Badge>}
                      {isDone && !isOwn && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          ประเมินแล้ว
                        </Badge>
                      )}
                      {canEvaluate && <Badge variant="outline">คลิกเพื่อประเมิน</Badge>}
                      {isDeadlinePassed && !isOwn && !isDone && (
                        <Badge variant="destructive">ปิดแล้ว</Badge>
                      )}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
