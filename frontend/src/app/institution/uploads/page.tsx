"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FileCheck2, UploadCloud, Download, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SubmissionsHistoryPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSubmissions()
      .then((data) => setSubmissions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Batch Submissions & Ingestion History
          </h1>
          <p className="text-xs text-slate-500">
            Audit history of all institutional admissions files uploaded and staged for AICTE central verification.
          </p>
        </div>
        <Link
          href="/institution/uploads/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload New File</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No submissions uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Academic Year</th>
                  <th className="p-3">Total Rows</th>
                  <th className="p-3">Valid Records</th>
                  <th className="p-3">Invalid Rows</th>
                  <th className="p-3">Duplicates</th>
                  <th className="p-3">Submission Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sub.file_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Hash: {sub.file_hash.slice(0, 12)}...
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{sub.academic_year_label}</td>
                    <td className="p-3 font-mono font-bold">{sub.total_rows}</td>
                    <td className="p-3 font-mono text-emerald-700 font-semibold">{sub.valid_rows}</td>
                    <td className="p-3 font-mono text-red-600 font-semibold">{sub.invalid_rows}</td>
                    <td className="p-3 font-mono text-amber-600 font-semibold">
                      {sub.duplicate_candidates}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`http://localhost:8000/api/v1/submissions/${sub.id}/export-errors`}
                        className="px-2 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-[11px] font-medium inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Errors</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
