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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm space-y-8">

            {/* Branding */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground text-background text-xl font-bold tracking-tighter shadow-lg mb-1">
                CP
              </div>
              <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
              <p className="text-sm text-muted-foreground">กรอกข้อมูลเพื่อเริ่มประเมินโปรเจค</p>
            </div>

            {/* Form card */}
            <Card className="shadow-xl border-0 ring-1 ring-black/5">
              <CardContent className="pt-6 pb-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sid" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">รหัสนักศึกษา</Label>
                    <Input id="sid" placeholder="เช่น 65012345"
                      autoComplete="off" spellCheck={false} inputMode="numeric"
                      className="h-10"
                      value={regForm.student_id}
                      onChange={(e) => setRegForm({ ...regForm, student_id: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ชื่อ-นามสกุล</Label>
                    <Input id="name" placeholder="ชื่อ นามสกุล"
                      autoComplete="name"
                      className="h-10"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="year" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ชั้นปี</Label>
                      <Input id="year" type="number" placeholder="1–4" min={1} max={6}
                        inputMode="numeric"
                        className="h-10"
                        value={regForm.year}
                        onChange={(e) => setRegForm({ ...regForm, year: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="grp" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">รหัสกลุ่ม</Label>
                      <Input id="grp" placeholder="เช่น group1"
                        className="h-10"
                        value={regForm.own_group}
                        onChange={(e) => setRegForm({ ...regForm, own_group: e.target.value })} />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                      {error}
                    </p>
                  )}
                  <Button type="submit" size="lg" className="w-full mt-1 h-11 text-base font-semibold">
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">CPES — Classroom Project Evaluation System</p>
          </div>
        </main>
      </div>
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
  const allDone = evaluatedCount >= totalToEvaluate;

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Top bar with student info */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-sm tracking-tight shrink-0">CPES</span>
            <span className="text-muted-foreground text-xs hidden sm:block truncate">
              {student.name} · กลุ่ม {student.own_group}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDeadlinePassed && <Badge variant="destructive" className="text-xs">ปิดรับแล้ว</Badge>}
            <span className="text-xs text-muted-foreground font-mono">
              {evaluatedCount}/{totalToEvaluate}
            </span>
            <div className="w-20 hidden sm:block">
              <Progress value={progressPct} className="h-1.5" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Form info + progress */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-semibold">{form.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {student.name} ({student.student_id})
                {form.deadline && (
                  <> · กำหนดส่ง {new Date(form.deadline).toLocaleDateString("th-TH")}</>
                )}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ความคืบหน้า</span>
                <span>{evaluatedCount} / {totalToEvaluate} กลุ่ม</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
            {allDone && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
                ประเมินครบทุกกลุ่มแล้ว ✓
              </div>
            )}
          </div>

          {/* Success message */}
          {successMsg && !allDone && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              {successMsg}
            </div>
          )}

          {/* Evaluation form */}
          {selectedProject && !isDeadlinePassed && (
            <Card className="border-primary shadow-md">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">ประเมิน: {selectedProject.name}</CardTitle>
                    <CardDescription className="mt-0.5">
                      คะแนน {form.scale.min} (น้อยที่สุด) — {form.scale.max} (มากที่สุด)
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="ปิดแบบประเมิน"
                    className="h-8 text-muted-foreground shrink-0"
                    onClick={() => { setSelectedProject(null); setError(""); }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <form onSubmit={handleSubmitEval} className="space-y-6">
                  {activeQuestions.map((q) => (
                    <div key={q.id} className="space-y-2.5">
                      <p className="text-sm font-medium leading-relaxed">
                        {q.order}. {q.text}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Array.from(
                          { length: form.scale.max - form.scale.min + 1 },
                          (_, i) => form.scale.min + i
                        ).map((score) => (
                          <button
                            key={score}
                            type="button"
                            aria-label={`คะแนน ${score}`}
                            aria-pressed={answers[q.id] === score}
                            onClick={() => setAnswers({ ...answers, [q.id]: score })}
                            className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                              answers[q.id] === score
                                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-110"
                                : "bg-background hover:bg-muted border-border hover:border-primary/40"
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1 border-t">
                    <Button type="submit" disabled={submitting} className="mt-3">
                      {submitting ? "กำลังส่ง..." : "ส่งการประเมิน"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-3"
                      onClick={() => { setSelectedProject(null); setError(""); }}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Project grid */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              รายการกลุ่มทั้งหมด
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {projects.map((project) => {
                const isOwn = project.id === student.own_group;
                const isDone = student.evaluated_projects.includes(project.id);
                const isSelected = selectedProject?.id === project.id;
                const canEvaluate = !isOwn && !isDone && !isDeadlinePassed;

                return (
                  <button
                    key={project.id}
                    disabled={!canEvaluate}
                    onClick={() => canEvaluate && handleSelectProject(project)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-colors flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : canEvaluate
                        ? "bg-card hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm cursor-pointer"
                        : "bg-card opacity-50 cursor-default"
                    }`}
                  >
                    <span className={`font-medium text-sm ${isSelected ? "text-primary" : ""}`}>
                      {project.name}
                    </span>
                    <span className="shrink-0">
                      {isOwn && <Badge variant="secondary" className="text-xs">กลุ่มของฉัน</Badge>}
                      {isDone && !isOwn && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                          ✓ ประเมินแล้ว
                        </Badge>
                      )}
                      {canEvaluate && !isSelected && (
                        <span className="text-xs text-muted-foreground">คลิกเพื่อประเมิน →</span>
                      )}
                      {isSelected && (
                        <Badge className="text-xs">กำลังประเมิน</Badge>
                      )}
                      {isDeadlinePassed && !isOwn && !isDone && (
                        <Badge variant="destructive" className="text-xs">ปิดแล้ว</Badge>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
