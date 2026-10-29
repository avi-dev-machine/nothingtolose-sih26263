"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Layers, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function InstitutionProgramsPage() {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIntakes()
      .then((data) => setIntakes(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Approved Academic Programs & Sanctioned Intake
        </h1>
        <p className="text-xs text-slate-500">
          AICTE approved program list, regular intake ceilings, and supernumerary quotas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading programs...</div>
        ) : (
          intakes.map((prog) => {
            const isExceeded = prog.excess > 0;
            return (
              <div
                key={prog.id}
                className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 ${
                  isExceeded ? "border-amber-300 ring-1 ring-amber-300/50" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {prog.program_code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {prog.program_name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isExceeded
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {prog.status}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Approved
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {prog.approved_regular_intake}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Regular
                    </span>
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        isExceeded ? "text-red-700 font-bold" : "text-slate-900"
                      }`}
                    >
                      {prog.actual_regular_enrolment}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold block">
                      Supernumerary
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {prog.actual_supernumerary_enrolment}
                    </span>
                  </div>
                </div>

                {/* Utilization Calculation Explanation */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Intake Utilization:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {prog.utilization_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        isExceeded ? "bg-red-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.min(100, prog.utilization_percentage)}%` }}
                    />
                  </div>
                  {isExceeded && (
                    <div className="text-[11px] text-red-700 font-semibold pt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        Regular enrolment exceeds approved intake by {prog.excess} seats. Regulatory review required.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
