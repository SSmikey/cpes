"use client";

import { useState, useEffect } from "react";
import { Layers, PlusIcon, Pencil, Trash2, Check, X, ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

interface Project {
  id: string;
  name: string;
}

export default function GroupsManagement() {
  const [groups, setGroups] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Add
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(({ projects }) => {
        setGroups(projects);
        setLoading(false);
      });
  }, []);

  async function handleAdd() {
    if (!newName.trim()) { setAddError("กรุณาใส่ชื่อกลุ่ม"); return; }
    setAdding(true);
    setAddError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || "เกิดข้อผิดพลาด"); setAdding(false); return; }
    setGroups((prev) => [...prev, data.project]);
    setNewName("");
    setAdding(false);
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    const data = await res.json();
    if (res.ok) {
      setGroups((prev) => prev.map((g) => (g.id === id ? data.project : g)));
      setEditingId(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-kanit pb-24">
      <AdminNav />

      <main className="max-w-4xl mx-auto px-6 lg:px-10 pt-10 space-y-8">

        {/* Add Group Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
            <PlusIcon className="size-5 text-indigo-500" />
            เพิ่มกลุ่มใหม่
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="ชื่อกลุ่มโปรเจค เช่น กลุ่ม 1 - Smart Dorm"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="h-12 flex-1 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-2xl px-5 font-bold text-slate-700"
            />
            <Button
              onClick={handleAdd}
              disabled={adding}
              className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
            >
              {adding ? (
                <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <PlusIcon className="size-5" />
              )}
              เพิ่ม
            </Button>
          </div>
          {addError && (
            <p className="mt-3 text-sm text-red-500 font-bold flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-red-500 inline-block" />
              {addError}
            </p>
          )}
        </div>

        {/* Group List */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">รายการกลุ่มทั้งหมด</h2>
            <span className="bg-indigo-50 text-indigo-600 font-black text-sm px-3 py-1 rounded-full border border-indigo-100">
              {groups.length} กลุ่ม
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center text-slate-400 font-bold">
              <div className="size-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin mr-3" />
              กำลังโหลด...
            </div>
          ) : groups.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Layers className="size-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">ยังไม่มีกลุ่มโปรเจค</p>
              <p className="text-sm mt-1">เพิ่มกลุ่มแรกด้านบนได้เลย</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {groups.map((group, index) => (
                <li key={group.id} className="px-8 py-5 flex items-center gap-4 group hover:bg-slate-50/60 transition-colors">
                  {/* Number badge */}
                  <div className="size-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>

                  {/* Name / Edit field */}
                  <div className="flex-1">
                    {editingId === group.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(group.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="h-10 bg-white border-indigo-300 focus:border-indigo-500 rounded-xl px-4 font-bold text-slate-700 text-sm"
                      />
                    ) : (
                      <span className="font-bold text-slate-700">{group.name}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {editingId === group.id ? (
                      <>
                        <button
                          onClick={() => handleEdit(group.id)}
                          disabled={saving}
                          className="size-9 flex items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="บันทึก"
                        >
                          {saving ? (
                            <div className="size-3.5 rounded-full border-2 border-emerald-300 border-t-emerald-600 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="size-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"
                          title="ยกเลิก"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : deletingId === group.id ? (
                      <>
                        <span className="text-xs font-bold text-red-500 mr-1">ยืนยันลบ?</span>
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="h-9 px-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-black hover:bg-red-100 transition-colors"
                        >
                          ลบเลย
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="size-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(group.id); setEditName(group.name); }}
                          className="size-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                          title="แก้ไข"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(group.id)}
                          className="size-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          title="ลบ"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
          <ArrowUpRight className="size-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold">
            การแก้ไขหรือลบกลุ่มจะมีผลทันทีกับหน้าหลัก — นักศึกษาที่ลงทะเบียนไว้แล้วจะยังคงข้อมูลเดิม
          </p>
        </div>

      </main>
    </div>
  );
}
