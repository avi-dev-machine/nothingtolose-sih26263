"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  History,
  QrCode,
  ExternalLink,
  Edit3,
} from "lucide-react";

export default function StudentRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getStudent(id)
      .then((data) => setStudent(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-slate-500">
          Loading student record...
        </div>
      ) : student ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {student.full_name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {student.record_status}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Version v{student.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Roll ID: <span className="font-mono font-bold text-slate-900">{student.institutional_student_id}</span> • Protected APAAR:{" "}
                <span className="font-mono font-bold text-amber-700">{student.masked_apaar_id}</span>
              </p>
            </div>

            {student.credential_reference && (
              <Link
                href={`/verify/${student.credential_reference}`}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <span>Verify Credential</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Admission Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Program Code</span>
              <span className="font-bold text-slate-900 font-mono">{student.program_code}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Academic Cohort</span>
              <span className="font-bold text-slate-900 font-mono">{student.academic_year_label}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Admission Date</span>
              <span className="font-semibold text-slate-900">{student.admission_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Category</span>
              <span className="font-semibold text-slate-900">
                {student.is_supernumerary ? `Supernumerary (${student.supernumerary_category})` : student.admission_category}
              </span>
            </div>
          </div>

          {/* Immutable Audit History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <History className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audit Trail for this Student Record
              </h3>
            </div>
            {student.audit_history?.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No modification history recorded.</p>
            ) : (
              <div className="space-y-2">
                {student.audit_history?.map((a: any) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{a.action}</span>
                      <span className="text-slate-500 ml-2">by {a.actor_id} ({a.actor_role})</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
