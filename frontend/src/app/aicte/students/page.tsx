"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Search, Download, ExternalLink } from "lucide-react";

export default function AicteStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudents({ search, limit: 50 })
      .then((res) => {
        setStudents(res.items || []);
        setTotal(res.total || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            National Centralized Student Registry
          </h1>
          <p className="text-xs text-slate-500">
            Validated academic enrolment records across all approved technical institutions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="http://localhost:8000/api/v1/students/export/csv"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registry CSV</span>
          </a>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all institutions by student name, roll ID, or APAAR ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Total Enrolled: {total} Records
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Keyed HMAC Protection Active
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading student registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Institutional Roll</th>
                  <th className="p-3">Student Full Name</th>
                  <th className="p-3">Masked APAAR ID</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Quota Category</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Credential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {st.institutional_student_id}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="p-3 font-mono text-amber-700 font-semibold text-[11px]">
                      {st.masked_apaar_id}
                    </td>
                    <td className="p-3 font-medium text-slate-800">{st.institution_name}</td>
                    <td className="p-3 font-medium text-slate-800">{st.program_code}</td>
                    <td className="p-3">
                      {st.is_supernumerary ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Supernumerary ({st.supernumerary_category})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          Regular Merit
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {st.external_verification_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {st.credential_reference && (
                        <a
                          href={`/verify/${st.credential_reference}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-blue-600 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{st.credential_reference}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
