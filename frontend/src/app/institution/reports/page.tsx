"use client";

import React from "react";
import { Download, FileText } from "lucide-react";

export default function InstitutionReportsPage() {
  const reports = [
    {
      title: "Student Enrolment Roster",
      description: "Complete list of admitted students with masked APAAR IDs, quota classifications, and verification status.",
      url: "http://localhost:8000/api/v1/students/export/csv",
      filename: "institutional_enrolment_roster.csv",
    },
    {
      title: "Intake Utilization & Compliance Summary",
      description: "Program-level approved intake versus actual regular and supernumerary enrolment.",
      url: "http://localhost:8000/api/v1/reports/intake-utilization",
      filename: "program_intake_utilization.csv",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Downloadable Institutional Reports
        </h1>
        <p className="text-xs text-slate-500">
          Generated audit reports for admission compliance, seat allocations, and verification coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-2">
              <a
                href={r.url}
                download={r.filename}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report CSV</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
