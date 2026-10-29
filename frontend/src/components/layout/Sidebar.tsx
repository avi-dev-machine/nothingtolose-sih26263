"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  FileCheck2,
  BarChart3,
  FileText,
  History,
  UploadCloud,
  Layers,
  Award,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  let navItems: { label: string; href: string; icon: any; badge?: string }[] = [];

  if (user.role === "AICTE_ADMIN") {
    navItems = [
      { label: "National Dashboard", href: "/aicte/dashboard", icon: LayoutDashboard },
      { label: "AICTE Institutions", href: "/aicte/institutions", icon: Building2 },
      { label: "Intake Compliance", href: "/aicte/compliance", icon: AlertTriangle, badge: "Cases" },
      { label: "Verification Queue", href: "/aicte/verification-queue", icon: ShieldAlert, badge: "Conflicts" },
      { label: "Student Registry", href: "/aicte/students", icon: Users },
      { label: "National Analytics", href: "/aicte/analytics", icon: BarChart3 },
      { label: "Regulatory Reports", href: "/aicte/reports", icon: FileText },
      { label: "Audit Trail", href: "/aicte/audit-logs", icon: History },
    ];
  } else if (user.role === "INSTITUTION_ADMIN") {
    navItems = [
      { label: "Institution Dashboard", href: "/institution/dashboard", icon: LayoutDashboard },
      { label: "Upload Admissions", href: "/institution/uploads/new", icon: UploadCloud, badge: "CSV" },
      { label: "Submissions History", href: "/institution/uploads", icon: FileCheck2 },
      { label: "Student Records", href: "/institution/students", icon: Users },
      { label: "Programs & Intake", href: "/institution/programs", icon: Layers },
      { label: "Compliance Alerts", href: "/institution/compliance", icon: AlertTriangle },
      { label: "Institution Reports", href: "/institution/reports", icon: FileText },
    ];
  } else if (user.role === "STUDENT") {
    navItems = [
      { label: "Academic Profile", href: "/student/dashboard", icon: Award },
      { label: "Verifiable Credential", href: "/student/records", icon: FileCheck2 },
    ];
  } else if (user.role === "AUTHORIZED_VERIFIER") {
    navItems = [
      { label: "Verify Credential", href: "/verifier/check", icon: SearchCheck },
      { label: "Verification Log", href: "/verifier/dashboard", icon: History },
    ];
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Context Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Active Workspace
        </div>
        <div className="text-sm font-bold text-white truncate mt-0.5">
          {user.role === "AICTE_ADMIN"
            ? "AICTE Central Headquarters"
            : user.institution_name || user.full_name}
        </div>
        <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
          Academic Year 2026–27
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? "bg-blue-700 text-white" : "bg-slate-800 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>APAAR Engine</span>
          <span className="text-emerald-400 font-mono text-[10px]">v1.0.0 Online</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Govt. of India Regulatory Prototype
        </div>
      </div>
    </aside>
  );
}
