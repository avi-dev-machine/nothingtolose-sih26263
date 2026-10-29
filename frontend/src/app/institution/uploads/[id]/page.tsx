"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  FileCheck2,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [sub, setSub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getSubmission(id)
      .then((data) => setSub(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-slate-500">
          Loading submission inspector...
        </div>
      ) : sub ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {sub.file_name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                SHA-256 Hash: {sub.file_hash}
              </p>
            </div>

            <a
              href={`http://localhost:8000/api/v1/submissions/${sub.id}/export-errors`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Error Log</span>
            </a>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Rows</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">{sub.total_rows}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Valid Records</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono">{sub.valid_rows}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Invalid Rows</span>
              <div className="text-xl font-extrabold text-red-600 font-mono">{sub.invalid_rows}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Duplicate Candidates</span>
              <div className="text-xl font-extrabold text-amber-600 font-mono">{sub.duplicate_candidates}</div>
            </div>
          </div>

          {/* Findings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Row-Level Findings & Validation Diagnostics ({sub.findings?.length || 0})
              </h3>
            </div>
            {sub.findings?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No validation findings. Entire batch valid.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Row #</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Rule Code</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sub.findings?.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{f.row_number || "—"}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {f.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-800">{f.rule_code}</td>
                        <td className="p-3 text-slate-700">{f.message}</td>
                        <td className="p-3 font-bold text-slate-600 text-[10px]">{f.resolution_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
