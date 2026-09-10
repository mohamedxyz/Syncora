import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { ConfidencePipe } from '../../shared/pipes/confidence.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ConfidencePipe],
  template: `
    <div class="dashboard-page">

      <!-- HERO BANNER -->
      <section class="dashboard-hero">
        <div class="hero-left">
          <div class="eyebrow">INTELLIGENCE OVERVIEW</div>
          <h1>Welcome back, {{ store.currentUser().name.split(' ')[0] }}</h1>
          <p>
            Here is what requires your attention across recent meetings, emerging conflicts, and team commitments.
          </p>
        </div>

        <div class="hero-actions">
          <a routerLink="/meetings" class="secondary-btn">
            Browse Meetings
          </a>
          <a routerLink="/actions" class="primary-btn">
            + Manage Actions
          </a>
        </div>
      </section>

      <!-- KPI METRIC CARDS -->
      <section class="kpi-grid">
        @for (kpi of store.dashboardKpis(); track kpi.label) {
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">{{ kpi.label }}</span>
              <div class="kpi-icon" [style.color]="kpi.color" [style.background]="kpi.color + '18'">
                {{ kpi.icon }}
              </div>
            </div>

            <div class="kpi-body">
              <strong class="kpi-value">{{ kpi.value }}</strong>
              @if (kpi.change !== undefined) {
                <span class="kpi-trend" [class.positive]="kpi.trend === 'up' && kpi.change > 0" [class.warning]="kpi.trend === 'up' && kpi.label.includes('Overdue')">
                  {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}% vs last week
                </span>
              }
            </div>

            <span class="kpi-desc">{{ kpi.description }}</span>
          </div>
        }
      </section>

      <!-- ATTENTION ALERT BANNER (If Conflicts or Overdue Tasks exist) -->
      @if (store.unresolvedConflicts().length > 0 || store.overdueActions().length > 0) {
        <section class="attention-banner">
          <div class="attention-icon">⚠</div>
          <div class="attention-text">
            <strong>Attention Required</strong>
            <span>
              You have {{ store.unresolvedConflicts().length }} unresolved decision conflict(s)
              and {{ store.overdueActions().length }} overdue action item(s) across recent meeting intelligence cycles.
            </span>
          </div>
          <div class="attention-actions">
            @if (store.unresolvedConflicts().length > 0) {
              <a routerLink="/conflicts" class="alert-link-conflict">Resolve Conflicts →</a>
            }
            @if (store.overdueActions().length > 0) {
              <a routerLink="/actions" class="alert-link-action">View Overdue Tasks →</a>
            }
          </div>
        </section>
      }

      <!-- MAIN DASHBOARD CONTENT GRID -->
      <div class="dashboard-grid">

        <!-- LEFT COLUMN: RECENT MEETINGS & STRATEGIC INSIGHTS -->
        <div class="grid-col main-col">

          <!-- RECENT MEETINGS SECTION -->
          <section class="dash-card">
            <div class="card-title-row">
              <div>
                <h2>Recent Meetings</h2>
                <p>Latest converted meetings and extraction statuses</p>
              </div>
              <a routerLink="/meetings" class="card-action-link">View all ({{ store.meetings().length }}) →</a>
            </div>

            <div class="meeting-items">
              @for (meeting of recentMeetings(); track meeting.id) {
                <a [routerLink]="['/meetings', meeting.id]" class="meeting-row">
                  <div class="meeting-lead">
                    <div class="m-icon">◫</div>
                    <div>
                      <h3>{{ meeting.title }}</h3>
                      <div class="m-meta">
                        <span>{{ meeting.date }}</span>
                        <span>·</span>
                        <span>{{ meeting.duration }}</span>
                        <span>·</span>
                        <span class="m-dept">{{ meeting.department }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="meeting-trailing">
                    <div class="pill-stat">
                      <strong>{{ meeting.actionCount }}</strong>
                      <span>actions</span>
                    </div>
                    <div class="pill-stat">
                      <strong>{{ meeting.decisionCount }}</strong>
                      <span>decisions</span>
                    </div>
                    <span class="badge" [class.badge-success]="meeting.status === 'Analyzed'" [class.badge-warning]="meeting.status === 'Processing'">
                      {{ meeting.status }}
                    </span>
                    <span class="row-arrow">→</span>
                  </div>
                </a>
              }
            </div>
          </section>

          <!-- CROSS-MEETING INTELLIGENCE & RECURRING THEMES -->
          <section class="dash-card">
            <div class="card-title-row">
              <div>
                <h2>Cross-Meeting Intelligence</h2>
                <p>Synthesized patterns, recurring themes, and strategic signals</p>
              </div>
              <span class="badge badge-primary">3 Active Themes</span>
            </div>

            <div class="theme-cards">
              @for (theme of store.themes(); track theme.id) {
                <div class="theme-card">
                  <div class="theme-head">
                    <h4>{{ theme.topic }}</h4>
                    <span class="theme-mentions">{{ theme.mentionsCount }} meeting mentions</span>
                  </div>

                  <p class="theme-summary">{{ theme.summary }}</p>

                  <div class="theme-foot">
                    <span class="theme-involved-label">Sources:</span>
                    <div class="theme-sources">
                      @for (src of theme.meetingsInvolved; track src.id) {
                        <a [routerLink]="['/meetings', src.id]" class="source-tag">
                          {{ src.title }}
                        </a>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

        </div>

        <!-- RIGHT COLUMN: OPEN COMMITMENTS, DECISIONS, QUICK ACTIVITIES -->
        <div class="grid-col side-col">

          <!-- OPEN ACTION ITEMS -->
          <section class="dash-card">
            <div class="card-title-row">
              <div>
                <h2>Commitments & Tasks</h2>
                <p>{{ store.openActions().length }} open action items</p>
              </div>
              <a routerLink="/actions" class="card-action-link">Open workspace →</a>
            </div>

            <div class="task-list">
              @for (task of priorityTasks(); track task.id) {
                <div class="task-item">
                  <div class="task-check" [class.checked]="task.status === 'done'" (click)="toggleTask(task.id, task.status)">
                    @if (task.status === 'done') { ✓ }
                  </div>

                  <div class="task-content">
                    <span class="task-title" [class.done]="task.status === 'done'">{{ task.title }}</span>
                    <div class="task-meta">
                      <span class="task-owner">
                        <span class="mini-avatar" [style.background]="task.owner.color">{{ task.owner.initials }}</span>
                        {{ task.owner.name.split(' ')[0] }}
                      </span>
                      <span>·</span>
                      <span class="task-due" [class.overdue]="isOverdue(task.dueDate)">
                        {{ task.dueDate }}
                      </span>
                    </div>
                  </div>

                  <span class="task-priority" [class.crit]="task.priority === 'critical'" [class.high]="task.priority === 'high'" [class.med]="task.priority === 'medium'">
                    {{ task.priority }}
                  </span>
                </div>
              }
            </div>
          </section>

          <!-- KEY RECENT DECISIONS -->
          <section class="dash-card">
            <div class="card-title-row">
              <div>
                <h2>Ratified Decisions</h2>
                <p>Latest organizational alignments</p>
              </div>
              <a routerLink="/decisions" class="card-action-link">All decisions →</a>
            </div>

            <div class="decision-list">
              @for (dec of recentDecisions(); track dec.id) {
                <div class="decision-item">
                  <div class="dec-bullet">◆</div>
                  <div class="dec-body">
                    <strong>{{ dec.title }}</strong>
                    <p>{{ dec.description }}</p>
                    <div class="dec-meta">
                      <span>{{ dec.meetingTitle }}</span>
                      <span>·</span>
                      <span class="dec-conf">{{ dec.confidence }}% confidence</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- LIVE ACTIVITY STREAM -->
          <section class="dash-card">
            <div class="card-title-row">
              <div>
                <h2>Activity Feed</h2>
                <p>Real-time extraction events</p>
              </div>
              <a routerLink="/activity" class="card-action-link">View feed →</a>
            </div>

            <div class="activity-feed">
              @for (act of store.activities().slice(0, 4); track act.id) {
                <div class="activity-row">
                  <div class="act-indicator" [class.act-dec]="act.type === 'decision'" [class.act-act]="act.type === 'action'" [class.act-conf]="act.type === 'conflict'">
                    @switch (act.type) {
                      @case ('decision') { ◆ }
                      @case ('action') { ✓ }
                      @case ('conflict') { ! }
                      @default { ◫ }
                    }
                  </div>
                  <div class="act-text">
                    <span class="act-title">{{ act.title }}</span>
                    <p class="act-desc">{{ act.description }}</p>
                    <span class="act-time">{{ act.timestamp }}</span>
                  </div>
                </div>
              }
            </div>
          </section>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dashboard-page {
      max-width: 1440px;
      margin: 0 auto;
    }

    /* HERO */
    .dashboard-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .eyebrow {
      color: #6366f1;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.4px;
      margin-bottom: 6px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 26px;
      font-weight: 750;
      letter-spacing: -0.5px;
    }

    .dashboard-hero p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 13px;
      max-width: 680px;
    }

    .hero-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .primary-btn, .secondary-btn {
      display: inline-flex;
      align-items: center;
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: 0.15s ease;
      cursor: pointer;
    }

    .primary-btn {
      background: #4f46e5;
      color: white;
      border: 1px solid #4338ca;
    }

    .primary-btn:hover {
      background: #4338ca;
    }

    .secondary-btn {
      background: white;
      color: #334155;
      border: 1px solid #e2e8f0;
    }

    .secondary-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    /* KPI GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      transform: translateY(-1px);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-title {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
    }

    .kpi-body {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }

    .kpi-trend {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }

    .kpi-trend.positive {
      color: #059669;
    }

    .kpi-trend.warning {
      color: #dc2626;
    }

    .kpi-desc {
      font-size: 11px;
      color: #94a3b8;
    }

    /* ATTENTION BANNER */
    .attention-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }

    .attention-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fef3c7;
      color: #b45309;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .attention-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .attention-text strong {
      color: #92400e;
      font-size: 13px;
    }

    .attention-text span {
      color: #b45309;
      font-size: 12px;
    }

    .attention-actions {
      display: flex;
      gap: 12px;
    }

    .alert-link-conflict, .alert-link-action {
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      background: white;
      border: 1px solid #fcd34d;
      color: #92400e;
      transition: 0.15s ease;
    }

    .alert-link-conflict:hover, .alert-link-action:hover {
      background: #fef3c7;
    }

    /* DASHBOARD LAYOUT GRID */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 18px;
    }

    .grid-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .dash-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 22px;
    }

    .card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-title-row h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .card-title-row p {
      margin: 3px 0 0;
      font-size: 11px;
      color: #94a3b8;
    }

    .card-action-link {
      font-size: 11px;
      font-weight: 650;
      color: #4f46e5;
      text-decoration: none;
    }

    .card-action-link:hover {
      text-decoration: underline;
    }

    /* MEETING ITEMS */
    .meeting-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meeting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 13px 15px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-decoration: none;
      transition: 0.15s ease;
    }

    .meeting-row:hover {
      background: #f8fafc;
      border-color: #c7d2fe;
    }

    .meeting-lead {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .m-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #eef2ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .meeting-lead h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 650;
      color: #1e293b;
    }

    .m-meta {
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #94a3b8;
    }

    .m-dept {
      background: #f1f5f9;
      color: #475569;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    .meeting-trailing {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .pill-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 44px;
    }

    .pill-stat strong {
      font-size: 13px;
      color: #334155;
    }

    .pill-stat span {
      font-size: 9px;
      color: #94a3b8;
    }

    .row-arrow {
      color: #cbd5e1;
      font-size: 16px;
    }

    /* THEME CARDS */
    .theme-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .theme-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      background: #fafafa;
    }

    .theme-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .theme-head h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .theme-mentions {
      font-size: 10px;
      font-weight: 700;
      color: #4f46e5;
      background: #eef2ff;
      padding: 2px 7px;
      border-radius: 999px;
    }

    .theme-summary {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .theme-foot {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .theme-involved-label {
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
    }

    .theme-sources {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .source-tag {
      font-size: 10px;
      background: white;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 2px 7px;
      border-radius: 4px;
      text-decoration: none;
    }

    .source-tag:hover {
      border-color: #6366f1;
      color: #4f46e5;
    }

    /* TASK LIST */
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
    }

    .task-check {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1.5px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      color: white;
      flex-shrink: 0;
    }

    .task-check.checked {
      background: #10b981;
      border-color: #10b981;
    }

    .task-content {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-title.done {
      text-decoration: line-through;
      color: #94a3b8;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
      font-size: 10px;
      color: #94a3b8;
    }

    .task-owner {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #475569;
    }

    .mini-avatar {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      color: white;
      font-size: 7px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .task-due.overdue {
      color: #dc2626;
      font-weight: 700;
    }

    .task-priority {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .task-priority.crit {
      background: #fee2e2;
      color: #dc2626;
    }

    .task-priority.high {
      background: #fff7ed;
      color: #ea580c;
    }

    .task-priority.med {
      background: #f1f5f9;
      color: #475569;
    }

    /* DECISION LIST */
    .decision-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .decision-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      border-bottom: 1px solid #f8fafc;
      padding-bottom: 10px;
    }

    .decision-item:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .dec-bullet {
      color: #4f46e5;
      font-size: 10px;
      margin-top: 3px;
    }

    .dec-body strong {
      display: block;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.3;
    }

    .dec-body p {
      margin: 3px 0 4px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .dec-meta {
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      gap: 6px;
    }

    .dec-conf {
      color: #059669;
      font-weight: 600;
    }

    /* ACTIVITY FEED */
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .act-indicator {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .act-indicator.act-dec {
      background: #eef2ff;
      color: #4f46e5;
    }

    .act-indicator.act-act {
      background: #ecfdf5;
      color: #059669;
    }

    .act-indicator.act-conf {
      background: #fee2e2;
      color: #dc2626;
    }

    .act-text {
      flex: 1;
    }

    .act-title {
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
    }

    .act-desc {
      margin: 2px 0 3px;
      font-size: 11px;
      color: #64748b;
    }

    .act-time {
      font-size: 9px;
      color: #94a3b8;
    }

    /* RESPONSIVENESS */
    @media (max-width: 1100px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 650px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-hero {
        flex-direction: column;
      }

      .meeting-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .meeting-trailing {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class DashboardComponent {
  readonly store = inject(StoreService);

  readonly recentMeetings = computed(() =>
    this.store.meetings().slice(0, 4)
  );

  readonly priorityTasks = computed(() =>
    this.store.actions().slice(0, 5)
  );

  readonly recentDecisions = computed(() =>
    this.store.decisions().slice(0, 3)
  );

  toggleTask(id: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'done' ? 'in-progress' : 'done';
    this.store.updateActionStatus(id, nextStatus as any);
  }

  isOverdue(dueDateStr: string): boolean {
    const due = new Date(dueDateStr);
    const now = new Date('2026-03-15T00:00:00');
    return due.getTime() < now.getTime();
  }
}
