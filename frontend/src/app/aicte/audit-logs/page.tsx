"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { History, ShieldCheck, Search, Filter } from "lucide-react";

export default function AicteAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditEvents({ action: filterAction, limit: 100 });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            National Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Append-only chronological record of all administrative, compliance, verification, and correction actions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="BATCH_VALIDATED">Batch Validations</option>
            <option value="COMPLIANCE_DECISION_RECORDED">Compliance Rulings</option>
            <option value="STUDENT_RECORD_CORRECTED">Record Corrections</option>
            <option value="CREDENTIAL_VERIFIED">Credential Inquiries</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Audit Event Stream ({logs.length} Logged Events)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Tamper-Resistant Append-Only Log
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Actor / Principal</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource Target</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3">Sanitized Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {logs.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-800 font-medium text-[11px]">
                      {ev.actor_id}
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ev.actor_role}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900 font-mono text-[11px]">
                      {ev.action}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {ev.resource_type}: {ev.resource_id.slice(0, 10)}...
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.outcome === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ev.outcome}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {ev.sanitized_metadata ? JSON.stringify(ev.sanitized_metadata) : "—"}
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
