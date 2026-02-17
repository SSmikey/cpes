"use client";

import { useState, useEffect, Fragment } from "react";
import type { EvaluationForm, ProjectStat, StudentMonitor } from "@/types";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  TrophyIcon,
  UsersIcon,
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  PieChartIcon,
  TrendingUpIcon,
  UserCheckIcon,
  ArrowRightIcon,
  ArrowUpRightIcon
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/Button";
import {
  Select,
  SelectItem,
} from "@/components/Select";
import { Badge } from "@/components/Badge";
import { Card, CardContent } from "@/components/Card";

interface StatsData {
  form_id: string;
  form_title: string;
  project_stats: ProjectStat[];
  ranking: (ProjectStat & { rank: number; per_question: any[] })[];
  student_monitor: StudentMonitor[];
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const loading = selectedFormId !== "" && stats?.form_id !== selectedFormId;

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then(({ forms }) => {
        setForms(forms);
        const active = forms.find((f: EvaluationForm) => f.active);
        if (active) setSelectedFormId(active.form_id);
      });
  }, []);

  useEffect(() => {
    if (!selectedFormId) return;
    fetch(`/api/stats?form_id=${selectedFormId}`)
      .then((r) => r.json())
      .then((data: StatsData) => {
        setStats(data);
      });
  }, [selectedFormId]);

  const handleExportCSV = () => {
    if (!selectedFormId) return;
    window.open(`/api/export?form_id=${selectedFormId}`, "_blank");
  };

  // Calculate summary stats
  const totalStudents = stats?.student_monitor.length || 0;
  const completedStudents = stats?.student_monitor.filter(s => s.complete).length || 0;
  const avgMean = stats && stats.ranking.length > 0
    ? stats.ranking.reduce((acc, r) => acc + r.overall_mean, 0) / stats.ranking.length
    : 0;
  const totalEvaluations = stats?.ranking.reduce((acc, r) => acc + r.evaluator_count, 0) || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sarabun selection:bg-indigo-100 pb-24">
      <AdminNav />

      {/* Hero Header Section */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 size-96 bg-indigo-50/40 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 size-96 bg-blue-50/40 rounded-full blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-200/50 flex-shrink-0">
                <LayoutDashboardIcon className="size-8 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  Admin <span className="text-indigo-600">Dashboard</span>
                </h1>
                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm">ระบบติดตามและประมวลผลคะแนนโครงการ</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/80 p-2 rounded-[24px] border border-slate-200/60">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-200/50">
                <FileTextIcon className="size-4 text-indigo-500" />
                <Select
                  value={selectedFormId}
                  onChange={(e: any) => setSelectedFormId(e.target.value)}
                  className="bg-transparent border-0 shadow-none h-8 w-full sm:w-56 font-bold text-slate-700 focus-visible:ring-0 focus:ring-0"
                >
                  {forms.map((f) => (
                    <SelectItem key={f.form_id} value={f.form_id}>
                      {f.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Button
                onClick={handleExportCSV}
                disabled={!selectedFormId}
                variant="outline"
                className="h-12 px-6 rounded-2xl bg-white border-slate-200 hover:border-indigo-400 font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all border-2"
              >
                <DownloadIcon className="mr-2.5 size-4" /> Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 space-y-16">

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="ค่าเฉลี่ยคะแนนทั้งหมด"
            value={avgMean.toFixed(2)}
            suffix="/ 5.00"
            icon={TrendingUpIcon}
            color="indigo"
          />
          <StatCard
            label="จำนวนการประเมิน"
            value={totalEvaluations.toString()}
            suffix="ครั้ง"
            icon={PieChartIcon}
            color="orange"
          />
          <StatCard
            label="นักศึกษาประเมินเสร็จ"
            value={completedStudents.toString()}
            suffix={`/ ${totalStudents}`}
            icon={UserCheckIcon}
            color="emerald"
          />
          <StatCard
            label="ความคืบหน้าภาพรวม"
            value={totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100).toString() : "0"}
            suffix="%"
            icon={ActivityIcon}
            color="blue"
            isProgress
          />
        </div>

        {stats ? (
          <div className="space-y-16">

            {/* Project Ranking Table Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                    <TrophyIcon className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">อันดับคะแนนโครงการ</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">Project Performance Ranking</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-600 font-black px-4 py-1 rounded-full border border-amber-100">
                  {stats.ranking.length} โปรเจค
                </Badge>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-24">Rank</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Team Name / Project Title</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-32">Evaluators</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-32">Mean Score</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-32">SD</th>
                        <th className="px-8 py-5 text-right w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.ranking.map((row) => (
                        <Fragment key={row.project_id}>
                          <tr
                            onClick={() => setExpandedProject(expandedProject === row.project_id ? null : row.project_id)}
                            className={`group cursor-pointer transition-all duration-300 ${expandedProject === row.project_id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'}`}
                          >
                            <td className="px-8 py-6 text-center">
                              <div className={`size-11 rounded-2xl flex items-center justify-center mx-auto text-xl font-black font-inter shadow-sm transition-transform group-hover:scale-110 ${row.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200' :
                                row.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200' :
                                  row.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-red-500 text-white shadow-orange-200' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                {row.rank}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-extrabold text-xl group-hover:text-indigo-600 transition-colors tracking-tight leading-snug">
                                  {row.project_name}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 font-inter">ID: {row.project_id}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200/60 shadow-inner">
                                <UsersIcon className="size-3.5 text-indigo-400" />
                                <span className="text-sm font-black text-slate-600 font-inter">{row.evaluator_count}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center font-black text-3xl text-slate-900 tracking-tighter font-inter">
                              {row.overall_mean.toFixed(2)}
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/50 font-inter">SD: {row.overall_sd.toFixed(2)}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className={`p-2.5 rounded-xl transition-all duration-300 ${expandedProject === row.project_id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                                <ChevronDownIcon className={`size-5 stroke-[3] transition-transform duration-500 ${expandedProject === row.project_id ? 'rotate-180' : ''}`} />
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          {expandedProject === row.project_id && (
                            <tr className="animate-in fade-in slide-in-from-top-2 duration-300">
                              <td colSpan={6} className="px-10 py-8 bg-slate-50/80">
                                <div className="space-y-6">
                                  <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                                    <h4 className="text-sm font-black text-indigo-900/60 uppercase tracking-[0.2em] flex items-center gap-2 font-inter">
                                      <ActivityIcon className="size-4" /> Detailed Analysis
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {row.per_question?.map((pq, idx) => (
                                      <div key={idx} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all">
                                        <p className="text-sm font-bold text-slate-600 mb-4 line-clamp-2 h-10 leading-relaxed">{pq.question_text}</p>
                                        <div className="flex items-end justify-between">
                                          <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mean Score</span>
                                            <span className="text-2xl font-black text-indigo-600 tracking-tighter">{pq.mean.toFixed(2)}</span>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Stability (SD)</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                              <span>{pq.sd.toFixed(2)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Student Monitoring table redesign */}
            <section className="space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <UsersIcon className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">ติดตามความคืบหน้านักศึกษา</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">Student Assessment Monitoring</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-black text-slate-500">ทั้งหมด</span>
                    <span className="text-lg font-black text-indigo-600">{totalStudents}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="font-bold text-indigo-600 px-4 h-10 hover:bg-indigo-50 rounded-xl">
                    ดูประวัติแบบละเอียด <ArrowRightIcon className="size-4 ml-1.5" />
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left w-36">Student ID</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Full Name</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-36">Evaluated (x/5)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left w-64">Completion Progress</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-40">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.student_monitor.slice(0, 50).map((s) => {
                        const progress = Math.min(100, (s.evaluated_count / (s.total_to_evaluate || 1)) * 100);
                        const isComplete = s.complete;
                        return (
                          <tr key={s.student_id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6 text-sm font-inter font-bold text-slate-400">{s.student_id}</td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-bold text-lg leading-tight tracking-tight">{s.name}</span>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-black border border-slate-200 uppercase tracking-widest font-inter">{s.own_group}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="inline-flex items-baseline gap-1.5">
                                <span className={`text-2xl font-black font-inter ${s.evaluated_count >= 5 ? 'text-emerald-600' : 'text-slate-800'}`}>{s.evaluated_count}</span>
                                <span className="text-slate-300 text-sm font-bold font-inter">/ 5</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-2.5">
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/30 shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-blue-400 to-indigo-600'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 font-inter">
                                  <span>{isComplete ? 'Completed' : 'Processing'}</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              {isComplete ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/50 shadow-sm transition-all group-hover:bg-emerald-100 font-inter">
                                  <CheckCircle2Icon className="size-4" />
                                  <span className="text-xs font-black tracking-widest uppercase">DONE</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-500 rounded-2xl border border-indigo-100/50 font-inter">
                                  <ClockIcon className="size-4 animate-spin-slow" />
                                  <span className="text-xs font-black tracking-widest uppercase">PENDING</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {stats.student_monitor.length > 50 && (
                  <div className="px-8 py-4 text-center bg-slate-50 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">แสดงผลเฉพาะ 50 รายการแรก จากทั้งหมด {totalStudents} รายการ</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <ActivityIcon className="size-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">Please select a form to view stats</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components for better readability
function StatCard({ label, value, suffix, icon: Icon, color, isProgress = false }: any) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100/50 shadow-indigo-100/40",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100/50 shadow-emerald-100/40",
    orange: "text-orange-600 bg-orange-50 border-orange-100/50 shadow-orange-100/40",
    blue: "text-blue-600 bg-blue-50 border-blue-100/50 shadow-blue-100/40",
  };

  return (
    <Card className="rounded-[28px] border border-white bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/40 group hover:-translate-y-2 transition-all duration-500">
      <CardContent className="p-7">
        <div className="flex items-center justify-between mb-5">
          <div className={`p-4 rounded-[20px] border transition-all group-hover:scale-110 group-hover:shadow-lg duration-500 ${(colors as any)[color]}`}>
            <Icon className="size-6" />
          </div>
          <ArrowUpRightIcon className="size-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight font-inter">{value}</h3>
          <span className="text-sm font-bold text-slate-400 tracking-tight">{suffix}</span>
        </div>
        {isProgress && (
          <div className="mt-5 h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${value}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

