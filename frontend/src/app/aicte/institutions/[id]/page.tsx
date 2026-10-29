"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Building2,
  ArrowLeft,
  Layers,
  AlertTriangle,
  FileCheck2,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AicteInstitutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [institution, setInstitution] = useState<any | null>(null);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [complianceCases, setComplianceCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const [inst, intk, subs, cases] = await Promise.all([
          api.getInstitution(id),
          api.getIntakes(id),
          api.getSubmissions(id),
          api.getComplianceCases({ institution_id: id }),
        ]);
        setInstitution(inst);
        setIntakes(intk);
        setSubmissions(subs);
        setComplianceCases(cases);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Institutions</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-slate-500">
          Loading institutional regulatory profile...
        </div>
      ) : institution ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {institution.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {institution.approval_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Code: <span className="font-mono font-bold text-slate-800">{institution.institution_code}</span> • State: {institution.state} • District: {institution.district}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Official Contact</span>
              <span className="text-xs font-mono text-slate-800 font-semibold">{institution.contact_email}</span>
            </div>
          </div>

          {/* Program Capacity Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Approved Academic Programs & Capacity
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Academic Year 2026–27</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Program Code</th>
                    <th className="p-3">Program Name</th>
                    <th className="p-3">Approved Regular</th>
                    <th className="p-3">Enrolled Regular</th>
                    <th className="p-3">Supernumerary</th>
                    <th className="p-3">Utilization</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {intakes.map((prog) => {
                    const isExceeded = prog.excess > 0;
                    return (
                      <tr key={prog.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{prog.program_code}</td>
                        <td className="p-3 font-semibold text-slate-900">{prog.program_name}</td>
                        <td className="p-3 font-mono">{prog.approved_regular_intake}</td>
                        <td className={`p-3 font-mono font-bold ${isExceeded ? "text-red-600" : "text-slate-900"}`}>
                          {prog.actual_regular_enrolment}
                        </td>
                        <td className="p-3 font-mono text-emerald-700 font-semibold">
                          {prog.actual_supernumerary_enrolment}
                        </td>
                        <td className="p-3 font-mono font-bold">{prog.utilization_percentage}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isExceeded
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {prog.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Compliance Notices */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Compliance Cases ({complianceCases.length})
                </h3>
              </div>
              {complianceCases.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No regulatory alerts for this institution.</p>
              ) : (
                complianceCases.map((c) => (
                  <div key={c.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{c.case_type}</span>
                      <span className="text-[10px] text-amber-800">{c.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{c.evidence_json?.explanation}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submission History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Data Submissions ({submissions.length})
                </h3>
              </div>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No admissions files submitted yet.</p>
              ) : (
                submissions.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{s.file_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.total_rows} Records • {s.status}</div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
