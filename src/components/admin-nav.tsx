"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/forms", label: "จัดการฟอร์ม" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-sm tracking-tight">CPES</span>
            <span className="text-muted-foreground text-xs hidden sm:inline">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← หน้านักศึกษา
        </Link>
      </div>
    </header>
  );
}
