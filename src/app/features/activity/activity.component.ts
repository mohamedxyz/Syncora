import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { Activity } from '../../core/models/actionsync.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="activity-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">AUDIT & TELEMETRY</div>
          <h1>System Activity</h1>
          <p>
            Chronological ledger of AI extractions, decision ratifications, and action state changes.
          </p>
        </div>

        <button class="secondary-button" (click)="clearAll()">
          Clear History
        </button>
      </section>

      <!-- TOOLBAR -->
      <section class="toolbar">
        <div class="tabs">
          <button [class.active]="filter() === 'all'" (click)="filter.set('all')">
            All Events
            <span>{{ store.activities().length }}</span>
          </button>
          <button [class.active]="filter() === 'decision'" (click)="filter.set('decision')">
            Decisions
          </button>
          <button [class.active]="filter() === 'action'" (click)="filter.set('action')">
            Actions
          </button>
          <button [class.active]="filter() === 'conflict'" (click)="filter.set('conflict')">
            Conflicts
          </button>
          <button [class.active]="filter() === 'meeting'" (click)="filter.set('meeting')">
            Meetings
          </button>
        </div>
      </section>

      <!-- TIMELINE LIST -->
      <section class="timeline">
        @if (filteredActivities().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">↻</div>
            <h3>No events found</h3>
            <p>No activity recorded matching the current filter.</p>
          </div>
        } @else {
          <div class="timeline-container">
            @for (act of filteredActivities(); track act.id) {
              <div class="timeline-row">
                <div class="icon-bubble" [class.bubble-dec]="act.type === 'decision'" [class.bubble-act]="act.type === 'action'" [class.bubble-conf]="act.type === 'conflict'" [class.bubble-meet]="act.type === 'meeting'">
                  @switch (act.type) {
                    @case ('decision') { ◆ }
                    @case ('action') { ✓ }
                    @case ('conflict') { ! }
                    @default { ◫ }
                  }
                </div>

                <div class="content-box">
                  <div class="row-header">
                    <span class="event-title">{{ act.title }}</span>
                    <span class="timestamp">{{ act.timestamp }}</span>
                  </div>

                  <p class="description">{{ act.description }}</p>

                  <div class="row-footer">
                    @if (act.user) {
                      <div class="actor">
                        <span class="mini-avatar" [style.background]="act.user.color">{{ act.user.initials }}</span>
                        <span>{{ act.user.name }}</span>
                      </div>
                    }
                    @if (act.link) {
                      <a [routerLink]="act.link" class="jump-link">
                        View context →
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .activity-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
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

    .page-header p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 13px;
      max-width: 650px;
    }

    .secondary-button {
      padding: 8px 14px;
      border-radius: 7px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .secondary-button:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .toolbar {
      margin-bottom: 20px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 8px;
      width: fit-content;
    }

    .tabs button {
      border: 0;
      border-radius: 6px;
      padding: 7px 14px;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
    }

    .tabs button.active {
      background: white;
      color: #1e293b;
      font-weight: 650;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .tabs button span {
      margin-left: 6px;
      color: #94a3b8;
    }

    .timeline-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
    }

    .timeline-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .icon-bubble {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .bubble-dec { background: #eef2ff; color: #4f46e5; }
    .bubble-act { background: #ecfdf5; color: #059669; }
    .bubble-conf { background: #fee2e2; color: #dc2626; }
    .bubble-meet { background: #eff6ff; color: #2563eb; }

    .content-box {
      flex: 1;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
    }

    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .event-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .timestamp {
      font-size: 11px;
      color: #94a3b8;
    }

    .description {
      margin: 0 0 10px;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }

    .row-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f8fafc;
      padding-top: 8px;
    }

    .actor {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
    }

    .mini-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      color: white;
      font-size: 8px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .jump-link {
      font-size: 11px;
      color: #4f46e5;
      font-weight: 600;
      text-decoration: none;
    }

    .jump-link:hover {
      text-decoration: underline;
    }

    .empty-state {
      background: white;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 48px 20px;
      text-align: center;
    }

    .empty-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin: 0 auto 14px;
    }

    .empty-state h3 {
      margin: 0 0 6px;
      color: #1e293b;
      font-size: 16px;
    }

    .empty-state p {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }
  `]
})
export class ActivityComponent {
  readonly store = inject(StoreService);

  readonly filter = signal<'all' | 'decision' | 'action' | 'conflict' | 'meeting'>('all');

  readonly filteredActivities = computed(() => {
    if (this.filter() === 'all') return this.store.activities();
    return this.store.activities().filter(a => a.type === this.filter());
  });

  clearAll(): void {
    this.store.activities.set([]);
  }
}
