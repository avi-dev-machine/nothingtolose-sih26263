"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Building2,
  GraduationCap,
  CheckCircle2,
  UserCheck,
  FileSearch,
} from "lucide-react";

export default function Navbar() {
  const { user, loginAs, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const demoAccounts = [
    {
      role: "AICTE_ADMIN",
      title: "AICTE National Admin",
      subtitle: "National oversight, compliance, intake regulation",
      email: "admin@aicte.gov.in",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      role: "INSTITUTION_ADMIN",
      title: "Eastern Institute of Tech (Featured)",
      subtitle: "180 approved vs 186 regular enrolled case",
      email: "admin@eit.edu.in",
      icon: Building2,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      role: "INSTITUTION_ADMIN",
      title: "Apex Institute of Tech",
      subtitle: "Maharashtra engineering college",
      email: "admin@aiet.edu.in",
      icon: Building2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      role: "STUDENT",
      title: "Student (Aarav Banerjee)",
      subtitle: "B.Tech CSE student record & verifiable credential",
      email: "student@eit.edu.in",
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      role: "AUTHORIZED_VERIFIER",
      title: "Verifier (TCS Lead)",
      subtitle: "Employer background check & integrity verification",
      email: "verifier@tcs.com",
      icon: UserCheck,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F2042] text-white border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Platform Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner text-slate-900 font-extrabold text-xl tracking-wider">
                अ
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    APAARSetu
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded uppercase tracking-wider">
                    AICTE Central Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  National Academic Identity & Verification Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action: Demo Persona Switcher & User Details */}
          <div className="flex items-center space-x-3">
            <Link
              href="/verify/VRF-2026-EIT001"
              className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
            >
              <FileSearch className="w-3.5 h-3.5 text-amber-400 mr-1" />
              Public Verification
            </Link>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-md border border-slate-600 text-slate-200 transition-colors shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">
                  {user ? user.role.replace("_", " ") : "Demo Switcher"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Role (Judge Demo Mode)
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {demoAccounts.map((acc, idx) => {
                      const Icon = acc.icon;
                      const isActive = user?.email === acc.email;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            loginAs(acc.role, acc.email);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-start space-x-2.5 ${
                            isActive ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className={`p-1.5 rounded border mt-0.5 ${acc.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {acc.title}
                              </span>
                              {isActive && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {acc.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Active User info & Logout */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-white leading-tight">
                    {user.full_name.split("(")[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {user.institution_name ? user.institution_name.split(" ")[0] : user.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
