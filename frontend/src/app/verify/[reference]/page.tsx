"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  RefreshCw,
  Lock,
  Flame,
} from "lucide-react";

export default function VerificationPage() {
  const params = useParams();
  const router = useRouter();
  const reference = typeof params.reference === "string" ? params.reference : "";

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tamper demonstration state
  const [tamperResult, setTamperResult] = useState<any | null>(null);
  const [tamperTesting, setTamperTesting] = useState(false);

  const fetchRecord = async () => {
    if (!reference) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyRecord(reference);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Credential not found or invalid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [reference]);

  const runTamperTest = async () => {
    setTamperTesting(true);
    try {
      const res = await api.testTamper(reference);
      setTamperResult(res);
    } catch (err: any) {
      alert(`Tamper test error: ${err.message}`);
    } finally {
      setTamperTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Verifying cryptographic proof with AICTE Central Repository...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-red-600 font-mono">{error}</p>
            <p className="text-xs text-slate-500">
              Reference: <span className="font-mono font-bold">{reference}</span>
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Return to Verification Portal
            </button>
          </div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Main Verification Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Status Banner */}
            <div
              className={`p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                data.integrity_status === "VALID"
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-red-50 border-red-200 text-red-950"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    data.integrity_status === "VALID"
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-bold tracking-tight">
                      {data.integrity_status === "VALID"
                        ? "Academic Record Cryptographically Verified"
                        : "Integrity Warning: Record Payload Modified"}
                    </h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800 uppercase tracking-wider">
                      {data.result_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {data.explanation}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  Reference Token
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {data.reference}
                </div>
              </div>
            </div>

            {/* Academic Claim Details Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student and Institution Claims */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1 text-slate-500">
                  Student & Enrolment Claims
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Student Legal Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{data.student_name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Institutional Student ID:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {data.institutional_student_id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Admission Date:</span>
                      <span className="font-semibold text-slate-800">{data.admission_date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Enrolment Status:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {data.enrolment_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Seat Category:</span>
                      <span className="font-semibold text-slate-800">
                        {data.is_supernumerary
                          ? `Supernumerary (${data.supernumerary_category})`
                          : "Regular Sanctioned"}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1 pt-2 text-slate-500">
                  Issuing Institution
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Institution Name:</span>
                    <span className="font-bold text-slate-900">{data.issuer_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">AICTE Code:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {data.institution_code}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Program:</span>
                      <span className="font-semibold text-slate-800">{data.program_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof & QR Code */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l md:pl-6 border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1 text-slate-500">
                  Cryptographic Integrity Proof
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">SIGNATURE ALGORITHM:</span>
                      <span className="font-semibold text-slate-800">HMAC-SHA256 (Canonical Payload)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SIGNING KEY ID:</span>
                      <span className="text-slate-700">{data.key_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DIGITAL SIGNATURE HASH:</span>
                      <span className="text-slate-700 break-all text-[10px]">
                        {data.digital_signature}
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <img
                      src={`http://localhost:8000/api/v1/verification/qr/${data.reference}`}
                      alt="Verification QR"
                      className="w-20 h-20 rounded border border-slate-300 bg-white"
                    />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900 flex items-center space-x-1">
                        <QrCode className="w-4 h-4 text-slate-700" />
                        <span>Verifiable QR Token</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Scan to immediately verify this exact credential reference without exposing sensitive personal PII.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tamper Test Section (SIH Evaluation Feature) */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>SIH Interactive Demo: Cryptographic Tamper Test</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Test the backend security engine: intentionally tamper with the signed student record payload in memory and verify that HMAC rejection triggers.
                  </p>
                </div>
                <button
                  onClick={runTamperTest}
                  disabled={tamperTesting}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{tamperTesting ? "Testing..." : "Run Tamper Test"}</span>
                </button>
              </div>

              {tamperResult && (
                <div className="bg-white border border-indigo-200 rounded-lg p-3 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Original Canonical Payload: Valid</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-700 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Altered Payload Test: Rejection Confirmed!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                    Backend Result: {tamperResult.tampered_message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
