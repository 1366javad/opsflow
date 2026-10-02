"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/work-items", label: "Work Items" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:py-4">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
