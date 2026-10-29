"use client";

import React from "react";
import { Users, ShieldCheck, UserPlus, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InstitutionUsersPage() {
  const { user } = useAuth();

  const usersList = [
    {
      name: "Prof. S. K. Mukherjee",
      email: "admin@eit.edu.in",
      role: "INSTITUTION_ADMIN (Principal)",
      status: "ACTIVE",
      permissions: "Full Institutional Access, Batch Finalization, Quota Review",
    },
    {
      name: "Dr. Bikash Banerjee",
      email: "admissions@eit.edu.in",
      role: "ADMISSION_OFFICER",
      status: "ACTIVE",
      permissions: "CSV Uploads, Student Record Verification, Draft Staging",
    },
    {
      name: "Tanmoy Sen",
      email: "data.operator@eit.edu.in",
      role: "DATA_OPERATOR",
      status: "ACTIVE",
      permissions: "Record Corrections, Template Exports",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional User Accounts & Role Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Manage authorized admission officers, data entry operators, and internal audit staff.
          </p>
        </div>
        <button
          onClick={() => alert("Demo mode: User roles are preconfigured for SIH evaluation.")}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Institutional User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Authorized Personnel Roster
          </span>
          <span className="text-xs text-slate-500 font-mono">Role-Based Access Control</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Permissions Scope</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{u.email}</td>
                  <td className="p-3 font-semibold text-blue-700">{u.role}</td>
                  <td className="p-3 text-slate-600 text-[11px]">{u.permissions}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
