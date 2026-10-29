"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Building2,
  Users,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Layers,
} from "lucide-react";

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [complianceCases, setComplianceCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [intakeRes, subRes, compRes] = await Promise.all([
          api.getIntakes(),
          api.getSubmissions(),
          api.getComplianceCases(),
        ]);
        setIntakes(intakeRes);
        setSubmissions(subRes);
        setComplianceCases(compRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRegular = intakes.reduce((sum, item) => sum + (item.actual_regular_enrolment || 0), 0);
  const totalApproved = intakes.reduce((sum, item) => sum + (item.approved_regular_intake || 0), 0);
  const totalSuper = intakes.reduce((sum, item) => sum + (item.actual_supernumerary_enrolment || 0), 0);
  const exceededPrograms = intakes.filter((item) => item.excess > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Institution Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {user?.institution_name || "Eastern Institute of Technology"}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                AICTE APPROVED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: <span className="font-mono font-bold text-slate-700">EIT-2026-WB</span> • State: West Bengal • Region: Eastern
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/institution/uploads/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Student CSV</span>
          </Link>
        </div>
      </div>

      {/* Featured Intake Compliance Warning Banner (SIH Key Demo Scenario) */}
      {exceededPrograms.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-amber-950 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight">
                  Intake Regulatory Notice: Sanctioned Regular Capacity Exceeded
                </h3>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Regulatory Case Active
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                The AICTE Compliance Engine has flagged{" "}
                <span className="font-bold underline">B.Tech Computer Science and Engineering</span>.
                Approved Regular Intake is <span className="font-bold">180</span>, but total enrolled regular admissions count is{" "}
                <span className="font-bold text-red-700">186</span> (Excess: <span className="font-bold text-red-700">+6</span>, 103.33% utilization).
                Supernumerary admissions (5 seats) have been correctly accounted for separately.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <Link
                  href="/institution/compliance"
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center space-x-1"
                >
                  <span>Review Regulatory Compliance Notice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span>•</span>
                <Link
                  href="/institution/students"
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline"
                >
                  Inspect Enrolled Student Roster
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Sanctioned Intake
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{totalApproved}</div>
          <span className="text-[11px] text-slate-500 block">Across 4 approved programs</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Regular Enrolment Count
          </span>
          <div className="text-2xl font-extrabold text-blue-700">{totalRegular}</div>
          <span className="text-[11px] text-slate-500 block">Sanctioned regular quota</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Supernumerary Admissions
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">{totalSuper}</div>
          <span className="text-[11px] text-emerald-700 block">TFW & EWS verified separate</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Regulatory Compliance Cases
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            {complianceCases.filter((c) => c.status !== "RESOLVED").length}
          </div>
          <span className="text-[11px] text-amber-600 block">Requires formal review</span>
        </div>
      </div>

      {/* Program-wise Intake Utilization Meters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Program-Wise Capacity Utilization (Academic Year 2026–27)
            </h3>
          </div>
          <Link
            href="/institution/programs"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View All Programs
          </Link>
        </div>

        <div className="p-5 space-y-5">
          {intakes.map((prog) => {
            const isExceeded = prog.excess > 0;
            return (
              <div key={prog.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{prog.program_name}</span>
                    <span className="text-slate-500 font-mono ml-2">({prog.program_code})</span>
                  </div>
                  <div className="space-x-3">
                    <span className="text-slate-600">
                      Approved: <span className="font-bold">{prog.approved_regular_intake}</span>
                    </span>
                    <span className="text-slate-600">
                      Regular:{" "}
                      <span className={`font-bold ${isExceeded ? "text-red-600" : "text-slate-900"}`}>
                        {prog.actual_regular_enrolment}
                      </span>
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      Supernumerary: {prog.actual_supernumerary_enrolment}
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isExceeded
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {prog.utilization_percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isExceeded
                        ? "bg-red-600"
                        : prog.utilization_percentage >= 90
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(100, prog.utilization_percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Batch Submissions
            </h3>
          </div>
          <Link
            href="/institution/uploads"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View History
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">File Name</th>
                <th className="p-3">Academic Year</th>
                <th className="p-3">Total Rows</th>
                <th className="p-3">Valid Rows</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold text-slate-900">{sub.file_name}</td>
                  <td className="p-3 font-mono text-[11px]">{sub.academic_year_label}</td>
                  <td className="p-3 font-mono">{sub.total_rows}</td>
                  <td className="p-3 font-mono text-emerald-700 font-semibold">{sub.valid_rows}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {new Date(sub.created_at).toLocaleDateString()}
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
