"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/forms", label: "จัดการประเมิน" },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 shadow-sm sticky top-0 z-50">
      <nav className="max-w-[1920px] mx-auto h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
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
          <div className="h-8 w-px bg-slate-200/60 hidden sm:block" />

          {/* Navigation Links */}
          <div className="flex items-center gap-6 hidden sm:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-all duration-200 ${isActive
                    ? "font-bold text-slate-900 scale-105"
                    : "font-medium text-slate-500 hover:text-indigo-600"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Placeholder (if needed) or just the back link */}
          <Link
            href="/"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300"
          >
            <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">←</span>
            <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-700 transition-colors">หน้านักศึกษา</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
