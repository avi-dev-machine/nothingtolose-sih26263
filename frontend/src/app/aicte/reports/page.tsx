"use client";

import React from "react";
import { Download, FileText, ShieldCheck } from "lucide-react";

export default function AicteReportsPage() {
  const reports = [
    {
      title: "Intake Compliance & Excess Admissions Report",
      description: "Itemized regulatory report documenting sanctioned regular intake vs enrolled admissions and compliance rulings.",
      url: "http://localhost:8000/api/v1/reports/compliance-cases",
      filename: "aicte_compliance_cases_report.csv",
    },
    {
      title: "National Program Capacity Utilization Report",
      description: "Institution-wise and program-wise regular intake, actual regular enrolment, and supernumerary admissions.",
      url: "http://localhost:8000/api/v1/reports/intake-utilization",
      filename: "aicte_national_intake_utilization.csv",
    },
    {
      title: "Central Student Identity Roster",
      description: "National student admission dataset with protected APAAR masks and cryptographic credential tokens.",
      url: "http://localhost:8000/api/v1/students/export/csv",
      filename: "aicte_central_student_roster.csv",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          AICTE Central Regulatory Reports & Data Exports
        </h1>
        <p className="text-xs text-slate-500">
          Official downloadable datasets for Council oversight, intake compliance, and institutional auditing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reports.map((r, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
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
