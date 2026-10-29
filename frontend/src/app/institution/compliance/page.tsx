"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function InstitutionCompliancePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComplianceCases()
      .then((data) => setCases(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Regulatory Compliance Notices & Audit Flags
        </h1>
        <p className="text-xs text-slate-500">
          Official notifications and cases raised by the AICTE Compliance Engine.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
            Loading compliance cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-emerald-700 font-semibold space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p>No active compliance cases for your institution. Fully compliant.</p>
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-amber-300 p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {c.case_type.replace(/_/g, " ")} — {c.program_name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
                    {c.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Evidence Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  AICTE Detection Evidence:
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">
                  {c.evidence_json?.explanation || "Excess regular enrolment observed against sanctioned capacity."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Sanctioned Regular:</span>
                    <span className="font-bold text-slate-900">{c.evidence_json?.approved_regular_intake || 180}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Observed Regular:</span>
                    <span className="font-bold text-red-700">{c.evidence_json?.actual_regular_enrolment || 186}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Excess Seats:</span>
                    <span className="font-bold text-red-700">+{c.evidence_json?.excess_count || 6}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Supernumerary:</span>
                    <span className="font-bold text-emerald-700">{c.evidence_json?.supernumerary_count || 5}</span>
                  </div>
                </div>
              </div>

              {/* Decision if any */}
              {c.decision && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-bold text-blue-900 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Regulatory Ruling Recorded: {c.decision}</span>
                  </div>
                  <p className="text-blue-800 text-[11px]">{c.decision_reason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
