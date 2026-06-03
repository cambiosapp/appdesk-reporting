// AppDesk - Tipos globales

export type ReportType = 'bug' | 'task' | 'feature';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
export type UserRole = 'admin' | 'reporter';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  priority: ReportPriority;
  status: ReportStatus;
  description: string;
  module_id: string | null;
  reporter_id: string;
  jira_ticket_id: string | null;
  jira_ticket_key: string | null;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  // Joined fields
  module?: Module;
  reporter?: Profile;
}

export interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: { name: string };
    priority?: { name: string };
    issuetype?: { name: string };
    created: string;
    updated: string;
  };
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  bug: 'Error',
  task: 'Tarea',
  feature: 'Mejora',
};

export const REPORT_TYPE_ICONS: Record<ReportType, string> = {
  bug: '🐛',
  task: '📋',
  feature: '✨',
};

export const PRIORITY_LABELS: Record<ReportPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Abierto',
  in_progress: 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  reopened: 'Reabierto',
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  reopened: 'bg-purple-100 text-purple-800',
};

export const PRIORITY_COLORS: Record<ReportPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const JIRA_TYPE_MAP: Record<ReportType, string> = {
  bug: 'Bug',
  task: 'Task',
  feature: 'Story',
};

export const JIRA_STATUS_MAP: Record<string, ReportStatus> = {
  'Open': 'open',
  'In Progress': 'in_progress',
  'Resolved': 'resolved',
  'Closed': 'closed',
  'Reopened': 'reopened',
  'Done': 'closed',
  'To Do': 'open',
  'In Review': 'in_progress',
};
