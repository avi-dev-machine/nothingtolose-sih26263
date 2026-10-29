"use client";

import React, { useState } from "react";
import { Settings, Key, Building2, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InstitutionSettingsPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("eit_live_sec_9f823a7b61d4920c8172");
  const [webhookUrl, setWebhookUrl] = useState("https://erp.eit.edu.in/api/v1/aicte-sync");
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
          Institution API Credentials & ERP Sync Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure institutional integration keys for direct SIS / ERP real-time admission synchronization.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Institution Identity Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block text-[11px]">Institution Name</span>
              <span className="font-bold text-slate-900 text-sm">
                {user?.institution_name || "Eastern Institute of Technology"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">AICTE Permanent Code</span>
              <span className="font-mono font-bold text-slate-900 text-sm">EIT-2026-WB</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Key className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Institutional API Credentials
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Production REST API Key</label>
            <input
              type="text"
              value={apiKey}
              readOnly
              className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs bg-slate-50 text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">ERP Ingestion Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          {saved ? (
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings and webhook configuration updated!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Credentials securely managed.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2 bg-[#0F2042] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
