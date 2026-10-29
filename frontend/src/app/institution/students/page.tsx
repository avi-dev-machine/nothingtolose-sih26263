"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  Edit3,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  History,
} from "lucide-react";

export default function InstitutionStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");

  // Correction Modal state
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search,
        program_id: programFilter,
        limit: 50,
      });
      setStudents(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, programFilter]);

  const openEditModal = (st: any) => {
    setEditingStudent(st);
    setFormData({
      full_name: st.full_name,
      institutional_student_id: st.institutional_student_id,
      admission_category: st.admission_category,
      is_supernumerary: st.is_supernumerary,
      supernumerary_category: st.supernumerary_category || "",
      enrolment_status: st.enrolment_status,
    });
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaving(true);
    try {
      await api.updateStudent(editingStudent.id, formData);
      alert("Success: Record corrected, version incremented, and compliance re-evaluated!");
      setEditingStudent(null);
      loadStudents();
    } catch (err: any) {
      alert(`Correction error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Student Admission Roster
          </h1>
          <p className="text-xs text-slate-500">
            Admitted students linked to national academic identifiers and approved program quotas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="http://localhost:8000/api/v1/students/export/csv"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </a>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or APAAR ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Academic Programs</option>
            <option value="CSE-BTECH">B.Tech Computer Science (186 Regular)</option>
            <option value="ECE-BTECH">B.Tech Electronics</option>
            <option value="MECH-BTECH">B.Tech Mechanical</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Enrolled Student Records ({total} Total)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Protected APAAR View (Masked)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading student records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Roll ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Protected APAAR ID</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Quota</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {st.institutional_student_id}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{st.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Ref: {st.credential_reference || "Pending"}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-amber-700 font-semibold text-[11px]">
                      {st.masked_apaar_id}
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800">{st.program_code}</span>
                      <span className="text-slate-500 block text-[11px] truncate max-w-[150px]">
                        {st.program_name}
                      </span>
                    </td>
                    <td className="p-3">
                      {st.is_supernumerary ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Supernumerary ({st.supernumerary_category})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Regular Intake
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {st.record_status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(st)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Correct</span>
                      </button>
                      {st.credential_reference && (
                        <a
                          href={`/verify/${st.credential_reference}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 inline-flex items-center"
                          title="Verify Credential"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Record Correction Modal (Audit Workflow) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  Admission Record Correction Workflow
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="p-5 space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-blue-900 text-[11px] leading-relaxed">
                <span className="font-bold">Auditable Action: </span>
                Modifications will increment the record version, log an immutable audit event with your identity, and re-evaluate regular program intake compliance.
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Student Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Institutional Student Roll ID
                </label>
                <input
                  type="text"
                  value={formData.institutional_student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, institutional_student_id: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                    Admission Category
                  </label>
                  <select
                    value={formData.admission_category}
                    onChange={(e) =>
                      setFormData({ ...formData, admission_category: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="REGULAR">Regular Merit</option>
                    <option value="MANAGEMENT">Management Quota</option>
                    <option value="SUPERNUMERARY">Supernumerary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                    Supernumerary Quota?
                  </label>
                  <select
                    value={formData.is_supernumerary ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_supernumerary: e.target.value === "yes",
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="no">No (Counts in Regular Intake)</option>
                    <option value="yes">Yes (Excluded from Regular Intake)</option>
                  </select>
                </div>
              </div>

              {formData.is_supernumerary && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                    Supernumerary Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., TFW, EWS, J&K_MIGRANT, SPORTS"
                    value={formData.supernumerary_category}
                    onChange={(e) =>
                      setFormData({ ...formData, supernumerary_category: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              )}

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-sm"
                >
                  {saving ? "Saving..." : "Commit Audited Correction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
