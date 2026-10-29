"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Building2, Search, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";

export default function AicteInstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getInstitutions()
      .then((data) => setInstitutions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.institution_code.toLowerCase().includes(search.toLowerCase()) ||
      i.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AICTE Approved Institutions Directory
          </h1>
          <p className="text-xs text-slate-500">
            Registered technical universities and colleges with active admission submissions.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading institutions directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">AICTE Code</th>
                  <th className="p-3">Institution Name</th>
                  <th className="p-3">State & District</th>
                  <th className="p-3">Programs</th>
                  <th className="p-3">Enrolment</th>
                  <th className="p-3">Compliance Status</th>
                  <th className="p-3">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filtered.map((inst) => {
                  const hasCases = inst.compliance_cases_count > 0;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {inst.institution_code}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{inst.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inst.contact_email}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{inst.state}</span>
                        <span className="text-slate-500 block text-[11px]">{inst.district}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {inst.programs_count} Programs
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        {inst.total_enrolment} Students
                      </td>
                      <td className="p-3">
                        {hasCases ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{inst.compliance_cases_count} Case(s) Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Compliant
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {inst.approval_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
