"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Save, Sliders, CheckCircle2 } from "lucide-react";

export default function AicteSettingsPage() {
  const [apaarRegex, setApaarRegex] = useState("^\\d{12}$");
  const [tolerance, setTolerance] = useState("0");
  const [supernumeraryCap, setSupernumeraryCap] = useState("15");
  const [adapterMode, setAdapterMode] = useState("SIMULATED_DEMO");
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
          AICTE Central Regulatory Policies & Engine Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure national validation parameters, intake thresholds, and verification adapters.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Identifier Validation Rules
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Official APAAR Format Regular Expression
            </label>
            <p className="text-[11px] text-slate-500">
              Configurable regex pattern validated during stage A ingestion. Default is 12 numeric digits.
            </p>
            <input
              type="text"
              value={apaarRegex}
              onChange={(e) => setApaarRegex(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Intake Compliance Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Regular Intake Tolerance Threshold (%)
              </label>
              <p className="text-[11px] text-slate-500">
                AICTE APH strict ceiling: 0% tolerance triggers immediate regulatory review upon regular excess.
              </p>
              <input
                type="number"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Max Permitted Supernumerary Quota (%)
              </label>
              <p className="text-[11px] text-slate-500">
                Maximum percentage over regular intake allowed for TFW, EWS, and Sports categories.
              </p>
              <input
                type="number"
                value={supernumeraryCap}
                onChange={(e) => setSupernumeraryCap(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Settings className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              External APAAR Verification Adapter
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Identity Verification Adapter Mode
            </label>
            <p className="text-[11px] text-slate-500">
              Distinguishes between simulated prototype testing and authentic government gateway connections.
            </p>
            <select
              value={adapterMode}
              onChange={(e) => setAdapterMode(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded font-semibold text-slate-800"
            >
              <option value="SIMULATED_DEMO">SIMULATED_ADAPTER (Synthetic Demo Mode)</option>
              <option value="PENDING_EXTERNAL">PENDING_EXTERNAL_VERIFICATION (Regulatory Compliant Default)</option>
              <option value="STATUTORY_GATEWAY" disabled>OFFICIAL_GATEWAY (Requires Ministry MOUs & Statutory Token)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          {saved ? (
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Policy settings updated and active!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Settings persist across regulatory evaluations.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-[#0F2042] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
