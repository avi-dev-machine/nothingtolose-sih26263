"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  UserCheck,
  Search,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const { loginAs, isLoading } = useAuth();
  const router = useRouter();
  const [searchRef, setSearchRef] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      router.push(`/verify/${searchRef.trim().toUpperCase()}`);
    }
  };

  const personas = [
    {
      role: "AICTE_ADMIN",
      email: "admin@aicte.gov.in",
      title: "AICTE Regulatory Administrator",
      description: "National oversight, approved intake vs enrolment monitoring, duplicate review queue, compliance rulings.",
      badge: "National Regulator",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      buttonColor: "bg-[#0F2042] hover:bg-blue-900 text-white",
      icon: ShieldCheck,
      keyScenario: "Investigate Eastern Institute intake violation (180 approved vs 186 regular enrolled).",
    },
    {
      role: "INSTITUTION_ADMIN",
      email: "admin@eit.edu.in",
      title: "Eastern Institute of Technology (Principal)",
      description: "Manage institution admissions, upload bulk CSV, inspect row-level format/duplicate findings, resolve errors.",
      badge: "Featured Institution",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: Building2,
      keyScenario: "186 enrolled regular CSE cohort (+6 excess intake alert) & batch uploads.",
    },
    {
      role: "STUDENT",
      email: "student@eit.edu.in",
      title: "Student Academic Identity",
      description: "View verified academic identity, masked APAAR ID, enrolment credentials, and digital verification QR code.",
      badge: "Student Persona",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      buttonColor: "bg-emerald-700 hover:bg-emerald-800 text-white",
      icon: GraduationCap,
      keyScenario: "Aarav Banerjee - B.Tech CSE verifiable academic record.",
    },
    {
      role: "AUTHORIZED_VERIFIER",
      email: "verifier@tcs.com",
      title: "Authorized Verifier (TCS Lead)",
      description: "Cryptographically verify student credentials, view minimum permitted claims, test tamper detection.",
      badge: "External Verifier",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      buttonColor: "bg-purple-700 hover:bg-purple-800 text-white",
      icon: UserCheck,
      keyScenario: "Verify VRF-2026-EIT001 with HMAC cryptographic integrity proof.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0F2042] via-slate-900 to-[#162D59] text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>AICTE Smart India Hackathon 2026 Prototype</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            APAARSetu — National Academic Identity & Student Verification Platform
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            One Academic Identity. Verified Records. Smarter Governance. Connecting AICTE-approved
            institutions, regulatory councils, and authorized verifiers through a trusted,
            traceable academic identity infrastructure.
          </p>

          {/* Quick Public Credential Verification Bar */}
          <div className="pt-4 max-w-xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Verification Reference (e.g., VRF-2026-EIT001)"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-600 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1 shrink-0"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-400">
              <span>Quick demo links:</span>
              <button
                type="button"
                onClick={() => router.push("/verify/VRF-2026-EIT001")}
                className="text-amber-400 hover:underline font-mono"
              >
                VRF-2026-EIT001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => router.push("/verify/VRF-2026-EIT002")}
                className="text-amber-400 hover:underline font-mono"
              >
                VRF-2026-EIT002
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection / Demo Personas Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Select a Demo Persona (One-Click Instant Access)
          </h2>
          <p className="text-xs text-slate-500">
            Preloaded with deterministic synthetic institutions, admission cohorts, intake violations, and cross-institution candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-800">
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{p.email}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-900">Key SIH Scenario: </span>
                    {p.keyScenario}
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    disabled={isLoading}
                    onClick={() => loginAs(p.role, p.email)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center space-x-2 ${p.buttonColor}`}
                  >
                    <span>Launch as {p.title.split("(")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Trust & APAAR Identity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            APAAR format validation, keyed HMAC identity fingerprints for privacy, and digitally signed canonical credential payloads.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Intelligence Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Within-batch duplicate detection, cross-institution concurrent active enrolment alerts, and supernumerary quota separation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Regulatory Governance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real-time approved intake vs regular enrolment tracking (180 vs 186 demo scenario), compliance case assignment, and audit trails.
          </p>
        </div>
      </div>
    </div>
  );
}
