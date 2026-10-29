"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/verify/");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar if authenticated and not on a purely public standalone route */}
        {user && !isPublicPage && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
