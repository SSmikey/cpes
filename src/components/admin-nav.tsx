"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, ClipboardList, Layers, ArrowLeft } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/forms", label: "จัดการประเมิน", icon: ClipboardList },
    { href: "/admin/groups", label: "จัดการกลุ่ม", icon: Layers },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 shadow-sm sticky top-0 z-50">
      <nav className="max-w-[1920px] mx-auto h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Logo Section */}
          <Link href="/admin" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="size-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-indigo-200 shadow-md">
              C
            </div>
            <div className="flex flex-col ml-3.5">
              <span className="font-extrabold text-slate-800 text-xl tracking-tight leading-none">CPES</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Admin Panel</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200/60 hidden sm:block" />

          {/* Navigation Links */}
          <div className="flex items-center gap-4 hidden sm:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border ${isActive
                    ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100/50 font-bold scale-105"
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 font-medium"
                    }`}
                >
                  <Icon className={`size-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                  <span className="text-base tracking-tight">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-xl bg-white border border-slate-200/60 shadow-sm hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/30 transition-all duration-300"
          >
            <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft className="size-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-700 transition-colors">หน้านักศึกษา</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
