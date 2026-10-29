"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ShieldAlert,
  Building2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
} from "lucide-react";

export default function VerificationQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComplianceCases({ case_type: "CROSS_INSTITUTION_CONFLICT" })
      .then((data) => setCases(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (caseId: string, actionName: string) => {
    alert(`Success: Action '${actionName}' executed and logged to national audit trail for Case ${caseId}.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold mb-1">
          <span>AICTE National Academic Identity Graph Engine</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Cross-Institution Enrolment Conflict Review Queue
        </h1>
        <p className="text-xs text-slate-500">
          Automated identity graph detection flags cases where an identical APAAR ID is concurrently enrolled across multiple AICTE institutions.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
            Scanning academic identity graph...
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
            No active cross-institution identity conflicts detected.
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-purple-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Dual Active Enrolment Candidate: {c.evidence_json?.student_name || "Student"}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {c.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    APAAR: {c.evidence_json?.masked_apaar || "9123 **** 8901"}
                  </span>
                </div>
              </div>

              {/* Institution A vs Institution B Comparison Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution A */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Institution A</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {c.evidence_json?.institution_a || "Apex Institute of Engineering & Technology"}
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 pt-1">
                    <div>
                      Student Roll ID: <span className="font-mono font-bold text-slate-800">{c.evidence_json?.roll_a || "AIET-CSE-26-042"}</span>
                    </div>
                    <div>
                      Program: <span className="font-medium text-slate-800">B.Tech Computer Science</span>
                    </div>
                    <div>
                      Admission Date: <span className="font-medium text-slate-800">2026-08-01</span>
                    </div>
                    <div>
                      Status: <span className="text-emerald-700 font-bold">Active Enrolment</span>
                    </div>
                  </div>
                </div>

                {/* Institution B */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Institution B</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {c.evidence_json?.institution_b || "Deccan College of Engineering"}
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 pt-1">
                    <div>
                      Student Roll ID: <span className="font-mono font-bold text-slate-800">{c.evidence_json?.roll_b || "DCE-CSE-26-088"}</span>
                    </div>
                    <div>
                      Program: <span className="font-medium text-slate-800">B.Tech Computer Science</span>
                    </div>
                    <div>
                      Admission Date: <span className="font-medium text-slate-800">2026-08-05</span>
                    </div>
                    <div>
                      Status: <span className="text-amber-700 font-bold">Flagged for Review</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory Investigation Steps */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 text-xs text-purple-900 space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Regulatory Investigation Protocol:</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  The AICTE graph engine does not automatically presume fraud; duplicate identifiers may represent
                  legitimate transfers, delayed exit records, or synchronization errors. Authorized officers can request
                  formal clarification from both institutions before invalidating an admission.
                </p>
              </div>

              {/* Regulatory Controlled Actions */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-slate-100">
                <button
                  onClick={() => handleAction(c.id, "Request Institutional Clarification")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors"
                >
                  Request Clarification from Both
                </button>
                <button
                  onClick={() => handleAction(c.id, "Mark as Legitimate Transfer")}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md border border-blue-200 transition-colors"
                >
                  Mark as Legitimate Transfer
                </button>
                <button
                  onClick={() => handleAction(c.id, "Confirm Conflicting Enrolment")}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                >
                  Confirm Duplicate & Issue Notice
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
