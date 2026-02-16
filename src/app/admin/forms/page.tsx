"use client";

import { useState, useEffect } from "react";
import type { EvaluationForm, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FormManagement() {
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedForm, setExpandedForm] = useState<string | null>(null);

  // New form dialog
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormData, setNewFormData] = useState({
    title: "",
    scaleMin: "1",
    scaleMax: "5",
    deadline: "",
    questions: [{ text: "" }],
  });
  const [newFormError, setNewFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit question inline
  const [editingQuestion, setEditingQuestion] = useState<{
    formId: string;
    questionId: string;
    text: string;
  } | null>(null);

  const loadForms = async () => {
    const res = await fetch("/api/forms");
    const { forms } = await res.json();
    setForms(forms);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then(({ forms }: { forms: EvaluationForm[] }) => {
        setForms(forms);
        setLoading(false);
      });
  }, []);

  const handleActivate = async (formId: string) => {
    await fetch(`/api/forms/${formId}/activate`, { method: "POST" });
    await loadForms();
  };

  const handleClone = async (formId: string, sourceTitle: string) => {
    const title = prompt(`ชื่อ form ใหม่:`, `${sourceTitle} (copy)`);
    if (!title) return;
    await fetch(`/api/forms/${formId}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    await loadForms();
  };

  const handleCreateForm = async () => {
    setNewFormError("");
    if (!newFormData.title.trim()) {
      setNewFormError("กรุณาใส่ชื่อแบบประเมิน");
      return;
    }
    const validQuestions = newFormData.questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      setNewFormError("กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ");
      return;
    }
    setSaving(true);
    const questions = validQuestions.map((q, i) => ({
      id: `q${i + 1}`,
      text: q.text.trim(),
      order: i + 1,
      active: true,
    }));
    await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newFormData.title.trim(),
        scale: { min: Number(newFormData.scaleMin), max: Number(newFormData.scaleMax) },
        deadline: newFormData.deadline || null,
        questions,
      }),
    });
    setSaving(false);
    setShowNewForm(false);
    setNewFormData({ title: "", scaleMin: "1", scaleMax: "5", deadline: "", questions: [{ text: "" }] });
    await loadForms();
  };

  const handleToggleQuestion = async (form: EvaluationForm, questionId: string, active: boolean) => {
    const updatedQuestions = form.questions.map((q) =>
      q.id === questionId ? { ...q, active } : q
    );
    await fetch(`/api/forms/${form.form_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: updatedQuestions }),
    });
    await loadForms();
  };

  const handleSaveQuestionText = async (form: EvaluationForm) => {
    if (!editingQuestion) return;
    const updatedQuestions = form.questions.map((q) =>
      q.id === editingQuestion.questionId ? { ...q, text: editingQuestion.text } : q
    );
    await fetch(`/api/forms/${form.form_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: updatedQuestions }),
    });
    setEditingQuestion(null);
    await loadForms();
  };

  const handleSetDeadline = async (form: EvaluationForm, deadline: string) => {
    await fetch(`/api/forms/${form.form_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline: deadline || null }),
    });
    await loadForms();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/40 flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">จัดการแบบประเมิน</h1>
            <p className="text-sm text-muted-foreground">สร้าง แก้ไข และจัดการแบบประเมินทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin">
              <Button variant="outline">← Dashboard</Button>
            </a>
            <Button onClick={() => setShowNewForm(true)}>+ สร้างแบบประเมินใหม่</Button>
          </div>
        </div>

        {/* Form list */}
        {forms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              ยังไม่มีแบบประเมิน — กดสร้างใหม่ด้านบน
            </CardContent>
          </Card>
        ) : (
          forms.map((form) => (
            <Card key={form.form_id} className={form.active ? "border-primary ring-1 ring-primary/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    {form.active ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!form.active && (
                      <Button size="sm" onClick={() => handleActivate(form.form_id)}>
                        Activate
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleClone(form.form_id, form.title)}>
                      Clone
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedForm(expandedForm === form.form_id ? null : form.form_id)
                      }
                    >
                      {expandedForm === form.form_id ? "ซ่อน" : "แก้ไข"}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  scale: {form.scale.min}–{form.scale.max} &nbsp;|&nbsp;{" "}
                  {form.questions.filter((q) => q.active).length} คำถาม (active)
                  {form.deadline && (
                    <>
                      &nbsp;|&nbsp; กำหนดส่ง:{" "}
                      {new Date(form.deadline).toLocaleString("th-TH")}
                    </>
                  )}
                </CardDescription>
              </CardHeader>

              {/* Expanded question editor */}
              {expandedForm === form.form_id && (
                <CardContent className="pt-0 space-y-4">
                  {/* Deadline setting */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Label className="text-sm shrink-0">กำหนดส่ง (deadline):</Label>
                    <Input
                      type="datetime-local"
                      className="w-56"
                      defaultValue={
                        form.deadline
                          ? new Date(form.deadline).toISOString().slice(0, 16)
                          : ""
                      }
                      onBlur={(e) => handleSetDeadline(form, e.target.value)}
                    />
                    {form.deadline && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive text-xs"
                        onClick={() => handleSetDeadline(form, "")}
                      >
                        ลบ deadline
                      </Button>
                    )}
                  </div>

                  {/* Questions table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>คำถาม</TableHead>
                        <TableHead className="text-center w-24">Active</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.questions
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((q: Question) => (
                          <TableRow key={q.id} className={!q.active ? "opacity-50" : ""}>
                            <TableCell className="text-muted-foreground text-sm">
                              {q.order}
                            </TableCell>
                            <TableCell>
                              {editingQuestion?.formId === form.form_id &&
                              editingQuestion?.questionId === q.id ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    value={editingQuestion.text}
                                    onChange={(e) =>
                                      setEditingQuestion({
                                        ...editingQuestion,
                                        text: e.target.value,
                                      })
                                    }
                                    className="h-8 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => handleSaveQuestionText(form)}
                                  >
                                    บันทึก
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8"
                                    onClick={() => setEditingQuestion(null)}
                                  >
                                    ยกเลิก
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-sm">{q.text}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={q.active}
                                onCheckedChange={(val) =>
                                  handleToggleQuestion(form, q.id, val)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {!(
                                editingQuestion?.formId === form.form_id &&
                                editingQuestion?.questionId === q.id
                              ) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    setEditingQuestion({
                                      formId: form.form_id,
                                      questionId: q.id,
                                      text: q.text,
                                    })
                                  }
                                >
                                  แก้ไข
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* New Form Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>สร้างแบบประเมินใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลแบบประเมินและเพิ่มคำถาม</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>ชื่อแบบประเมิน</Label>
              <Input
                placeholder="เช่น แบบประเมินปี 2569"
                value={newFormData.title}
                onChange={(e) => setNewFormData({ ...newFormData, title: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1">
                <Label>คะแนนต่ำสุด (min)</Label>
                <Input
                  type="number"
                  value={newFormData.scaleMin}
                  onChange={(e) => setNewFormData({ ...newFormData, scaleMin: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label>คะแนนสูงสุด (max)</Label>
                <Input
                  type="number"
                  value={newFormData.scaleMax}
                  onChange={(e) => setNewFormData({ ...newFormData, scaleMax: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>กำหนดส่ง (deadline) — ไม่บังคับ</Label>
              <Input
                type="datetime-local"
                value={newFormData.deadline}
                onChange={(e) => setNewFormData({ ...newFormData, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>คำถาม</Label>
              {newFormData.questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-sm text-muted-foreground pt-2 w-5 shrink-0">{i + 1}.</span>
                  <Textarea
                    placeholder={`คำถามข้อ ${i + 1}`}
                    value={q.text}
                    rows={2}
                    className="text-sm resize-none"
                    onChange={(e) => {
                      const qs = [...newFormData.questions];
                      qs[i] = { text: e.target.value };
                      setNewFormData({ ...newFormData, questions: qs });
                    }}
                  />
                  {newFormData.questions.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive mt-1 h-8"
                      onClick={() => {
                        const qs = newFormData.questions.filter((_, idx) => idx !== i);
                        setNewFormData({ ...newFormData, questions: qs });
                      }}
                    >
                      ลบ
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() =>
                  setNewFormData({
                    ...newFormData,
                    questions: [...newFormData.questions, { text: "" }],
                  })
                }
              >
                + เพิ่มคำถาม
              </Button>
            </div>
            {newFormError && <p className="text-sm text-destructive">{newFormError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateForm} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "สร้างแบบประเมิน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
