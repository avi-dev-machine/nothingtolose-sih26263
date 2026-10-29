"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";
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

export default function AicteAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOverviewAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          National Academic Analytics & Regulatory Intelligence
        </h1>
        <p className="text-xs text-slate-500">
          Cross-institutional enrolment distributions, program capacity utilization, and compliance trends.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading analytics charts...</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Program-wise Sanctioned Regular vs Actual Enrolment */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sanctioned Regular Capacity vs Enrolment by Program
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.intake_vs_enrolment_by_program}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="program_code" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F2042", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="approved_intake" name="Approved Regular" fill="#94A3B8" />
                    <Bar dataKey="actual_enrolment" name="Enrolled Regular" fill="#2563EB" />
                    <Bar dataKey="supernumerary" name="Supernumerary" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Discipline Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Discipline-Wise Enrolment Share
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.discipline_distribution}
                      dataKey="enrolment"
                      nameKey="discipline"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }: any) => `${name}: ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                    >
                      {data.discipline_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0F2042", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table: Capacity Utilization Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Program-Level Capacity Monitoring Summary
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Program</th>
                    <th className="p-3">Institution</th>
                    <th className="p-3">Approved Regular</th>
                    <th className="p-3">Actual Regular</th>
                    <th className="p-3">Supernumerary</th>
                    <th className="p-3">Utilization</th>
                    <th className="p-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {data.intake_vs_enrolment_by_program.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-900">{p.program_name}</td>
                      <td className="p-3 text-slate-700">{p.institution_name}</td>
                      <td className="p-3 font-mono">{p.approved_intake}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{p.actual_enrolment}</td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{p.supernumerary}</td>
                      <td className="p-3 font-mono font-bold">{p.utilization}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === "EXCEEDED"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
