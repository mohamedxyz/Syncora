import { Injectable, computed, signal } from '@angular/core';
import {
  Action,
  Activity,
  Conflict,
  CrossMeetingTheme,
  DashboardKpi,
  Decision,
  Meeting,
  User
} from '../models/actionsync.model';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'action' | 'conflict' | 'meeting' | 'decision';
  timestamp: string;
  read: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  readonly currentUser = signal<User>({
    id: 'u1',
    name: 'Ahmed Hassan',
    email: 'ahmed@syncora.app',
    initials: 'AH',
    color: '#6366f1',
    role: 'Product Lead'
  });

  readonly users = signal<User[]>([
    {
      id: 'u1',
      name: 'Ahmed Hassan',
      email: 'ahmed@syncora.app',
      initials: 'AH',
      color: '#6366f1',
      role: 'Product Lead'
    },
    {
      id: 'u2',
      name: 'Sarah Miller',
      email: 'sarah@syncora.app',
      initials: 'SM',
      color: '#ec4899',
      role: 'Engineering Lead'
    },
    {
      id: 'u3',
      name: 'David Chen',
      email: 'david@syncora.app',
      initials: 'DC',
      color: '#14b8a6',
      role: 'Staff Security Architect'
    },
    {
      id: 'u4',
      name: 'James Wilson',
      email: 'james@syncora.app',
      initials: 'JW',
      color: '#f59e0b',
      role: 'Senior Backend Engineer'
    },
    {
      id: 'u5',
      name: 'Emily Stone',
      email: 'emily@syncora.app',
      initials: 'ES',
      color: '#8b5cf6',
      role: 'Lead Product Designer'
    },
    {
      id: 'u6',
      name: 'Michael Lee',
      email: 'michael@syncora.app',
      initials: 'ML',
      color: '#06b6d4',
      role: 'Principal Frontend Engineer'
    }
  ]);

  readonly meetings = signal<Meeting[]>([
    {
      id: 'weekly-engineering',
      title: 'Weekly Engineering Sync',
      date: 'Mar 14, 2026',
      time: '10:00 AM',
      duration: '48 min',
      department: 'Engineering',
      owner: {
        id: 'u2',
        name: 'Sarah Miller',
        email: 'sarah@syncora.app',
        initials: 'SM',
        color: '#ec4899',
        role: 'Engineering Lead'
      },
      participants: [
        { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1', role: 'Product Lead' },
        { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899', role: 'Engineering Lead' },
        { id: 'u3', name: 'David Chen', email: 'david@syncora.app', initials: 'DC', color: '#14b8a6', role: 'Staff Security Architect' },
        { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b', role: 'Senior Backend Engineer' }
      ],
      analyzed: true,
      status: 'Analyzed',
      actionCount: 12,
      decisionCount: 4,
      confidence: 94,
      purpose: 'Align on API architecture, authentication migration strategy, and Q2 staging release schedules.',
      summary: 'The engineering team aligned on the authentication architecture for the upcoming platform release. OAuth2 with short-lived access tokens was selected as the preferred approach. The team also reviewed the database migration timeline and agreed to move the staging migration forward by one week.',
      keyTopics: [
        'OAuth2 Migration & Token Expiry',
        'Database Schema Partitioning',
        'Staging Deployment Timelines',
        'Security Penetration Testing Schedule'
      ],
      insights: [
        {
          id: 'in-1',
          category: 'strategic',
          title: 'Authentication Modernization Approved',
          description: 'Migrating legacy session cookies to RFC 6749 OAuth2 standard will unblock mobile client development and multi-region sync.',
          impact: 'high',
          confidence: 96,
          timestamp: '10:14 AM',
          quote: 'Moving to OAuth2 with short-lived tokens gives us unified auth for both browser and mobile SDKs without separate session bridges.'
        },
        {
          id: 'in-2',
          category: 'risk',
          title: 'Legacy Mobile App Client Breakage Risk',
          description: 'Existing v1 mobile clients do not support PKCE flow and will require a 30-day dual-mode compatibility window.',
          impact: 'high',
          confidence: 92,
          timestamp: '10:28 AM',
          quote: 'If we cut over immediately on April 1st, 14% of mobile active users will be forcefully logged out.'
        },
        {
          id: 'in-3',
          category: 'opportunity',
          title: 'Database Partitioning Saves 35% IOPS',
          description: 'Partitioning audit logs by month before migration avoids downstream database contention during peak ingest hours.',
          impact: 'medium',
          confidence: 91,
          timestamp: '10:35 AM',
          quote: 'We benchmarked the monthly partition approach and saw a 35% drop in write latency on replica clusters.'
        },
        {
          id: 'in-4',
          category: 'customer_signal',
          title: 'Enterprise Single Sign-On Request Surge',
          description: 'Enterprise customers in financial services are actively requesting Okta and Azure AD SCIM provisioning support.',
          impact: 'medium',
          confidence: 89,
          timestamp: '10:42 AM',
          quote: 'Three tier-1 prospects made SAML/SCIM compliance a non-negotiable blocker for their pilot rollout.'
        }
      ],
      transcript: [
        {
          id: 't-1',
          speaker: { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899' },
          timestamp: '10:02 AM',
          timeSeconds: 120,
          text: 'Good morning everyone. Our primary goal today is locking down the authentication upgrade and checking the database migration plan for Q2.'
        },
        {
          id: 't-2',
          speaker: { id: 'u3', name: 'David Chen', email: 'david@syncora.app', initials: 'DC', color: '#14b8a6' },
          timestamp: '10:06 AM',
          timeSeconds: 360,
          text: 'From the security review, our existing static API keys have been a vulnerability concern during customer audits. We strongly recommend moving to OAuth2 with asymmetric JWTs and 15-minute token rotation.',
          category: 'observation'
        },
        {
          id: 't-3',
          speaker: { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b' },
          timestamp: '10:14 AM',
          timeSeconds: 840,
          text: 'Backend team is ready for that. We can deploy the token revocation service using Redis clusters. Moving to OAuth2 with short-lived tokens gives us unified auth for both browser and mobile SDKs without separate session bridges.',
          category: 'strategic',
          linkedDecisionId: 'd1'
        },
        {
          id: 't-4',
          speaker: { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1' },
          timestamp: '10:24 AM',
          timeSeconds: 1440,
          text: 'Agreed. Let us officially confirm OAuth2 with PKCE as our platform standard. Sarah, please have the plan prepared by March 18th.',
          category: 'strategic',
          linkedActionId: 'a2'
        },
        {
          id: 't-5',
          speaker: { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899' },
          timestamp: '10:28 AM',
          timeSeconds: 1680,
          text: 'Will do. Keep in mind: if we cut over immediately on April 1st, 14% of mobile active users will be forcefully logged out. We need a fallback window.',
          category: 'risk'
        },
        {
          id: 't-6',
          speaker: { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b' },
          timestamp: '10:41 AM',
          timeSeconds: 2460,
          text: 'Regarding the staging database migration: we are ahead of schedule. We can advance the staging migration to March 20th to give QA more runway.',
          category: 'opportunity',
          linkedDecisionId: 'd4'
        }
      ]
    },
    {
      id: 'product-planning',
      title: 'Product Planning — Q2',
      date: 'Mar 13, 2026',
      time: '2:00 PM',
      duration: '1h 12 min',
      department: 'Product',
      owner: {
        id: 'u1',
        name: 'Ahmed Hassan',
        email: 'ahmed@syncora.app',
        initials: 'AH',
        color: '#6366f1',
        role: 'Product Lead'
      },
      participants: [
        { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1', role: 'Product Lead' },
        { id: 'u5', name: 'Emily Stone', email: 'emily@syncora.app', initials: 'ES', color: '#8b5cf6', role: 'Lead Product Designer' },
        { id: 'u6', name: 'Michael Lee', email: 'michael@syncora.app', initials: 'ML', color: '#06b6d4', role: 'Principal Frontend Engineer' }
      ],
      analyzed: true,
      status: 'Analyzed',
      actionCount: 8,
      decisionCount: 7,
      confidence: 91,
      purpose: 'Define core intelligence capabilities, task workspace UI refresh, and customer feedback metrics for Q2.',
      summary: 'Product priorities and roadmap changes were reviewed for the upcoming quarter. The team committed to shipping the real-time conflict detection engine and overhauled action tracker by mid-April.',
      keyTopics: [
        'Real-time Conflict Detection Workflow',
        'Cross-meeting Intelligence Synthesizer',
        'Enterprise RBAC & Workspace Permissions',
        'Figma UI Component System Overhaul'
      ],
      insights: [
        {
          id: 'in-5',
          category: 'strategic',
          title: 'Shift from Manual Follow-ups to Automated Action Sync',
          description: 'Users spend 4.2 hours per week manually writing meeting minutes; automated extraction delivers 80% time saving.',
          impact: 'high',
          confidence: 95,
          timestamp: '2:15 PM'
        },
        {
          id: 'in-6',
          category: 'problem',
          title: 'Conflicting Decisions Discovered in 28% of Product Audits',
          description: 'Different teams make contradictory commitments regarding API rate limits and data retention policies.',
          impact: 'high',
          confidence: 94,
          timestamp: '2:40 PM'
        }
      ]
    },
    {
      id: 'architecture-review',
      title: 'Architecture Review',
      date: 'Mar 13, 2026',
      time: '11:30 AM',
      duration: '42 min',
      department: 'Engineering',
      owner: {
        id: 'u3',
        name: 'David Chen',
        email: 'david@syncora.app',
        initials: 'DC',
        color: '#14b8a6',
        role: 'Staff Security Architect'
      },
      participants: [
        { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899', role: 'Engineering Lead' },
        { id: 'u3', name: 'David Chen', email: 'david@syncora.app', initials: 'DC', color: '#14b8a6', role: 'Staff Security Architect' },
        { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b', role: 'Senior Backend Engineer' }
      ],
      analyzed: true,
      status: 'Analyzed',
      actionCount: 5,
      decisionCount: 3,
      confidence: 89,
      purpose: 'Review microservice boundaries, API gateway caching, and event broker clustering.',
      summary: 'The architecture team reviewed authentication, API boundaries and infrastructure scalability. Discussion surfaced legacy reliance on static API tokens that must be phased out.',
      keyTopics: [
        'API Gateway Ingress & Rate Limiting',
        'Kafka Event Streaming Topology',
        'Static API Key Phaseout'
      ],
      insights: [
        {
          id: 'in-7',
          category: 'risk',
          title: 'Deprecated API Key Longevity',
          description: 'Third-party integrations relying on long-lived keys require deprecation headers and telemetry alerting.',
          impact: 'medium',
          confidence: 90
        }
      ]
    },
    {
      id: 'design-sync',
      title: 'Design & Engineering Sync',
      date: 'Mar 12, 2026',
      time: '4:00 PM',
      duration: '36 min',
      department: 'Design',
      owner: {
        id: 'u5',
        name: 'Emily Stone',
        email: 'emily@syncora.app',
        initials: 'ES',
        color: '#8b5cf6',
        role: 'Lead Product Designer'
      },
      participants: [
        { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1', role: 'Product Lead' },
        { id: 'u5', name: 'Emily Stone', email: 'emily@syncora.app', initials: 'ES', color: '#8b5cf6', role: 'Lead Product Designer' },
        { id: 'u6', name: 'Michael Lee', email: 'michael@syncora.app', initials: 'ML', color: '#06b6d4', role: 'Principal Frontend Engineer' }
      ],
      analyzed: false,
      status: 'Processing',
      actionCount: 0,
      decisionCount: 0,
      confidence: 0,
      purpose: 'Review typography scale, high-density table views, and dark mode tokens for Syncora design system.',
      summary: 'Automated AI audio transcription is currently processing. Audio waveform ingested, extracting speaker diarization and semantic intent...',
      keyTopics: [
        'Audio Ingestion in progress',
        'NLP Diarization running'
      ],
      insights: []
    },
    {
      id: 'leadership',
      title: 'Leadership Weekly',
      date: 'Mar 11, 2026',
      time: '9:00 AM',
      duration: '55 min',
      department: 'Executive',
      owner: {
        id: 'u1',
        name: 'Ahmed Hassan',
        email: 'ahmed@syncora.app',
        initials: 'AH',
        color: '#6366f1',
        role: 'Product Lead'
      },
      participants: [
        { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1', role: 'Product Lead' },
        { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899', role: 'Engineering Lead' },
        { id: 'u6', name: 'Michael Lee', email: 'michael@syncora.app', initials: 'ML', color: '#06b6d4', role: 'Principal Frontend Engineer' }
      ],
      analyzed: true,
      status: 'Analyzed',
      actionCount: 9,
      decisionCount: 5,
      confidence: 96,
      purpose: 'Executive alignment on burn rate, enterprise pipeline conversion, and headcount allocation.',
      summary: 'Leadership confirmed headcount expansion for infrastructure engineering and approved enterprise compliance audits for SOC2 Type II.',
      keyTopics: ['SOC2 Type II Audit', 'Headcount Allocations', 'Q2 Revenue Targets'],
      insights: [
        {
          id: 'in-8',
          category: 'strategic',
          title: 'SOC2 Type II Audit Scheduled for May',
          description: 'Compliance auditor selected; engineering will freeze major architectural changes during the testing window.',
          impact: 'high',
          confidence: 98
        }
      ]
    }
  ]);

  readonly decisions = signal<Decision[]>([
    {
      id: 'd1',
      title: 'OAuth2 with PKCE standard approved for platform auth',
      description: 'The engineering team approved OAuth2 with short-lived tokens and PKCE flow for all future internal and external clients.',
      date: 'Mar 14, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      owner: { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899' },
      confidence: 96,
      status: 'confirmed',
      context: 'Replaces legacy session cookies and static authorization header keys.',
      relatedActionIds: ['a1', 'a2']
    },
    {
      id: 'd2',
      title: 'API Keys will be used for authentication',
      description: 'The architecture team previously approved static API keys as primary external client integration mechanism.',
      date: 'Feb 28, 2026',
      meetingId: 'architecture-review',
      meetingTitle: 'Architecture Review',
      owner: { id: 'u3', name: 'David Chen', email: 'david@syncora.app', initials: 'DC', color: '#14b8a6' },
      confidence: 91,
      status: 'superseded',
      context: 'Contradicts newer decision d1 (OAuth2 upgrade).',
      relatedActionIds: ['a4']
    },
    {
      id: 'd3',
      title: 'New API gateway architecture approved',
      description: 'Distributed Envoy-based API gateway approved to handle routing, rate-limiting, and analytics telemetry.',
      date: 'Mar 13, 2026',
      meetingId: 'product-planning',
      meetingTitle: 'Product Planning — Q2',
      owner: { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1' },
      confidence: 94,
      status: 'confirmed',
      context: 'Enables 99.99% SLA across multi-cloud failover regions.'
    },
    {
      id: 'd4',
      title: 'Move staging migration to March 20',
      description: 'Staging environment database migration moved forward by 7 days to maximize regression test coverage.',
      date: 'Mar 14, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      owner: { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b' },
      confidence: 95,
      status: 'confirmed',
      context: 'Unblocks frontend integration testing with mock database fixtures.'
    },
    {
      id: 'd5',
      title: 'SOC2 Type II Audit engagement partner signed',
      description: 'Signed audit engagement letter with Coalfire for May 2026 SOC2 evaluation.',
      date: 'Mar 11, 2026',
      meetingId: 'leadership',
      meetingTitle: 'Leadership Weekly',
      owner: { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1' },
      confidence: 97,
      status: 'confirmed'
    }
  ]);

  readonly actions = signal<Action[]>([
    {
      id: 'a1',
      title: 'Update API architecture documentation',
      description: 'Update the API architecture documentation to reflect the new OAuth2 authentication strategy and PKCE grant flows.',
      status: 'backlog',
      priority: 'high',
      owner: { id: 'u1', name: 'Ahmed Hassan', email: 'ahmed@syncora.app', initials: 'AH', color: '#6366f1', role: 'Product Lead' },
      dueDate: 'Mar 22, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      decisionId: 'd1',
      confidence: 95,
      createdAt: 'Mar 14, 2026'
    },
    {
      id: 'a2',
      title: 'Prepare OAuth2 implementation plan',
      description: 'Draft the technical specification for migrating user authentication service and session store to Redis JWT cache.',
      status: 'in-progress',
      priority: 'critical',
      owner: { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncora.app', initials: 'SM', color: '#ec4899', role: 'Engineering Lead' },
      dueDate: 'Mar 18, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      decisionId: 'd1',
      confidence: 98,
      createdAt: 'Mar 14, 2026'
    },
    {
      id: 'a3',
      title: 'Schedule security penetration test',
      description: 'Coordinate with third-party security team to perform pen tests on API endpoints before the staging migration.',
      status: 'backlog',
      priority: 'high',
      owner: { id: 'u3', name: 'David Chen', email: 'david@syncora.app', initials: 'DC', color: '#14b8a6', role: 'Staff Security Architect' },
      dueDate: 'Mar 19, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      confidence: 92,
      createdAt: 'Mar 14, 2026'
    },
    {
      id: 'a4',
      title: 'Publish legacy API deprecation timeline',
      description: 'Publish documentation and send email notifications to existing API consumers about the 60-day migration window.',
      status: 'review',
      priority: 'medium',
      owner: { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b', role: 'Senior Backend Engineer' },
      dueDate: 'Mar 12, 2026', // Overdue for demo richness
      meetingId: 'architecture-review',
      meetingTitle: 'Architecture Review',
      decisionId: 'd2',
      confidence: 91,
      createdAt: 'Feb 28, 2026'
    },
    {
      id: 'a5',
      title: 'Update database migration schema scripts',
      description: 'Add composite indexes and partition keys to the user audit tables for staging rollout on March 20.',
      status: 'in-progress',
      priority: 'high',
      owner: { id: 'u4', name: 'James Wilson', email: 'james@syncora.app', initials: 'JW', color: '#f59e0b', role: 'Senior Backend Engineer' },
      dueDate: 'Mar 17, 2026',
      meetingId: 'weekly-engineering',
      meetingTitle: 'Weekly Engineering Sync',
      decisionId: 'd4',
      confidence: 94,
      createdAt: 'Mar 14, 2026'
    },
    {
      id: 'a6',
      title: 'Deliver high-fidelity prototype of Conflict View',
      description: 'Design interactive prototypes showing side-by-side comparison of conflicting decisions with merge & resolve controls.',
      status: 'done',
      priority: 'medium',
      owner: { id: 'u5', name: 'Emily Stone', email: 'emily@syncora.app', initials: 'ES', color: '#8b5cf6', role: 'Lead Product Designer' },
      dueDate: 'Mar 10, 2026',
      meetingId: 'product-planning',
      meetingTitle: 'Product Planning — Q2',
      confidence: 99,
      createdAt: 'Mar 13, 2026'
    },
    {
      id: 'a7',
      title: 'Audit client-side bundle size & code splitting',
      description: 'Analyze initial bundle size and optimize dynamic import chunks to ensure sub-200ms page load across routes.',
      status: 'in-progress',
      priority: 'medium',
      owner: { id: 'u6', name: 'Michael Lee', email: 'michael@syncora.app', initials: 'ML', color: '#06b6d4', role: 'Principal Frontend Engineer' },
      dueDate: 'Mar 21, 2026',
      meetingId: 'product-planning',
      meetingTitle: 'Product Planning — Q2',
      confidence: 93,
      createdAt: 'Mar 13, 2026'
    }
  ]);

  readonly conflicts = signal<Conflict[]>([
    {
      id: 'c1',
      title: 'Authentication Strategy Incompatibility',
      severity: 'critical',
      currentDecision: this.decisions()[0],
      previousDecision: this.decisions()[1],
      explanation: 'On Mar 14, Engineering Sync approved OAuth2 with short-lived tokens (d1). However, on Feb 28 in Architecture Review, the team ratified static API Keys (d2) as permanent specification. Client integrations will break if both patterns are simultaneously active without an explicit deprecation resolution.',
      resolved: false
    },
    {
      id: 'c2',
      title: 'Database Staging Cutover Date Conflict',
      severity: 'medium',
      currentDecision: this.decisions()[3],
      previousDecision: {
        id: 'd-prev-sync',
        title: 'Staging deployment locked to March 27',
        description: 'Original deployment schedule approved during sprint planning.',
        date: 'Mar 05, 2026',
        meetingId: 'product-planning',
        meetingTitle: 'Product Planning — Q2',
        owner: this.users()[0],
        confidence: 88,
        status: 'superseded'
      },
      explanation: 'Engineering moved the staging cutover forward to March 20 (d4), but QA test plans and automated regression scripts are configured for March 27.',
      resolved: false
    }
  ]);

  readonly activities = signal<Activity[]>([
    {
      id: 'act-1',
      type: 'decision',
      title: 'Decision Confirmed',
      description: 'OAuth2 PKCE flow confirmed as platform authentication standard.',
      timestamp: '14 min ago',
      user: this.users()[1],
      link: '/meetings/weekly-engineering'
    },
    {
      id: 'act-2',
      type: 'conflict',
      title: 'Critical Conflict Detected',
      description: 'Authentication strategy conflict between Mar 14 Sync and Feb 28 Architecture Review.',
      timestamp: '32 min ago',
      link: '/conflicts'
    },
    {
      id: 'act-3',
      type: 'action',
      title: 'Task Assigned',
      description: 'Sarah Miller assigned to "Prepare OAuth2 implementation plan".',
      timestamp: '1 hour ago',
      user: this.users()[0],
      link: '/actions'
    },
    {
      id: 'act-4',
      type: 'meeting',
      title: 'Meeting Intelligence Extracted',
      description: 'Weekly Engineering Sync processed: 12 actions, 4 decisions, 4 insights generated.',
      timestamp: '2 hours ago',
      link: '/meetings/weekly-engineering'
    },
    {
      id: 'act-5',
      type: 'action',
      title: 'Task Completed',
      description: 'Emily Stone completed "Deliver high-fidelity prototype of Conflict View".',
      timestamp: '1 day ago',
      user: this.users()[4],
      link: '/actions'
    }
  ]);

  readonly themes = signal<CrossMeetingTheme[]>([
    {
      id: 'theme-1',
      topic: 'Authentication & Security Modernization',
      mentionsCount: 18,
      sentiment: 'positive',
      trend: 'increasing',
      meetingsInvolved: [
        { id: 'weekly-engineering', title: 'Weekly Engineering Sync', date: 'Mar 14, 2026' },
        { id: 'architecture-review', title: 'Architecture Review', date: 'Mar 13, 2026' },
        { id: 'leadership', title: 'Leadership Weekly', date: 'Mar 11, 2026' }
      ],
      summary: 'Strong momentum towards enterprise-grade security protocols (OAuth2, PKCE, SOC2), resolving developer frustration with legacy static tokens.'
    },
    {
      id: 'theme-2',
      topic: 'Database Performance & Scale',
      mentionsCount: 11,
      sentiment: 'neutral',
      trend: 'stable',
      meetingsInvolved: [
        { id: 'weekly-engineering', title: 'Weekly Engineering Sync', date: 'Mar 14, 2026' },
        { id: 'product-planning', title: 'Product Planning — Q2', date: 'Mar 13, 2026' }
      ],
      summary: 'Data partitioning and staging migrations are running smoothly ahead of schedule, with 35% reduction in disk IOPS observed.'
    },
    {
      id: 'theme-3',
      topic: 'Enterprise Customer Requirements',
      mentionsCount: 9,
      sentiment: 'mixed',
      trend: 'increasing',
      meetingsInvolved: [
        { id: 'product-planning', title: 'Product Planning — Q2', date: 'Mar 13, 2026' },
        { id: 'leadership', title: 'Leadership Weekly', date: 'Mar 11, 2026' }
      ],
      summary: 'Three prospective enterprise customers require SAML/SCIM and SOC2 audit completion before onboarding their corporate accounts.'
    }
  ]);

  readonly notifications = signal<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Critical Conflict Alert',
      message: 'Decision conflict detected between OAuth2 authentication and legacy API keys.',
      type: 'conflict',
      timestamp: '10 min ago',
      read: false,
      link: '/conflicts'
    },
    {
      id: 'notif-2',
      title: 'Action Overdue',
      message: 'Publish legacy API deprecation timeline was due on Mar 12, 2026.',
      type: 'action',
      timestamp: '2 hours ago',
      read: false,
      link: '/actions'
    },
    {
      id: 'notif-3',
      title: 'Meeting Processed',
      message: 'Weekly Engineering Sync analysis completed with 94% confidence.',
      type: 'meeting',
      timestamp: '3 hours ago',
      read: true,
      link: '/meetings/weekly-engineering'
    }
  ]);

  // Computed State
  readonly openActions = computed(() =>
    this.actions().filter(a => a.status !== 'done')
  );

  readonly completedActions = computed(() =>
    this.actions().filter(a => a.status === 'done')
  );

  readonly dueSoonActions = computed(() => {
    const now = new Date('2026-03-15T00:00:00'); // Baseline relative to mock data dates
    return this.actions().filter(a => {
      if (a.status === 'done') return false;
      const due = new Date(a.dueDate);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 4;
    });
  });

  readonly overdueActions = computed(() => {
    const now = new Date('2026-03-15T00:00:00');
    return this.actions().filter(a => {
      if (a.status === 'done') return false;
      const due = new Date(a.dueDate);
      return due.getTime() < now.getTime();
    });
  });

  readonly unresolvedConflicts = computed(() =>
    this.conflicts().filter(c => !c.resolved)
  );

  readonly unreadNotificationsCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  readonly dashboardKpis = computed<DashboardKpi[]>(() => {
    const totalMeetings = this.meetings().length;
    const openTasks = this.openActions().length;
    const overdueTasks = this.overdueActions().length;
    const conflicts = this.unresolvedConflicts().length;

    return [
      {
        label: 'Processed Meetings',
        value: totalMeetings,
        change: 15,
        trend: 'up',
        description: 'Meetings converted into structured intel',
        icon: '◫',
        color: '#4f46e5'
      },
      {
        label: 'Open Action Items',
        value: openTasks,
        change: -8,
        trend: 'down',
        description: `${this.dueSoonActions().length} due in the next 3 days`,
        icon: '✓',
        color: '#2563eb'
      },
      {
        label: 'Overdue Tasks',
        value: overdueTasks,
        change: 2,
        trend: 'up',
        description: 'Requires immediate team attention',
        icon: '!',
        color: '#ea580c'
      },
      {
        label: 'Unresolved Conflicts',
        value: conflicts,
        description: 'Contradicting decisions across meetings',
        icon: '⚠',
        color: '#dc2626'
      }
    ];
  });

  // Action Mutations
  updateActionStatus(id: string, status: Action['status']): void {
    this.actions.update(actions =>
      actions.map(action =>
        action.id === id ? { ...action, status } : action
      )
    );

    const target = this.actions().find(a => a.id === id);
    if (target) {
      this.addActivity({
        id: `act-${Date.now()}`,
        type: 'action',
        title: status === 'done' ? 'Action Completed' : 'Action Status Updated',
        description: `"${target.title}" marked as ${status}.`,
        timestamp: 'Just now',
        user: this.currentUser(),
        link: '/actions'
      });
    }
  }

  createAction(action: Omit<Action, 'id' | 'createdAt'>): Action {
    const newAction: Action = {
      ...action,
      id: `act-${Date.now()}`,
      createdAt: 'Just now'
    };

    this.actions.update(actions => [newAction, ...actions]);

    this.addActivity({
      id: `act-${Date.now()}`,
      type: 'action',
      title: 'Action Created',
      description: `New action item "${newAction.title}" created.`,
      timestamp: 'Just now',
      user: this.currentUser(),
      link: '/actions'
    });

    return newAction;
  }

  updateAction(updated: Action): void {
    this.actions.update(actions =>
      actions.map(a => a.id === updated.id ? updated : a)
    );
  }

  deleteAction(id: string): void {
    this.actions.update(actions => actions.filter(a => a.id !== id));
  }

  // Meeting Mutations
  createMeeting(meetingData: Partial<Meeting>): Meeting {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title || 'Untitled Meeting',
      date: meetingData.date || 'Today',
      time: meetingData.time || '12:00 PM',
      duration: meetingData.duration || '30 min',
      department: meetingData.department || 'General',
      owner: meetingData.owner || this.currentUser(),
      participants: meetingData.participants || [this.currentUser()],
      analyzed: true,
      status: 'Analyzed',
      actionCount: meetingData.actionCount || 0,
      decisionCount: meetingData.decisionCount || 0,
      confidence: meetingData.confidence || 95,
      purpose: meetingData.purpose || 'Meeting intelligence session',
      summary: meetingData.summary || 'Summary extracted successfully.',
      keyTopics: meetingData.keyTopics || ['General Alignment'],
      insights: meetingData.insights || [],
      transcript: meetingData.transcript || []
    };

    this.meetings.update(meetings => [newMeeting, ...meetings]);

    this.addActivity({
      id: `act-${Date.now()}`,
      type: 'meeting',
      title: 'Meeting Created & Analyzed',
      description: `"${newMeeting.title}" processed with ${newMeeting.confidence}% confidence.`,
      timestamp: 'Just now',
      link: `/meetings/${newMeeting.id}`
    });

    return newMeeting;
  }

  // Conflict Resolution Mutation
  resolveConflict(id: string, notes?: string): void {
    this.conflicts.update(conflicts =>
      conflicts.map(conflict =>
        conflict.id === id
          ? {
              ...conflict,
              resolved: true,
              resolutionNotes: notes || 'Resolved by alignment across leadership and engineering owners.',
              resolvedAt: 'Just now'
            }
          : conflict
      )
    );

    this.addActivity({
      id: `act-${Date.now()}`,
      type: 'conflict',
      title: 'Conflict Resolved',
      description: `Decision conflict ${id} successfully resolved and archived.`,
      timestamp: 'Just now',
      user: this.currentUser(),
      link: '/conflicts'
    });
  }

  // Notification Mutations
  dismissNotification(id: string): void {
    this.notifications.update(notifs =>
      notifs.filter(n => n.id !== id)
    );
  }

  markAllNotificationsRead(): void {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
  }

  addActivity(activity: Activity): void {
    this.activities.update(list => [activity, ...list]);
  }
}
