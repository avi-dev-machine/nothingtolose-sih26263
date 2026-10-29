"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Building2,
  Users,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0F2042", "#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function AicteDashboardPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOverviewAnalytics()
      .then((data) => setOverview(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold mb-1">
            <span>AICTE Regulatory Intelligence Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            National Student Verification & Compliance Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time regulatory oversight across AICTE-approved institutions for Academic Year 2026–27.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/aicte/compliance"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Open Compliance Queue</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-slate-500">
          Aggregating national compliance metrics from live repository...
        </div>
      ) : overview ? (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Approved Institutions
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {overview.total_institutions}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                100% active coverage
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Admitted Records
              </span>
              <div className="text-2xl font-extrabold text-blue-700 font-mono">
                {overview.total_records}
              </div>
              <span className="text-[10px] text-blue-700 font-semibold block">
                {overview.verified_records} Verified / Format Validated
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Open Compliance Cases
              </span>
              <div className="text-2xl font-extrabold text-red-600 font-mono">
                {overview.open_compliance_cases}
              </div>
              <span className="text-[10px] text-red-600 font-semibold block">
                {overview.programs_exceeding_intake} Programs Exceeding Intake
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Avg Intake Utilization
              </span>
              <div className="text-2xl font-extrabold text-amber-600 font-mono">
                {overview.avg_intake_utilization}%
              </div>
              <span className="text-[10px] text-slate-500 block">Across national programs</span>
            </div>
          </div>

          {/* High Priority Regulatory Alert Box */}
          {overview.recent_anomalies && overview.recent_anomalies.length > 0 && (
            <div className="bg-red-50/80 border border-red-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-bold text-red-950">
                    High Priority Investigation Cases Requiring Action
                  </h3>
                </div>
                <Link
                  href="/aicte/compliance"
                  className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center space-x-1"
                >
                  <span>View All Cases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overview.recent_anomalies.map((an: any) => (
                  <div
                    key={an.id}
                    className="bg-white p-3.5 rounded-lg border border-red-200 shadow-sm text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{an.institution_name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        {an.case_type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{an.evidence?.explanation}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Program: {an.program_name}</span>
                      <span className="font-mono font-bold text-red-700">
                        Excess: +{an.evidence?.excess_count || 6}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Sanctioned Regular Intake vs Actual Enrolment */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Intake Compliance: Approved vs Actual Regular Enrolment
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Spotlight: Eastern Institute B.Tech CSE (180 approved vs 186 regular enrolled)
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.intake_vs_enrolment_by_program}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="program_code" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F2042",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="approved_intake" name="Approved Regular" fill="#94A3B8" />
                    <Bar dataKey="actual_enrolment" name="Enrolled Regular" fill="#2563EB" />
                    <Bar dataKey="supernumerary" name="Supernumerary Seats" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: State Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Geographic Distribution Across States
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Institution coverage and student enrolment breakdown
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.state_distribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="state" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F2042",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="enrolment_count" name="Enrolment Count" fill="#0F2042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
