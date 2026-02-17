"use client";

import { useState, useEffect } from "react";
import type { EvaluationForm, Question } from "@/types";
import { ClipboardList, PlusIcon, CopyIcon, Edit3Icon, ChevronDownIcon, ClockIcon, Trash2Icon } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import { Switch } from "@/components/Switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";

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

  // Deadline saved feedback
  const [deadlineSaved, setDeadlineSaved] = useState<string | null>(null);

  // Clone dialog
  const [cloneDialog, setCloneDialog] = useState<{ formId: string; sourceTitle: string } | null>(null);
  const [cloneTitle, setCloneTitle] = useState("");
  const [cloning, setCloning] = useState(false);

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

  const handleClone = (formId: string, sourceTitle: string) => {
    setCloneTitle(`${sourceTitle} (copy)`);
    setCloneDialog({ formId, sourceTitle });
  };

  const handleConfirmClone = async () => {
    if (!cloneDialog || !cloneTitle.trim()) return;
    setCloning(true);
    await fetch(`/api/forms/${cloneDialog.formId}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: cloneTitle.trim() }),
    });
    setCloning(false);
    setCloneDialog(null);
    setCloneTitle("");
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
    setDeadlineSaved(form.form_id);
    setTimeout(() => setDeadlineSaved(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex flex-col">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#e8eaff] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 flex flex-col items-center">
      <AdminNav />
      <div className="pt-32 px-4 md:px-12 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 ring-4 ring-white/50">
              <ClipboardList className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                จัดการแบบประเมิน
              </h1>
              <p className="text-indigo-600/80 font-medium text-sm">
                สร้าง แก้ไข และ activate แบบประเมิน
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewForm(true)}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 border-0 h-11 px-6 font-semibold tracking-wide transition-all hover:-translate-y-0.5"
          >
            <PlusIcon className="mr-2 size-4 stroke-[3]" /> สร้างแบบประเมินใหม่
          </Button>
        </div>

        {/* Form list */}
        {forms.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-2xl rounded-none border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-24 text-center flex flex-col items-center group">
            <div className="size-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-6 border border-indigo-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <ClipboardList className="size-12 text-indigo-200 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีแบบประเมิน</h3>
            <p className="text-slate-500 font-medium max-w-xs">
              เริ่มสร้างแบบประเมินแรกของคุณเพื่อใช้ในระบบ โดยกดที่ปุ่มด้านบน
            </p>
          </div>
        ) : (
          forms.map((form) => (
            <div
              key={form.form_id}
              className={`
                group relative bg-white/70 backdrop-blur-2xl rounded-none border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300
                ${form.active ? 'border-indigo-200 ring-4 ring-indigo-50/50' : 'border-white/60 hover:shadow-lg'}
              `}
            >
              {/* Card Header Content */}
              <div className="px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* Title & Status */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                      {form.title}
                    </h3>
                    {form.active ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100/80 text-emerald-700 text-xs font-bold tracking-wide border border-emerald-200/50 shadow-sm">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold tracking-wide border border-slate-200">
                        INACTIVE
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      <span className="text-slate-400 text-xs uppercase font-bold">Scale</span>
                      <span className="text-indigo-600 font-bold">{form.scale.min}-{form.scale.max}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <span>{form.questions.filter((q) => q.active).length} Questions</span>
                    {form.deadline && (
                      <>
                        <div className="w-px h-4 bg-slate-200" />
                        <span className={new Date(form.deadline) < new Date() ? "text-amber-600" : "text-slate-500"}>
                          Due: {new Date(form.deadline).toLocaleString("th-TH", { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {!form.active && (
                    <Button
                      onClick={() => handleActivate(form.form_id)}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200"
                    >
                      Use this Form
                    </Button>
                  )}

                  <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClone(form.form_id, form.title)}
                      className="text-slate-500 hover:text-indigo-600 hover:bg-white inset-shadow-sm rounded-md h-9 w-9 p-0"
                      title="Clone"
                    >
                      <CopyIcon className="size-4" />
                    </Button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedForm(expandedForm === form.form_id ? null : form.form_id)}
                      className={`
                        rounded-md h-9 px-4 font-medium transition-all
                        ${expandedForm === form.form_id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'}
                      `}
                    >
                      {expandedForm === form.form_id ? 'Close' : 'Edit'}
                      <ChevronDownIcon
                        className={`ml-2 size-4 transition-transform duration-300 ${expandedForm === form.form_id ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded question editor */}
              {expandedForm === form.form_id && (
                <div className="border-t border-indigo-50/50 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-10 py-8 space-y-8">
                    {/* Deadline Editor */}
                    <div className="bg-white/60 p-6 rounded-none border border-white shadow-sm flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-indigo-900/70 font-bold text-sm uppercase tracking-wide">
                        <ClockIcon className="size-4" /> Deadline Setting
                      </div>
                      <div className="h-4 w-px bg-indigo-100" />
                      <div className="flex items-center gap-3">
                        <Input
                          type="datetime-local"
                          className="w-auto h-10 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 rounded-none text-sm accent-indigo-600"
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
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 px-3 rounded-lg"
                            onClick={() => handleSetDeadline(form, "")}
                          >
                            Clear
                          </Button>
                        )}
                        {deadlineSaved === form.form_id && (
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md animate-in fade-in zoom-in">Saved!</span>
                        )}
                      </div>
                    </div>

                    {/* Questions Table */}
                    <div className="bg-white rounded-none border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Form Questions</h4>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 rounded-md">
                          {form.questions.length} Total
                        </Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-16 pl-8 h-12 text-xs font-bold text-slate-400 uppercase">Seq</TableHead>
                            <TableHead className="h-12 text-xs font-bold text-slate-400 uppercase">Question Text</TableHead>
                            <TableHead className="h-12 text-xs font-bold text-slate-400 uppercase text-center w-28">Status</TableHead>
                            <TableHead className="h-12 text-xs font-bold text-slate-400 uppercase text-right w-24 pr-8">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.questions
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((q: Question) => (
                              <TableRow key={q.id} className={`border-slate-50 transition-colors ${!q.active ? "bg-slate-50/50 opacity-60" : "hover:bg-indigo-50/30"}`}>
                                <TableCell className="pl-8 font-mono text-slate-400 text-sm font-medium">
                                  {q.order.toString().padStart(2, '0')}
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
                                        className="h-9 text-base border-indigo-300 focus:ring-indigo-200"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                        onClick={() => handleSaveQuestionText(form)}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-9"
                                        onClick={() => setEditingQuestion(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-700 font-medium text-base block py-1">{q.text}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={q.active}
                                    onChange={(e) =>
                                      handleToggleQuestion(form, q.id, e.target.checked)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                  {!(
                                    editingQuestion?.formId === form.form_id &&
                                    editingQuestion?.questionId === q.id
                                  ) && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                                        onClick={() =>
                                          setEditingQuestion({
                                            formId: form.form_id,
                                            questionId: q.id,
                                            text: q.text,
                                          })
                                        }
                                      >
                                        <Edit3Icon className="size-4" />
                                      </Button>
                                    )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>



      {/* Clone Dialog */}
      <Dialog open={!!cloneDialog}>
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-2xl rounded-none border-white/60 shadow-2xl p-8">
          <DialogHeader className="space-y-3">
            <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-2">
              <CopyIcon className="size-6 text-indigo-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Clone แบบประเมิน</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              ตั้งชื่อใหม่สำหรับแบบประเมินที่คุณกำลังคัดลอก
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clone-title" className="text-slate-700 font-bold ml-1">ชื่อแบบประเมินใหม่</Label>
              <Input
                id="clone-title"
                value={cloneTitle}
                onChange={(e) => setCloneTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmClone(); }}
                autoFocus
                className="h-12 bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl px-4 text-base"
                placeholder="ระบุชื่อแบบประเมินใหม่..."
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => { setCloneDialog(null); setCloneTitle(""); }}
              className="rounded-xl h-11 px-6 font-semibold text-slate-500 hover:bg-slate-100"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmClone}
              disabled={cloning || !cloneTitle.trim()}
              className="rounded-xl h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 border-0"
            >
              {cloning ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  กำลังคัดลอก...
                </div>
              ) : "ยืนยัน Clone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Form Dialog */}
      <Dialog open={showNewForm}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-3xl rounded-none border-white/60 shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <PlusIcon className="size-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">สร้างแบบประเมินใหม่</DialogTitle>
                <DialogDescription className="text-slate-300 font-medium">
                  เริ่มสร้างแบบฟอร์มประเมินโดยใส่รายละเอียดและคำถาม
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-6">
              {/* Form Title */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">ชื่อแบบประเมิน</Label>
                <Input
                  placeholder="เช่น แบบประเมินผลงานโครงงานปี 2569"
                  value={newFormData.title}
                  onChange={(e) => setNewFormData({ ...newFormData, title: e.target.value })}
                  className="h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl px-4"
                />
              </div>

              {/* Scale & Deadline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1 text-sm uppercase tracking-wide">ช่วงคะแนนประเมิน (Scale)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={newFormData.scaleMin}
                      onChange={(e) => setNewFormData({ ...newFormData, scaleMin: e.target.value })}
                      className="h-11 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl text-center font-bold"
                    />
                    <span className="text-slate-400 font-bold">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={newFormData.scaleMax}
                      onChange={(e) => setNewFormData({ ...newFormData, scaleMax: e.target.value })}
                      className="h-11 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl text-center font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1 text-sm uppercase tracking-wide">กำหนดส่ง (Deadline)</Label>
                  <Input
                    type="datetime-local"
                    value={newFormData.deadline}
                    onChange={(e) => setNewFormData({ ...newFormData, deadline: e.target.value })}
                    className="h-11 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-none font-medium accent-indigo-600"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-900 font-black text-lg">รายการคำถาม</Label>
                  <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-200">
                    {newFormData.questions.length} ข้อ
                  </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {newFormData.questions.map((q, i) => (
                    <div key={i} className="group relative bg-slate-50/50 p-4 rounded-none border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex gap-3">
                        <div className="size-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 shrink-0 mt-1 shadow-sm">
                          {i + 1}
                        </div>
                        <Textarea
                          placeholder={`พิมพ์คำถามข้อที่ ${i + 1}...`}
                          value={q.text}
                          rows={2}
                          className="flex-1 bg-transparent border-0 focus-visible:ring-0 p-0 text-slate-700 font-medium resize-none text-base placeholder:text-slate-300"
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
                            className="size-8 p-0 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => {
                              const qs = newFormData.questions.filter((_, idx) => idx !== i);
                              setNewFormData({ ...newFormData, questions: qs });
                            }}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-dashed border-2 border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-slate-500 transition-all"
                  onClick={() =>
                    setNewFormData({
                      ...newFormData,
                      questions: [...newFormData.questions, { text: "" }],
                    })
                  }
                >
                  <PlusIcon className="size-4 mr-2" /> เพิ่มคำถามใหม่
                </Button>
              </div>

              {newFormError && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-500" />
                  {newFormError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowNewForm(false)}
                className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleCreateForm}
                disabled={saving}
                className="flex-[2] h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    กำลังบันทึก...
                  </div>
                ) : "สร้างแบบประเมิน"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
