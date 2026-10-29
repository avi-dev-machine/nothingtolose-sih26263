"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Calendar,
  QrCode,
  Lock,
  ExternalLink,
  Award,
  CheckCircle2,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student's record using student API
    api.getStudents({ limit: 1 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setStudent(res.items[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Identity & APAAR Card
          </h1>
          <p className="text-xs text-slate-500">
            National Academic Identity linked to verified AICTE enrolment records.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active Enrolment</span>
        </span>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
          Loading student academic credentials...
        </div>
      ) : student ? (
        <div className="space-y-6">
          {/* APAAR Digital Identity Card */}
          <div className="bg-gradient-to-br from-[#0F2042] via-slate-900 to-[#19356A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-2xl shadow-inner">
                  अ
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Government of India • AICTE
                  </div>
                  <div className="text-lg font-extrabold tracking-tight">
                    APAAR Digital Academic Identity Card
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-600 text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Academic Year</div>
                <div className="text-xs font-bold font-mono text-amber-300">
                  {student.academic_year_label}
                </div>
              </div>
            </div>

            {/* Student Identity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Student Full Legal Name
                  </span>
                  <div className="text-xl font-bold text-white mt-0.5">{student.full_name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Protected APAAR ID
                    </span>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                      {student.masked_apaar_id}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Roll / Student ID
                    </span>
                    <div className="text-sm font-mono font-semibold text-white mt-0.5">
                      {student.institutional_student_id}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Enrolled Institution
                    </span>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {student.institution_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Program & Discipline
                    </span>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {student.program_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR and Verification Badge */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 text-center space-y-3">
                {student.credential_reference ? (
                  <img
                    src={`http://localhost:8000/api/v1/verification/qr/${student.credential_reference}`}
                    alt="QR Verification"
                    className="w-24 h-24 rounded border border-slate-600 bg-white p-1"
                  />
                ) : (
                  <div className="w-24 h-24 rounded bg-slate-700 flex items-center justify-center text-slate-400">
                    <QrCode className="w-8 h-8" />
                  </div>
                )}
                <div className="text-[11px] space-y-1">
                  <div className="font-mono text-amber-300 font-bold text-xs">
                    {student.credential_reference || "VERIFICATION PENDING"}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Scan to verify credential proof
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Verifier Access Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Data Minimization & Privacy Protection Policy
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with national academic data privacy standards, your full APAAR ID is protected
              with keyed cryptographic hashes. External verifiers (e.g. employers, universities) only receive
              minimum permitted academic claims upon scanning your verification reference without accessing
              raw identifiers.
            </p>
            {student.credential_reference && (
              <div className="pt-2">
                <Link
                  href={`/verify/${student.credential_reference}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  <span>Open Public Verification Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
          No student record found.
        </div>
      )}
    </div>
  );
}
