const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "AICTE_ADMIN" | "INSTITUTION_ADMIN" | "STUDENT" | "AUTHORIZED_VERIFIER";
  institution_id?: string | null;
  institution_name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  email: string;
  full_name: string;
  institution_id?: string | null;
  institution_name?: string | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("apaar_token") : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `Request failed with status ${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  demoLogin: (role: string, email?: string, institution_id?: string) =>
    apiRequest<AuthResponse>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role, email, institution_id }),
    }),
  getMe: () => apiRequest<UserProfile>("/auth/me"),

  // Institutions
  getInstitutions: (state?: string, status?: string) => {
    const params = new URLSearchParams();
    if (state) params.append("state", state);
    if (status) params.append("approval_status", status);
    return apiRequest<any[]>(`/institutions?${params.toString()}`);
  },
  getInstitution: (id: string) => apiRequest<any>(`/institutions/${id}`),

  // Programs & Intakes
  getPrograms: (institution_id?: string) => {
    const params = new URLSearchParams();
    if (institution_id) params.append("institution_id", institution_id);
    return apiRequest<any[]>(`/programs?${params.toString()}`);
  },
  getIntakes: (institution_id?: string, academic_year_id?: string) => {
    const params = new URLSearchParams();
    if (institution_id) params.append("institution_id", institution_id);
    if (academic_year_id) params.append("academic_year_id", academic_year_id);
    return apiRequest<any[]>(`/programs/intakes?${params.toString()}`);
  },

  // Students
  getStudents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, String(v));
      }
    });
    return apiRequest<{ total: number; skip: number; limit: number; items: any[] }>(
      `/students?${query.toString()}`
    );
  },
  getStudent: (id: string) => apiRequest<any>(`/students/${id}`),
  updateStudent: (id: string, data: any) =>
    apiRequest<any>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Submissions
  getSubmissions: (institution_id?: string) => {
    const params = new URLSearchParams();
    if (institution_id) params.append("institution_id", institution_id);
    return apiRequest<any[]>(`/submissions?${params.toString()}`);
  },
  getSubmission: (id: string) => apiRequest<any>(`/submissions/${id}`),
  uploadCsv: (formData: FormData) =>
    apiRequest<any>("/submissions/upload-csv", {
      method: "POST",
      body: formData,
    }),
  finalizeSubmission: (id: string) =>
    apiRequest<any>(`/submissions/${id}/submit`, {
      method: "POST",
    }),

  // Compliance
  getComplianceSummary: (institution_id?: string) => {
    const params = new URLSearchParams();
    if (institution_id) params.append("institution_id", institution_id);
    return apiRequest<any>(`/compliance/summary?${params.toString()}`);
  },
  getComplianceCases: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, String(v));
      }
    });
    return apiRequest<any[]>(`/compliance/cases?${query.toString()}`);
  },
  getComplianceCase: (id: string) => apiRequest<any>(`/compliance/cases/${id}`),
  assignComplianceCase: (id: string, assigned_to: string) =>
    apiRequest<any>(`/compliance/cases/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ assigned_to }),
    }),
  recordComplianceDecision: (id: string, decision: string, decision_reason: string) =>
    apiRequest<any>(`/compliance/cases/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision, decision_reason }),
    }),

  // Verification
  verifyRecord: (reference: string) =>
    apiRequest<any>(`/verification/records/${reference}`),
  testTamper: (reference: string) =>
    apiRequest<any>(`/verification/tamper-test/${reference}`, {
      method: "POST",
    }),

  // Analytics
  getOverviewAnalytics: () => apiRequest<any>("/analytics/overview"),

  // Audit
  getAuditEvents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, String(v));
      }
    });
    return apiRequest<any[]>(`/audit-events?${query.toString()}`);
  },
};
