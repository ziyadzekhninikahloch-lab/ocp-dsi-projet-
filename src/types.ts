export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  audit_score: number;
  audit_report: string; // JSON string
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: 'Developer' | 'Data Analyst' | 'Project Manager' | 'System Architect';
  workload: number;
  assignments: string; // JSON string
  avatar_url?: string;
}

export interface AuditHistory {
  score: number;
  created_at: string;
}

export interface AuditResult {
  score: number;
  technicalFeasibility: string;
  codeQuality: string;
  documentation: string;
  ocpCompliance: string;
  findings: string[];
}
