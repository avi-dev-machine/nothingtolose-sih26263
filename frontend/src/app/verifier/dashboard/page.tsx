"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { History, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

export default function VerifierDashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditEvents({ action: "CREDENTIAL_VERIFIED" })
      .then((data) => setEvents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Verifier Activity & Verification History
          </h1>
          <p className="text-xs text-slate-500">
            Immutable audit record of all credential verification queries performed by your organization.
          </p>
        </div>
        <Link
          href="/verifier/check"
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
        >
          <span>Verify New Record</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verification Inquiries Log
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {events.length} Recorded Queries
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading audit history...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No verifications logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Reference Token</th>
                  <th className="p-3">Integrity Outcome</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const ref = ev.sanitized_metadata?.reference || "N/A";
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {new Date(ev.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-700">{ref}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ev.outcome}
                        </span>
                      </td>
                      <td className="p-3">
                        {ref !== "N/A" && (
                          <Link
                            href={`/verify/${ref}`}
                            className="text-blue-600 hover:underline inline-flex items-center space-x-1"
                          >
                            <span>View Result</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
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
