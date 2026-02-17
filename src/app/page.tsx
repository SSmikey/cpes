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

/* ─────────────────────────── types ─────────────────────────── */
type Step = "register" | "evaluate";

interface EvalState {
  student: Student;
  form: EvaluationForm;
  projects: Project[];
}

/* ──────────────────── inline style helpers ──────────────────── */
const GRAD = "linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #2563eb 70%, #06b6d4 100%)";
const POLY_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cpolygon points='0,0 400,0 400,300' fill='rgba(255,255,255,0.04)'/%3E%3Cpolygon points='0,0 250,0 400,180 400,0' fill='rgba(255,255,255,0.05)'/%3E%3Cpolygon points='100,0 400,0 400,120' fill='rgba(255,255,255,0.03)'/%3E%3Cpolygon points='0,100 200,0 400,80 400,300 0,300' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E")`;

/* ════════════════════════ COMPONENT ════════════════════════════ */
export default function StudentPage() {
  /* ── state (unchanged) ── */
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

  /* ── logic (unchanged) ── */
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

  /* ══════════════════════ REGISTER STEP ══════════════════════ */
  if (step === "register") {
    return (
      <div
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}
      >
        {/* Card container — split layout */}
        <div
          style={{
            width: "100%",
            maxWidth: 820,
            margin: "24px",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(109,40,217,0.18), 0 8px 24px rgba(0,0,0,0.10)",
            display: "flex",
            minHeight: 420,
            background: "#fff",
          }}
        >
          {/* ── LEFT: form side ── */}
          <div style={{ flex: "1 1 55%", padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
            {/* Title */}
            <div style={{ marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                เข้าสู่ระบบ
              </h1>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
                กรอกข้อมูลเพื่อเริ่มประเมินโปรเจค
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Student ID */}
              <div>
                <label style={labelStyle}>รหัสนักศึกษา</label>
                <input
                  placeholder="เช่น 65012345"
                  autoComplete="off"
                  inputMode="numeric"
                  value={regForm.student_id}
                  onChange={(e) => setRegForm({ ...regForm, student_id: e.target.value })}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>ชื่อ-นามสกุล</label>
                <input
                  placeholder="ชื่อ นามสกุล"
                  autoComplete="name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>

              {/* Year + Group */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>ชั้นปี</label>
                  <input
                    type="number"
                    placeholder="1–4"
                    min={1}
                    max={6}
                    inputMode="numeric"
                    value={regForm.year}
                    onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.target.style, inputStyle)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>รหัสกลุ่ม</label>
                  <input
                    placeholder="เช่น group1"
                    value={regForm.own_group}
                    onChange={(e) => setRegForm({ ...regForm, own_group: e.target.value })}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.target.style, inputStyle)}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", margin: 0 }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button type="submit" style={submitBtnStyle}
                onMouseEnter={e => Object.assign(e.currentTarget.style, { ...submitBtnStyle, opacity: "0.92", transform: "translateY(-1px)" })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { ...submitBtnStyle, opacity: "1", transform: "translateY(0)" })}
              >
                เข้าสู่ระบบ
              </button>
            </form>

            <p style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center", marginTop: 4 }}>
              CPES — Classroom Project Evaluation System
            </p>
          </div>

          {/* ── RIGHT: gradient + welcome side ── */}
          <div
            style={{
              flex: "1 1 45%",
              background: GRAD,
              backgroundImage: `${POLY_SVG}, ${GRAD}`,
              backgroundSize: "cover",
              backgroundBlendMode: "overlay",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "48px 44px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative polygon shapes */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220,
              background: "rgba(255,255,255,0.07)",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -40,
              width: 160, height: 160,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%",
            }} />

            <div style={{ position: "relative", textAlign: "right" }}>
              <h2 style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-1px",
                textShadow: "0 2px 20px rgba(0,0,0,0.2)",
              }}>
                Welcome<br />Back.
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 16, lineHeight: 1.7, maxWidth: 200 }}>
                ระบบประเมินโปรเจคสำหรับนักศึกษา<br />เข้าสู่ระบบเพื่อเริ่มประเมิน
              </p>
            </div>
          </div>
        </div>

        <style>{`
          input::placeholder { color: #cbd5e1; }
          input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        `}</style>
      </div>
    );
  }

  /* ══════════════════════ EVALUATE STEP ══════════════════════ */
  if (!evalState) return null;
  const { student, form, projects } = evalState;
  const totalToEvaluate = projects.length - 1;
  const evaluatedCount = student.evaluated_projects.length;
  const progressPct = totalToEvaluate > 0 ? (evaluatedCount / totalToEvaluate) * 100 : 0;
  const activeQuestions = form.questions.filter((q) => q.active).sort((a, b) => a.order - b.order);
  const isDeadlinePassed = form.deadline ? new Date() > new Date(form.deadline) : false;
  const allDone = evaluatedCount >= totalToEvaluate;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 12px rgba(109,40,217,0.07)",
      }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              background: GRAD,
              color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "-0.5px",
              flexShrink: 0,
            }}>CP</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", flexShrink: 0 }}>CPES</span>
            <span style={{ color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {student.name} · กลุ่ม {student.own_group}
            </span>
          </div>

          {/* Progress + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {isDeadlinePassed && (
              <span style={badgeDestructiveStyle}>ปิดรับแล้ว</span>
            )}
            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
              {evaluatedCount}/{totalToEvaluate}
            </span>
            <div style={{ width: 72, height: 6, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: GRAD, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Form title + progress ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Decorative header */}
            <div style={{
              borderRadius: 16,
              padding: "20px 24px",
              background: GRAD,
              backgroundImage: `${POLY_SVG}, ${GRAD}`,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>{form.title}</h1>
              <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {student.name} ({student.student_id})
                {form.deadline && (
                  <> · กำหนดส่ง {new Date(form.deadline).toLocaleDateString("th-TH")}</>
                )}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                <span>ความคืบหน้า</span>
                <span style={{ fontWeight: 600, color: "#7c3aed" }}>{evaluatedCount} / {totalToEvaluate} กลุ่ม</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: "#ede9fe", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: GRAD, borderRadius: 99, transition: "width 0.4s ease" }} />
              </div>
            </div>

            {allDone && (
              <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", fontSize: 14, color: "#15803d", fontWeight: 500 }}>
                ประเมินครบทุกกลุ่มแล้ว ✓
              </div>
            )}
          </div>

          {/* ── Success message ── */}
          {successMsg && !allDone && (
            <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", fontSize: 14, color: "#15803d" }}>
              {successMsg}
            </div>
          )}

          {/* ── Evaluation form ── */}
          {selectedProject && !isDeadlinePassed && (
            <div style={{
              borderRadius: 16,
              border: "2px solid #7c3aed",
              background: "#fff",
              boxShadow: "0 4px 24px rgba(109,40,217,0.12)",
              overflow: "hidden",
            }}>
              {/* Header with gradient accent */}
              <div style={{
                padding: "18px 22px",
                borderBottom: "1px solid #ede9fe",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                background: "linear-gradient(to right, #faf5ff, #fff)",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>ประเมิน: {selectedProject.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                    คะแนน {form.scale.min} (น้อยที่สุด) — {form.scale.max} (มากที่สุด)
                  </div>
                </div>
                <button
                  aria-label="ปิดแบบประเมิน"
                  onClick={() => { setSelectedProject(null); setError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: 4, lineHeight: 1 }}
                >✕</button>
              </div>

              <div style={{ padding: "22px" }}>
                <form onSubmit={handleSubmitEval} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {activeQuestions.map((q) => (
                    <div key={q.id}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 10px 0", lineHeight: 1.6 }}>
                        {q.order}. {q.text}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Array.from(
                          { length: form.scale.max - form.scale.min + 1 },
                          (_, i) => form.scale.min + i
                        ).map((score) => {
                          const isActive = answers[q.id] === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              aria-label={`คะแนน ${score}`}
                              aria-pressed={isActive}
                              onClick={() => setAnswers({ ...answers, [q.id]: score })}
                              style={{
                                width: 40, height: 40,
                                borderRadius: 10,
                                border: isActive ? "2px solid #7c3aed" : "2px solid #e2e8f0",
                                background: isActive ? GRAD : "#f8fafc",
                                color: isActive ? "#fff" : "#64748b",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                transform: isActive ? "scale(1.12)" : "scale(1)",
                                boxShadow: isActive ? "0 4px 12px rgba(109,40,217,0.3)" : "none",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {error && (
                    <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", margin: 0 }}>
                      {error}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        ...submitBtnStyle,
                        opacity: submitting ? 0.7 : 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                        padding: "10px 24px",
                        fontSize: 14,
                      }}
                    >
                      {submitting ? "กำลังส่ง..." : "ส่งการประเมิน"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedProject(null); setError(""); }}
                      style={{
                        background: "none", border: "1px solid #e2e8f0",
                        borderRadius: 10, padding: "10px 18px",
                        fontSize: 14, color: "#64748b", cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Project grid ── */}
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              รายการกลุ่มทั้งหมด
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
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
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 12,
                      border: isSelected
                        ? "2px solid #7c3aed"
                        : canEvaluate
                          ? "1px solid #e2e8f0"
                          : "1px solid #f1f5f9",
                      background: isSelected
                        ? "linear-gradient(135deg, #faf5ff, #ede9fe22)"
                        : canEvaluate
                          ? "#fff"
                          : "#f8fafc",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      cursor: canEvaluate ? "pointer" : "default",
                      opacity: (!canEvaluate && !isOwn && !isDone) ? 0.5 : 1,
                      boxShadow: isSelected
                        ? "0 4px 16px rgba(109,40,217,0.14)"
                        : canEvaluate
                          ? "0 1px 4px rgba(0,0,0,0.04)"
                          : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: isSelected ? "#7c3aed" : "#1e293b",
                    }}>
                      {project.name}
                    </span>
                    <span style={{ flexShrink: 0 }}>
                      {isOwn && (
                        <span style={badgeSecondaryStyle}>กลุ่มของฉัน</span>
                      )}
                      {isDone && !isOwn && (
                        <span style={badgeSuccessStyle}>✓ ประเมินแล้ว</span>
                      )}
                      {canEvaluate && !isSelected && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>คลิกเพื่อประเมิน →</span>
                      )}
                      {isSelected && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: "#7c3aed",
                          background: "#ede9fe", borderRadius: 6, padding: "2px 8px",
                        }}>กำลังประเมิน</span>
                      )}
                      {isDeadlinePassed && !isOwn && !isDone && (
                        <span style={badgeDestructiveStyle}>ปิดแล้ว</span>
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

/* ══════════════════════ SHARED STYLES ════════════════════════ */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  padding: "0 12px",
  fontSize: 14,
  color: "#1e293b",
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#7c3aed",
  boxShadow: "0 0 0 3px rgba(124,58,237,0.12)",
  background: "#fff",
};

const submitBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.01em",
  boxShadow: "0 4px 16px rgba(109,40,217,0.28)",
  transition: "opacity 0.15s ease, transform 0.15s ease",
};

const badgeSecondaryStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  background: "#f1f5f9",
  color: "#64748b",
  borderRadius: 6,
  padding: "2px 8px",
  border: "1px solid #e2e8f0",
};

const badgeSuccessStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  background: "#dcfce7",
  color: "#15803d",
  borderRadius: 6,
  padding: "2px 8px",
  border: "1px solid #bbf7d0",
};

const badgeDestructiveStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  background: "#fef2f2",
  color: "#dc2626",
  borderRadius: 6,
  padding: "2px 8px",
  border: "1px solid #fecaca",
};