"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";

export default function StudentPrivacyPage() {
  const [allowPublicVerification, setAllowPublicVerification] = useState(true);
  const [requireConsentForEmployers, setRequireConsentForEmployers] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Student Academic Privacy & Consent Preferences
        </h1>
        <p className="text-xs text-slate-500">
          Control how your academic identity is disclosed to external verification bodies and employers.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Minimum Disclosure Principle
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublicVerification}
                onChange={(e) => setAllowPublicVerification(e.target.checked)}
                className="mt-1"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Allow Token-Based Public Academic Verification
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Permits authorized verifiers who possess your QR code or Reference Token to verify your degree claims without accessing your raw APAAR identifier.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={requireConsentForEmployers}
                onChange={(e) => setRequireConsentForEmployers(e.target.checked)}
                className="mt-1"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Require Step-Up Push Notification Consent for Background Verifiers
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Requires explicit digital approval before third-party corporate verifiers can view enrolment dates.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          {saved ? (
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Consent preferences updated and synchronized with central registry!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Governed by AICTE academic data protection policies.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-[#0F2042] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
