import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APAARSetu | National Academic Identity & Student Verification Platform",
  description:
    "AICTE centralized student data management, intake compliance, and APAAR record verification portal.",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Suspense fallback={null}>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
