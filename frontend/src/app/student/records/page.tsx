"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FileCheck2, ExternalLink, ShieldCheck } from "lucide-react";

export default function StudentRecordsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudents({ limit: 10 })
      .then((res) => setStudents(res.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Verifiable Academic Credentials
        </h1>
        <p className="text-xs text-slate-500">
          Official academic admission and enrolment records anchored to the AICTE Central Repository.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Academic Credentials Roster
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {students.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading academic records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Reference Token</th>
                  <th className="p-3">Program & Discipline</th>
                  <th className="p-3">Cohort</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {st.credential_reference || "N/A"}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{st.program_name}</div>
                      <div className="text-[11px] text-slate-500">{st.institution_name}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{st.academic_year_label}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {st.external_verification_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {st.credential_reference && (
                        <Link
                          href={`/verify/${st.credential_reference}`}
                          className="text-blue-600 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
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
