export type ActionStatus =
  | 'backlog'
  | 'in-progress'
  | 'review'
  | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export type InsightCategory =
  | 'observation'
  | 'risk'
  | 'opportunity'
  | 'customer_signal'
  | 'strategic'
  | 'problem';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role?: string;
  avatarUrl?: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: User;
  timestamp: string;
  timeSeconds: number;
  text: string;
  category?: InsightCategory;
  linkedDecisionId?: string;
  linkedActionId?: string;
}

export interface MeetingInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp?: string;
  quote?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  department: string;
  owner: User;
  participants: User[];
  analyzed: boolean;
  status: 'Analyzed' | 'Processing' | 'Pending';
  actionCount: number;
  decisionCount: number;
  confidence: number;
  summary: string;
  purpose?: string;
  keyTopics: string[];
  insights: MeetingInsight[];
  transcript?: TranscriptEntry[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  priority: Priority;
  owner: User;
  dueDate: string;
  meetingId: string;
  meetingTitle: string;
  decisionId?: string;
  confidence?: number;
  createdAt?: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  date: string;
  meetingId: string;
  meetingTitle: string;
  owner: User;
  confidence: number;
  status: 'confirmed' | 'under-review' | 'superseded';
  context?: string;
  relatedActionIds?: string[];
}

export interface Conflict {
  id: string;
  title: string;
  severity: ConflictSeverity;
  currentDecision: Decision;
  previousDecision: Decision;
  explanation: string;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface Activity {
  id: string;
  type: 'decision' | 'action' | 'conflict' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  user?: User;
  link?: string;
}

export interface DashboardKpi {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  description: string;
  icon: string;
  color: string;
}

export interface CrossMeetingTheme {
  id: string;
  topic: string;
  mentionsCount: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  trend: 'increasing' | 'stable' | 'decreasing';
  meetingsInvolved: { id: string; title: string; date: string }[];
  summary: string;
}