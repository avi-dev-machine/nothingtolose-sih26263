"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function VerifierCheckPage() {
  const [ref, setRef] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (ref.trim()) {
      router.push(`/verify/${ref.trim().toUpperCase()}`);
    }
  };

  const sampleRefs = [
    { code: "VRF-2026-EIT001", student: "Aarav Banerjee", inst: "Eastern Institute of Technology", prog: "B.Tech CSE" },
    { code: "VRF-2026-EIT002", student: "Aditi Rao", inst: "Eastern Institute of Technology", prog: "B.Tech CSE" },
    { code: "VRF-2026-EIT003", student: "Rohan Verma", inst: "Eastern Institute of Technology", prog: "B.Tech CSE" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Authorized Background Verification Portal
            </h1>
            <p className="text-xs text-slate-500">
              Query academic enrolment records, check HMAC integrity status, and view minimum permitted claims.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Verification Reference Code
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. VRF-2026-EIT001"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <span>Verify Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sample References Grid */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pre-seeded Demo References (Click to Verify):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleRefs.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => router.push(`/verify/${s.code}`)}
                className="p-3 text-left rounded-lg bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
              >
                <div className="font-mono text-xs font-bold text-purple-700 group-hover:text-purple-900">
                  {s.code}
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-1">{s.student}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{s.inst}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
