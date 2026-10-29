"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  X,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function AicteCompliancePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [assigningCase, setAssigningCase] = useState<any | null>(null);
  const [officerName, setOfficerName] = useState("");

  // Decision Modal
  const [decidingCase, setDecidingCase] = useState<any | null>(null);
  const [decision, setDecision] = useState("ISSUE_WARNING");
  const [decisionReason, setDecisionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getComplianceCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCase || !officerName) return;
    setSubmitting(true);
    try {
      await api.assignComplianceCase(assigningCase.id, officerName);
      alert(`Success: Case assigned to ${officerName}`);
      setAssigningCase(null);
      setOfficerName("");
      loadCases();
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decidingCase || !decisionReason) return;
    setSubmitting(true);
    try {
      await api.recordComplianceDecision(decidingCase.id, decision, decisionReason);
      alert("Success: Regulatory decision recorded in central repository and logged to audit trail!");
      setDecidingCase(null);
      setDecisionReason("");
      loadCases();
    } catch (err: any) {
      alert(`Decision error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-200 text-xs font-semibold mb-1">
          <span>AICTE Regulatory Disciplinary & Compliance Queue</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Intake Compliance Investigations & Decisions
        </h1>
        <p className="text-xs text-slate-500">
          Cases raised when institutional submissions exceed sanctioned regular capacity or produce severe identity anomalies.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
            Loading compliance queue...
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-emerald-700">
            No open compliance violations found.
          </div>
        ) : (
          cases.map((c) => {
            const isResolved = c.status === "RESOLVED";
            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 ${
                  isResolved ? "border-slate-200 opacity-90" : "border-amber-300 ring-1 ring-amber-300/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {c.institution_code}
                      </span>
                      <span className="text-xs font-bold text-slate-700">•</span>
                      <span className="text-sm font-bold text-slate-900">{c.institution_name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Program: <span className="font-semibold text-slate-800">{c.program_name}</span> ({c.program_code}) • Academic Year {c.academic_year_label}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
                      {c.priority} Priority
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 text-xs">Regulatory Rule & Evidence:</div>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {c.evidence_json?.explanation || "Excess regular enrolment observed against approved capacity."}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Sanctioned Regular:</span>
                      <span className="font-bold text-slate-900">{c.evidence_json?.approved_regular_intake || 180}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Submitted Regular:</span>
                      <span className="font-bold text-red-700">{c.evidence_json?.actual_regular_enrolment || 186}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Excess Enrolment:</span>
                      <span className="font-bold text-red-700">+{c.evidence_json?.excess_count || 6}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Supernumerary:</span>
                      <span className="font-bold text-emerald-700">{c.evidence_json?.supernumerary_count || 5}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Reviewer & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Assigned Reviewer: </span>
                    <span className="font-bold text-slate-900">
                      {c.assigned_to || "Unassigned"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => {
                            setAssigningCase(c);
                            setOfficerName(c.assigned_to || "Inquiry Officer Dr. K. Singhania");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center space-x-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{c.assigned_to ? "Reassign Case" : "Assign Reviewer"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setDecidingCase(c);
                            setDecision("ISSUE_WARNING");
                            setDecisionReason(
                              `Excess 6 regular admissions approved conditionally subject to regularization under supernumerary quota and submission of institutional undertaking.`
                            );
                          }}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Record Ruling Decision</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Final Decision if Resolved */}
                {isResolved && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="font-bold text-emerald-950 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Formal AICTE Ruling: {c.decision}</span>
                    </div>
                    <p className="text-emerald-900 text-[11px] leading-relaxed">
                      {c.decision_reason}
                    </p>
                    <div className="text-[10px] text-emerald-700 pt-1 font-mono">
                      Resolved on: {new Date(c.resolved_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Assign Case Modal */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-bold text-slate-900">
                Assign Regulatory Case to Inquiry Officer
              </h3>
              <button onClick={() => setAssigningCase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Officer Name & Title
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningCase(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-sm"
                >
                  {submitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Decision Modal */}
      {decidingCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-bold text-slate-900">
                Record AICTE Regulatory Decision
              </h3>
              <button onClick={() => setDecidingCase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDecision} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Regulatory Decision
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                >
                  <option value="ISSUE_WARNING">Issue Regulatory Warning & Conditional Regularization</option>
                  <option value="APPROVE_EXEMPTION">Approve Special Regulatory Exemption</option>
                  <option value="PENALTY_IMPOSED">Impose Regulatory Penalty on Institution</option>
                  <option value="ADMISSION_INVALIDATED">Invalidate Excess Admissions</option>
                  <option value="DISMISSED">Dismiss Case (Compliant upon Verification)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Official Finding & Decision Reason
                </label>
                <textarea
                  rows={4}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecidingCase(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs shadow-sm"
                >
                  {submitting ? "Committing..." : "Commit Decision to AICTE Central Repository"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
