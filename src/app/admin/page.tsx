"use client";

import { useState, useEffect, useCallback } from "react";
import type { EvaluationForm, ProjectStat, StudentMonitor } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatsData {
  form_id: string;
  form_title: string;
  project_stats: ProjectStat[];
  ranking: (ProjectStat & { rank: number })[];
  student_monitor: StudentMonitor[];
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then(({ forms }) => {
        setForms(forms);
        const active = forms.find((f: EvaluationForm) => f.active);
        if (active) setSelectedFormId(active.form_id);
      });
  }, []);

  const loadStats = useCallback(async (formId: string) => {
    if (!formId) return;
    setLoading(true);
    const res = await fetch(`/api/stats?form_id=${formId}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedFormId) loadStats(selectedFormId);
  }, [selectedFormId, loadStats]);

  const handleExportCSV = () => {
    if (!selectedFormId) return;
    window.open(`/api/export?form_id=${selectedFormId}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">ระบบประเมินโปรเจคในชั้นเรียน</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/forms">
              <Button variant="outline">จัดการแบบฟอร์ม</Button>
            </a>
            <Button onClick={handleExportCSV} disabled={!selectedFormId}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Form selector */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium">เลือกแบบประเมิน:</label>
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="เลือก form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f.form_id} value={f.form_id}>
                      {f.title}
                      {f.active && (
                        <span className="ml-2 text-xs text-green-600">(active)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && <span className="text-sm text-muted-foreground">กำลังโหลด...</span>}
            </div>
          </CardContent>
        </Card>

        {stats && (
          <>
            {/* Ranking table */}
            <Card>
              <CardHeader>
                <CardTitle>อันดับกลุ่ม (Ranking)</CardTitle>
                <CardDescription>จัดอันดับตาม Mean รวม — {stats.form_title}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">อันดับ</TableHead>
                      <TableHead>กลุ่ม</TableHead>
                      <TableHead className="text-right">ผู้ประเมิน</TableHead>
                      <TableHead className="text-right">Mean รวม</TableHead>
                      <TableHead className="text-right">SD รวม</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.ranking.map((row) => (
                      <>
                        <TableRow
                          key={row.project_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            setExpandedProject(
                              expandedProject === row.project_id ? null : row.project_id
                            )
                          }
                        >
                          <TableCell>
                            <span
                              className={`font-bold text-lg ${
                                row.rank === 1
                                  ? "text-yellow-500"
                                  : row.rank === 2
                                  ? "text-slate-400"
                                  : row.rank === 3
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              #{row.rank}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{row.project_name}</TableCell>
                          <TableCell className="text-right">{row.evaluator_count}</TableCell>
                          <TableCell className="text-right font-mono">
                            {row.overall_mean.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {row.overall_sd.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs text-muted-foreground">
                              {expandedProject === row.project_id ? "▲ ซ่อน" : "▼ รายข้อ"}
                            </span>
                          </TableCell>
                        </TableRow>
                        {/* Expanded: per-question stats */}
                        {expandedProject === row.project_id &&
                          row.per_question.length > 0 && (
                            <TableRow key={`${row.project_id}-detail`}>
                              <TableCell colSpan={6} className="bg-muted/30 p-0">
                                <div className="px-6 py-3">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                    สถิติรายข้อ
                                  </p>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-muted-foreground text-xs">
                                        <th className="text-left font-medium pb-1 pr-4">คำถาม</th>
                                        <th className="text-right font-medium pb-1 pr-4">Mean</th>
                                        <th className="text-right font-medium pb-1 pr-4">SD</th>
                                        <th className="text-right font-medium pb-1">n</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.per_question.map((pq) => (
                                        <tr key={pq.question_id} className="border-t border-border/30">
                                          <td className="py-1 pr-4 text-xs max-w-xs">
                                            {pq.question_text}
                                          </td>
                                          <td className="py-1 pr-4 text-right font-mono text-xs">
                                            {pq.mean.toFixed(2)}
                                          </td>
                                          <td className="py-1 pr-4 text-right font-mono text-xs text-muted-foreground">
                                            {pq.sd.toFixed(2)}
                                          </td>
                                          <td className="py-1 text-right text-xs text-muted-foreground">
                                            {pq.count}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Student monitoring */}
            <Card>
              <CardHeader>
                <CardTitle>ติดตามนักศึกษา</CardTitle>
                <CardDescription>
                  ความคืบหน้าการประเมินของนักศึกษาแต่ละคน
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.student_monitor.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    ยังไม่มีนักศึกษาลงทะเบียน
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รหัสนักศึกษา</TableHead>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>กลุ่ม</TableHead>
                        <TableHead className="text-right">ประเมินแล้ว</TableHead>
                        <TableHead className="text-right">ต้องประเมิน</TableHead>
                        <TableHead className="text-center">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.student_monitor.map((s) => (
                        <TableRow key={s.student_id}>
                          <TableCell className="font-mono text-sm">{s.student_id}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.own_group}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {s.evaluated_count}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {s.total_to_evaluate}
                          </TableCell>
                          <TableCell className="text-center">
                            {s.complete ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                ครบแล้ว
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                ยังไม่ครบ ({s.evaluated_count}/{s.total_to_evaluate})
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
