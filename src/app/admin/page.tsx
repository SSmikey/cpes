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
  SearchIcon,
  BellIcon,
  BoxIcon,
  MoreVerticalIcon,
  ArrowRightIcon,
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#e8eaff] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 flex flex-col items-center">
      <AdminNav />


      <div className="pt-6 px-4 md:px-12 max-w-7xl mx-auto w-full space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 ring-4 ring-white/50">
              <LayoutDashboardIcon className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Admin Dashboard
              </h1>
              <p className="text-indigo-600/80 font-medium text-sm">
                สถิติและติดตามการประเมินโปรเจคในชั้นเรียน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileTextIcon className="size-4 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-indigo-900 uppercase tracking-wide">แบบประเมิน</span>
            </div>
            <div className="relative">
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger className="w-80 h-12 bg-white border-white ring-1 ring-indigo-50 shadow-sm shadow-indigo-100/50 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all text-base px-4">
                  <SelectValue placeholder="เลือก Form" />
                </SelectTrigger>
                <SelectContent className="border-indigo-100 shadow-xl rounded-xl p-1 bg-white/95 backdrop-blur-lg">
                  {forms.map((f) => (
                    <SelectItem key={f.form_id} value={f.form_id} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer py-3 my-0.5 font-medium text-slate-600">
                      {f.title} <span className="text-xs ml-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold hidden data-[active=true]:inline-block" data-active={f.active}>ACTIVE</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ActivityIcon className="size-4 animate-spin text-indigo-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {stats ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards delay-150">

            {/* Project Ranking Section */}
            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-xl transform -rotate-1 scale-[1.01] blur-xl opacity-70 -z-10 group-hover:rotate-0 transition-transform duration-500" />

              <div className="bg-white/70 backdrop-blur-2xl rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

                <div className="px-8 py-8 border-b border-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100/50">
                      <TrophyIcon className="size-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        อันดับโปรเจค (Project Ranking)
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        สรุปผลการประเมินโดยเรียงตามคะแนนเฉลี่ย — {stats.form_title}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleExportCSV}
                    disabled={!selectedFormId}
                    className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 border-0 h-11 px-8 font-semibold tracking-wide transition-all hover:-translate-y-0.5"
                  >
                    <DownloadIcon className="mr-2 size-4" /> EXPORT CSV
                  </Button>
                </div>

                <div className="p-8 bg-slate-50/50">
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                          <th className="px-8 py-3 text-center w-32">Rank</th>
                          <th className="px-12 py-3 text-left">Team / Project Name</th>
                          <th className="px-8 py-3 text-center w-40">Evaluators</th>
                          <th className="px-8 py-3 text-center w-40">Mean Score</th>
                          <th className="px-8 py-3 text-center w-40">Standard Div.</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.ranking.map((row) => (
                          <Fragment key={row.project_id}>
                            <tr
                              onClick={() => setExpandedProject(expandedProject === row.project_id ? null : row.project_id)}
                              className={`group transition-all duration-300 cursor-pointer relative
                              ${expandedProject === row.project_id ? 'scale-[1.01] z-10' : 'hover:scale-[1.005] hover:-translate-y-0.5 z-0'}
                            `}
                            >
                              <td className="bg-white rounded-l-lg py-5 px-8 border-y border-l border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all text-center">
                                <div className={`
                                size-12 rounded-lg flex items-center justify-center font-black text-xl shadow-inner
                                ${row.rank === 1 ? 'bg-amber-100 text-amber-500 ring-4 ring-amber-50 ring-offset-2' :
                                    row.rank === 2 ? 'bg-slate-100 text-slate-500 ring-4 ring-slate-50 ring-offset-2' :
                                      row.rank === 3 ? 'bg-orange-100 text-orange-600 ring-4 ring-orange-50 ring-offset-2' :
                                        'bg-indigo-50/50 text-indigo-300'}
                              `}>
                                  {row.rank}
                                </div>
                              </td>
                              <td className="bg-white py-5 px-12 border-y border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all">
                                <span className="font-bold text-slate-700 text-lg group-hover:text-indigo-700 transition-colors">{row.project_name}</span>
                              </td>
                              <td className="bg-white py-5 px-8 text-center border-y border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all">
                                <span className="font-mono font-bold text-slate-400 text-lg">{row.evaluator_count}</span>
                              </td>
                              <td className="bg-white py-5 px-8 text-center border-y border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all">
                                <span className="font-black text-2xl text-slate-800 tracking-tight">{row.overall_mean.toFixed(2)}</span>
                              </td>
                              <td className="bg-white py-5 px-8 text-center border-y border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all">
                                <span className="text-sm font-medium text-slate-400 bg-slate-50 rounded-lg px-2 py-1">{row.overall_sd.toFixed(2)}</span>
                              </td>
                              <td className="bg-white rounded-r-lg py-5 px-4 text-center border-y border-r border-indigo-50/50 shadow-sm group-hover:shadow-indigo-100/50 transition-all">
                                <div className={`
                                rounded-lg p-2 transition-colors duration-200
                                ${expandedProject === row.project_id
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'}
                              `}>
                                  <ChevronDownIcon
                                    size={20}
                                    className={`stroke-[3] transition-transform duration-300 ${expandedProject === row.project_id ? 'rotate-180' : ''}`}
                                  />
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Details */}
                            {expandedProject === row.project_id && (
                              <tr className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <td colSpan={6} className="p-0">
                                  <div
                                    className="mx-4 mb-6 mt-[-12px] bg-slate-50/80 rounded-b-lg border-x border-b border-indigo-100/50 p-8 shadow-inner overflow-hidden"
                                  >
                                    <div className="mb-6 flex items-center justify-between">
                                      <h4 className="text-sm font-bold text-indigo-900/40 uppercase tracking-widest flex items-center gap-2">
                                        <ActivityIcon className="size-4" /> Detailed Statistics
                                      </h4>
                                      <div className="h-px bg-indigo-100 flex-1 ml-4" />
                                    </div>

                                    <div className="grid gap-3">
                                      {row.per_question && row.per_question.map((pq, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/80 p-4 rounded-lg border border-indigo-50 shadow-sm hover:border-indigo-200 transition-colors">
                                          <span className="text-slate-700 font-semibold flex-1 mr-8 text-sm">{pq.question_text}</span>

                                          <div className="flex items-center gap-8 text-xs text-slate-400 shrink-0">
                                            <div className="flex flex-col items-center min-w-[60px]">
                                              <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">Mean</span>
                                              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-mono text-base px-2.5 py-0.5 border-indigo-100/50">
                                                {pq.mean.toFixed(2)}
                                              </Badge>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100" />
                                            <div className="flex flex-col items-center min-w-[50px]">
                                              <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">SD</span>
                                              <span className="font-mono text-slate-500 font-medium">{pq.sd.toFixed(2)}</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100" />
                                            <div className="flex flex-col items-center min-w-[40px]">
                                              <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">Count</span>
                                              <span className="font-mono font-medium text-slate-600">{pq.count}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {(!row.per_question || row.per_question.length === 0) && (
                                        <div className="text-center text-slate-400 py-4 italic">No detailed question stats available</div>
                                      )}
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
              </div>
            </section>

            {/* Student Monitoring Section */}
            <section className="bg-white/70 backdrop-blur-2xl rounded-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="px-12 py-8 border-b border-indigo-50/50 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100/50">
                    <UsersIcon className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      ติดตามการประเมิน (Student Monitoring)
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      ตรวจสอบความคืบหน้าการประเมินของนักศึกษาแต่ละคน
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-bold tracking-wide px-4">
                  ดูทั้งหมด <ArrowRightIcon className="ml-2 size-4 stroke-[3]" />
                </Button>
              </div>

              <div className="p-0">
                {stats.student_monitor.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                    <BoxIcon className="size-16 mb-4 text-slate-200 stroke-1" />
                    <p className="font-medium">ยังไม่มีนักศึกษาลงทะเบียนในระบบ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                          <th className="px-12 py-5 text-left w-32">ID</th>
                          <th className="px-6 py-5 text-left">Student Name</th>
                          <th className="px-6 py-5 text-left">Team</th>
                          <th className="px-6 py-5 text-center">Evaluated</th>
                          <th className="px-6 py-5 text-left w-1/4">Progress</th>
                          <th className="px-8 py-5 text-right w-40">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50/50">
                        {stats.student_monitor.slice(0, 50).map((s) => {
                          const progress = Math.min(100, (s.evaluated_count / (s.total_to_evaluate || 1)) * 100);
                          const isComplete = s.complete;
                          return (
                            <tr key={s.student_id} className="hover:bg-indigo-50/30 transition-colors group">
                              <td className="px-12 py-5 text-sm font-mono text-slate-500 font-medium">{s.student_id}</td>
                              <td className="px-6 py-5">
                                <span className="font-bold text-slate-700 text-base">{s.name}</span>
                              </td>
                              <td className="px-6 py-5">
                                <Badge variant="secondary" className="bg-white border border-indigo-100 text-indigo-600 font-semibold shadow-sm rounded-md px-2.5 py-1 group-hover:bg-indigo-200 group-hover:text-indigo-800 transition-colors">
                                  {s.own_group}
                                </Badge>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <div className="inline-flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-slate-800">{s.evaluated_count}</span>
                                  <span className="text-slate-300 text-sm font-medium mx-0.5">/</span>
                                  <span className="text-slate-400 text-base font-medium">5</span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-50">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="mt-1.5 flex justify-end">
                                  <span className="text-[10px] font-bold text-slate-400">{Math.round(progress)}%</span>
                                </div>
                              </td>
                              <td className="px-12 py-5 text-right">
                                {isComplete ? (
                                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm">
                                    <CheckCircle2Icon className="size-3.5 fill-emerald-100" />
                                    <span className="text-[10px] font-bold tracking-wider">COMPLETED</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                    <ClockIcon className="size-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold tracking-wider">IN PROGRESS</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {stats.student_monitor.length > 50 && (
                  <div className="p-4 text-center border-t border-slate-100 bg-slate-50/30">
                    <span className="text-xs text-slate-400 font-medium">Showing first 50 students</span>
                  </div>
                )}
              </div>
            </section>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="size-16 bg-indigo-200 rounded-2xl"></div>
              <div className="h-4 w-56 bg-indigo-100 rounded-lg"></div>
              <div className="h-3 w-40 bg-indigo-50 rounded-lg"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
