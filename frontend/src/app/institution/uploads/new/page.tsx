"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Info,
} from "lucide-react";

export default function NewUploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [academicYearId, setAcademicYearId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [submittingToAicte, setSubmittingToAicte] = useState(false);

  // Initialize active academic year
  React.useEffect(() => {
    // default 2026-27 cohort ID
    setAcademicYearId("curr-year");
  }, []);

  const handleUpload = async (fileToUpload?: File) => {
    const targetFile = fileToUpload || file;
    if (!targetFile) {
      alert("Please select a CSV or Excel file to upload.");
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", targetFile);
    formData.append("academic_year_id", academicYearId);
    if (user?.institution_id) {
      formData.append("institution_id", user.institution_id);
    }

    try {
      const res = await api.uploadCsv(formData);
      setResult(res);
    } catch (err: any) {
      alert(`Upload & Validation Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Quick Demo Handlers for Judges
  const loadValidSample = async () => {
    const csvContent = `apaar_id,institutional_student_id,full_name,program_code,admission_date,admission_category,is_supernumerary,supernumerary_category,dob,gender
982500010001,EIT-CSE-26-201,Priya Sengupta,CSE-BTECH,2026-08-14,REGULAR,FALSE,,2005-03-12,Female
982500010002,EIT-CSE-26-202,Amitabh Roy,CSE-BTECH,2026-08-14,REGULAR,FALSE,,2005-07-21,Male
982500010003,EIT-CSE-26-203,Debarati Das,CSE-BTECH,2026-08-15,REGULAR,FALSE,,2005-09-04,Female
982500010004,EIT-CSE-26-204,Saurav Ganguly,CSE-BTECH,2026-08-15,REGULAR,FALSE,,2005-01-18,Male
982500010005,EIT-CSE-26-205,Ananya Sen,CSE-BTECH,2026-08-16,SUPERNUMERARY,TRUE,TFW,2005-11-29,Female`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const demoFile = new File([blob], "valid_admissions_batch.csv", { type: "text/csv" });
    setFile(demoFile);
    await handleUpload(demoFile);
  };

  const loadErrorSample = async () => {
    const csvContent = `apaar_id,institutional_student_id,full_name,program_code,admission_date,admission_category,is_supernumerary,supernumerary_category,dob,gender
,EIT-CSE-26-301,Missing APAAR Candidate,CSE-BTECH,2026-08-14,REGULAR,FALSE,,2005-02-10,Male
9825123,EIT-CSE-26-302,Malformed APAAR Candidate,CSE-BTECH,2026-08-14,REGULAR,FALSE,,2005-03-15,Female
982599990001,EIT-CSE-26-303,Original Twin Identity,CSE-BTECH,2026-08-15,REGULAR,FALSE,,2005-06-20,Male
982599990001,EIT-CSE-26-304,Duplicate Twin Identity,CSE-BTECH,2026-08-15,REGULAR,FALSE,,2005-06-20,Male
982500010010,EIT-CSE-26-305,Unregistered Program Candidate,AERO-BTECH,2026-08-16,REGULAR,FALSE,,2005-08-25,Female
982500010011,EIT-CSE-26-306,Supernumerary Incomplete Candidate,CSE-BTECH,2026-08-16,SUPERNUMERARY,TRUE,,2005-12-14,Male`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const demoFile = new File([blob], "batch_with_duplicates_and_errors.csv", { type: "text/csv" });
    setFile(demoFile);
    await handleUpload(demoFile);
  };

  const submitBatchToAicte = async () => {
    if (!result?.id) return;
    setSubmittingToAicte(true);
    try {
      await api.finalizeSubmission(result.id);
      alert("Success: Batch submitted to AICTE Central Repository!");
      router.push("/institution/uploads");
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmittingToAicte(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Ingest & Validate Student Admission Data
        </h1>
        <p className="text-xs text-slate-500">
          Upload bulk student records for automated format validation, duplicate identification, and intake compliance checks.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        {/* Quick Demo Preloads */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Live Hackathon Demo Buttons: Instant test files preloaded
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={loadValidSample}
              disabled={uploading}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-md shadow-sm transition-colors"
            >
              Test Valid Batch (5 Rows)
            </button>
            <button
              type="button"
              onClick={loadErrorSample}
              disabled={uploading}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-md shadow-sm transition-colors"
            >
              Test Error & Duplicate Batch (6 Rows)
            </button>
          </div>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <label className="cursor-pointer font-bold text-xs text-blue-600 hover:underline">
              <span>Choose CSV / XLSX file</span>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports official AICTE CSV columns (APAAR ID, Student ID, Program Code, Admission Date, Category)
            </p>
          </div>
          {file && (
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-200">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{file.name}</span>
              <span className="text-slate-400 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Upload Action */}
        <div className="flex justify-end">
          <button
            onClick={() => handleUpload()}
            disabled={!file || uploading}
            className="px-6 py-2.5 bg-[#0F2042] hover:bg-blue-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{uploading ? "Running Validation Engine..." : "Validate & Stage Batch"}</span>
          </button>
        </div>
      </div>

      {/* Validation Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Rows</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">{result.total_rows}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Valid Records</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono">{result.valid_rows}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Invalid Rows</span>
              <div className="text-xl font-extrabold text-red-600 font-mono">{result.invalid_rows}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Duplicate Candidates</span>
              <div className="text-xl font-extrabold text-amber-600 font-mono">{result.duplicate_candidates}</div>
            </div>
          </div>

          {/* Validation Findings Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Row-Level Findings
                </h3>
                <p className="text-[11px] text-slate-500">
                  {result.findings?.length || 0} Rule detections generated by backend validation engine.
                </p>
              </div>

              {result.findings && result.findings.length > 0 && (
                <a
                  href={`http://localhost:8000/api/v1/submissions/${result.id}/export-errors`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-md border border-slate-300 transition-colors inline-flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Errors CSV</span>
                </a>
              )}
            </div>

            {(!result.findings || result.findings.length === 0) ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-900">
                  All Records Passed Validation!
                </p>
                <p className="text-[11px] text-slate-500">
                  No missing fields, format violations, or in-batch duplicate APAAR IDs detected.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-16">Row #</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Rule Code</th>
                      <th className="p-3">Finding & Explanation</th>
                      <th className="p-3">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {result.findings.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{f.row_number || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.severity === "CRITICAL"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : f.severity === "HIGH"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {f.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 font-semibold">
                          {f.rule_code}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{f.finding_type}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{f.message}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                            {f.resolution_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submission Confirmation Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Staged batch ready for central AICTE regulatory registry.
              </div>
              <button
                onClick={submitBatchToAicte}
                disabled={submittingToAicte}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingToAicte ? "Submitting..." : "Submit Batch to AICTE Central"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
