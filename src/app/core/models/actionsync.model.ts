export type ActionStatus =
  | 'backlog'
  | 'in-progress'
  | 'review'
  | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  department: string;
  owner: User;
  participants: User[];
  analyzed: boolean;
  actionCount: number;
  decisionCount: number;
  summary: string;
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
}

export interface Conflict {
  id: string;
  title: string;
  severity: ConflictSeverity;
  currentDecision: Decision;
  previousDecision: Decision;
  explanation: string;
  resolved: boolean;
}

export interface Activity {
  id: string;
  type: 'decision' | 'action' | 'conflict' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  user?: User;
}

export interface DashboardKpi {
  label: string;
  value: number;
  change?: number;
  description: string;
  icon: string;
  color: string;
}
2. src/app/core/services/store.service.ts
This gives you a simple application-wide state layer using Angular signals.

import { Injectable, computed, signal } from '@angular/core';
import {
  Action,
  Activity,
  Conflict,
  Decision,
  Meeting,
  User
} from '../models/actionsync.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  readonly currentUser = signal<User>({
    id: 'u1',
    name: 'Ahmed Hassan',
    email: 'ahmed@syncora.app',
    initials: 'AH',
    color: '#6366f1'
  });

  readonly users = signal<User[]>([
    {
      id: 'u1',
      name: 'Ahmed Hassan',
      email: 'ahmed@syncora.app',
      initials: 'AH',
      color: '#6366f1'
    },
    {
      id: 'u2',
      name: 'Sarah Ahmed',
      email: 'sarah@syncora.app',
      initials: 'SA',
      color: '#ec4899'
    },
    {
      id: 'u3',
      name: 'Omar Khalid',
      email: 'omar@syncora.app',
      initials: 'OK',
      color: '#14b8a6'
    },
    {
      id: 'u4',
      name: 'Lisa Martin',
      email: 'lisa@syncora.app',
      initials: 'LM',
      color: '#f59e0b'
    }
  ]);

  readonly meetings = signal<Meeting[]>([
    {
      id: 'm1',
      title: 'Weekly Engineering Sync',
      date: 'Mar 12, 2026',
      time: '10:00 AM',
      department: 'Engineering',
      owner: this.users()[0],
      participants: this.users(),
      analyzed: true,
      actionCount: 12,
      decisionCount: 4,
      summary:
        'The team agreed to migrate authentication to OAuth2 and begin implementation next sprint.'
    },
    {
      id: 'm2',
      title: 'Product Planning',
      date: 'Mar 11, 2026',
      time: '02:00 PM',
      department: 'Product',
      owner: this.users()[1],
      participants: this.users().slice(0, 3),
      analyzed: true,
      actionCount: 8,
      decisionCount: 7,
      summary:
        'Product priorities and roadmap changes were reviewed for the upcoming quarter.'
    },
    {
      id: 'm3',
      title: 'Architecture Review',
      date: 'Feb 28, 2026',
      time: '11:30 AM',
      department: 'Engineering',
      owner: this.users()[2],
      participants: this.users().slice(0, 3),
      analyzed: true,
      actionCount: 5,
      decisionCount: 3,
      summary:
        'The architecture team reviewed authentication, API boundaries and infrastructure.'
    }
  ]);

  readonly decisions = signal<Decision[]>([
    {
      id: 'd1',
      title: 'OAuth2 will be used for authentication',
      description:
        'The engineering team approved OAuth2 as the authentication mechanism.',
      date: 'Mar 12, 2026',
      meetingId: 'm1',
      meetingTitle: 'Weekly Engineering Sync',
      owner: this.users()[0],
      confidence: 96
    },
    {
      id: 'd2',
      title: 'API Keys will be used for authentication',
      description:
        'The architecture team previously approved API keys.',
      date: 'Feb 28, 2026',
      meetingId: 'm3',
      meetingTitle: 'Architecture Review',
      owner: this.users()[2],
      confidence: 91
    },
    {
      id: 'd3',
      title: 'New API gateway architecture approved',
      description:
        'The new API gateway architecture was approved for implementation.',
      date: 'Mar 11, 2026',
      meetingId: 'm2',
      meetingTitle: 'Product Planning',
      owner: this.users()[1],
      confidence: 94
    }
  ]);

  readonly actions = signal<Action[]>([
    {
      id: 'a1',
      title: 'Update API architecture',
      description:
        'Update the API architecture documentation to reflect the new authentication strategy.',
      status: 'backlog',
      priority: 'high',
      owner: this.users()[0],
      dueDate: 'Mar 20, 2026',
      meetingId: 'm1',
      meetingTitle: 'Weekly Engineering Sync',
      decisionId: 'd1'
    },
    {
      id: 'a2',
      title: 'Prepare OAuth2 implementation plan',
      description:
        'Prepare the implementation plan for migrating the authentication service to OAuth2.',
      status: 'in-progress',
      priority: 'high',
      owner: this.users()[1],
      dueDate: 'Mar 18, 2026',
      meetingId: 'm1',
      meetingTitle: 'Weekly Engineering Sync',
      decisionId: 'd1'
    },
    {
      id: 'a3',
      title: 'Review database migration',
      description:
        'Review the proposed database migration before implementation.',
      status: 'review',
      priority: 'medium',
      owner: this.users()[0],
      dueDate: 'Mar 15, 2026',
      meetingId: 'm2',
      meetingTitle: 'Product Planning'
    },
    {
      id: 'a4',
      title: 'Publish architecture documentation',
      description:
        'Publish the approved architecture documentation.',
      status: 'done',
      priority: 'low',
      owner: this.users()[2],
      dueDate: 'Mar 10, 2026',
      meetingId: 'm3',
      meetingTitle: 'Architecture Review'
    }
  ]);

  readonly conflicts = signal<Conflict[]>([
    {
      id: 'c1',
      title: 'Authentication strategy conflict',
      severity: 'critical',
      currentDecision: this.decisions()[0],
      previousDecision: this.decisions()[1],
      explanation:
        'Both decisions define the authentication mechanism for the same API platform.',
      resolved: false
    }
  ]);

  readonly activities = signal<Activity[]>([
    {
      id: 'activity1',
      type: 'decision',
      title: 'Decision updated',
      description: 'OAuth2 authentication strategy approved',
      timestamp: '2 min ago',
      user: this.users()[0]
    },
    {
      id: 'activity2',
      type: 'action',
      title: 'Action assigned',
      description: 'Prepare OAuth2 implementation plan',
      timestamp: '18 min ago',
      user: this.users()[1]
    },
    {
      id: 'activity3',
      type: 'conflict',
      title: 'Conflict detected',
      description: 'Authentication strategy differs from previous decision',
      timestamp: '1 hr ago'
    },
    {
      id: 'activity4',
      type: 'meeting',
      title: 'Meeting analyzed',
      description: 'Weekly Engineering Sync',
      timestamp: '3 hrs ago'
    }
  ]);

  readonly openActions = computed(() =>
    this.actions().filter(a => a.status !== 'done')
  );

  readonly unresolvedConflicts = computed(() =>
    this.conflicts().filter(c => !c.resolved)
  );

  updateActionStatus(id: string, status: Action['status']): void {
    this.actions.update(actions =>
      actions.map(action =>
        action.id === id
          ? { ...action, status }
          : action
      )
    );
  }

  resolveConflict(id: string): void {
    this.conflicts.update(conflicts =>
      conflicts.map(conflict =>
        conflict.id === id
          ? { ...conflict, resolved: true }
          : conflict
      )
    );
  }
}