"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, ShieldCheck, QrCode, ExternalLink, Award } from "lucide-react";

export default function StudentRecordSinglePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getStudent(id)
      .then((data) => setStudent(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Credentials</span>
      </button>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border text-center text-xs text-slate-500">
          Loading verifiable credential...
        </div>
      ) : student ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">{student.full_name}</h1>
                <p className="text-xs text-slate-500">
                  Credential Reference: <span className="font-mono font-bold text-blue-700">{student.credential_reference}</span>
                </p>
              </div>
            </div>
            {student.credential_reference && (
              <Link
                href={`/verify/${student.credential_reference}`}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center space-x-1"
              >
                <span>Verify Publicly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Academic Institution</span>
              <span className="font-bold text-slate-900">{student.institution_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Program</span>
              <span className="font-bold text-slate-900">{student.program_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Admission Date</span>
              <span className="font-semibold text-slate-900">{student.admission_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Verification Status</span>
              <span className="font-bold text-emerald-700">{student.external_verification_status}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
