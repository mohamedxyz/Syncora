import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { Conflict } from '../../core/models/actionsync.model';

@Component({
  selector: 'app-conflicts',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="conflicts-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">DECISION GOVERNANCE</div>
          <h1>Decision Conflicts</h1>
          <p>
            AI-detected contradictions and policy discrepancies across organizational meetings.
          </p>
        </div>

        <div class="header-badges">
          <span class="unresolved-badge">
            ⚠ {{ store.unresolvedConflicts().length }} Unresolved
          </span>
        </div>
      </section>

      <!-- STATS BAR -->
      <section class="conflict-stats">
        <div class="stat-card">
          <span>Total Conflicts Detected</span>
          <strong>{{ store.conflicts().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Critical Severity</span>
          <strong class="text-danger">{{ criticalCount() }}</strong>
        </div>
        <div class="stat-card">
          <span>Pending Resolution</span>
          <strong class="text-warning">{{ store.unresolvedConflicts().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Resolved & Archived</span>
          <strong class="text-success">{{ resolvedCount() }}</strong>
        </div>
      </section>

      <!-- TOOLBAR -->
      <section class="toolbar">
        <div class="tabs">
          <button [class.active]="filter() === 'all'" (click)="filter.set('all')">
            All
            <span>{{ store.conflicts().length }}</span>
          </button>
          <button [class.active]="filter() === 'unresolved'" (click)="filter.set('unresolved')">
            Unresolved
            <span>{{ store.unresolvedConflicts().length }}</span>
          </button>
          <button [class.active]="filter() === 'resolved'" (click)="filter.set('resolved')">
            Resolved
            <span>{{ resolvedCount() }}</span>
          </button>
        </div>

        <div class="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search conflicts, decisions, meetings..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>
      </section>

      <!-- CONFLICT LIST -->
      <section class="conflict-list">
        @if (filteredConflicts().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">✓</div>
            <h3>No conflicts found</h3>
            <p>
              @if (filter() === 'unresolved') {
                Great job! All cross-meeting decision conflicts have been resolved.
              } @else {
                Try adjusting your search criteria or filter.
              }
            </p>
          </div>
        } @else {
          @for (conflict of filteredConflicts(); track conflict.id) {
            <article class="conflict-card" [class.resolved]="conflict.resolved">

              <!-- CONFLICT HEADER -->
              <div class="conflict-card-header">
                <div class="header-left">
                  <span class="severity-pill" [class.sev-crit]="conflict.severity === 'critical'" [class.sev-med]="conflict.severity === 'medium'">
                    {{ conflict.severity }} severity
                  </span>
                  <h2>{{ conflict.title }}</h2>
                </div>

                <div class="status-wrap">
                  @if (conflict.resolved) {
                    <span class="resolved-tag">✓ Resolved</span>
                  } @else {
                    <span class="active-tag">Active Conflict</span>
                  }
                </div>
              </div>

              <!-- CONFLICT EXPLANATION -->
              <p class="explanation">
                {{ conflict.explanation }}
              </p>

              <!-- SIDE-BY-SIDE DECISION COMPARISON -->
              <div class="comparison-grid">

                <!-- DECISION A (NEWEST) -->
                <div class="decision-box current">
                  <div class="box-tag">
                    <span>LATEST DECISION (Newer)</span>
                    <span class="conf-score">{{ conflict.currentDecision.confidence }}% conf</span>
                  </div>

                  <h4>{{ conflict.currentDecision.title }}</h4>
                  <p>{{ conflict.currentDecision.description }}</p>

                  <div class="box-meta">
                    <span class="source-meeting">
                      ◫
                      <a [routerLink]="['/meetings', conflict.currentDecision.meetingId]">
                        {{ conflict.currentDecision.meetingTitle }}
                      </a>
                    </span>
                    <span>·</span>
                    <span>{{ conflict.currentDecision.date }}</span>
                    <span>·</span>
                    <span>Owner: {{ conflict.currentDecision.owner.name }}</span>
                  </div>
                </div>

                <!-- VS DIVIDER -->
                <div class="vs-divider">
                  <span>VS</span>
                </div>

                <!-- DECISION B (PRIOR) -->
                <div class="decision-box prior">
                  <div class="box-tag">
                    <span>PRIOR RATIFIED DECISION</span>
                    <span class="conf-score">{{ conflict.previousDecision.confidence }}% conf</span>
                  </div>

                  <h4>{{ conflict.previousDecision.title }}</h4>
                  <p>{{ conflict.previousDecision.description }}</p>

                  <div class="box-meta">
                    <span class="source-meeting">
                      ◫
                      <a [routerLink]="['/meetings', conflict.previousDecision.meetingId]">
                        {{ conflict.previousDecision.meetingTitle }}
                      </a>
                    </span>
                    <span>·</span>
                    <span>{{ conflict.previousDecision.date }}</span>
                    <span>·</span>
                    <span>Owner: {{ conflict.previousDecision.owner.name }}</span>
                  </div>
                </div>

              </div>

              <!-- RESOLUTION SECTION -->
              @if (conflict.resolved) {
                <div class="resolution-resolved-box">
                  <div class="res-title">
                    <strong>Resolution Rationale:</strong>
                    <span>Resolved on {{ conflict.resolvedAt || 'Mar 14, 2026' }}</span>
                  </div>
                  <p>{{ conflict.resolutionNotes }}</p>
                </div>
              } @else {
                <div class="resolution-action-bar">
                  @if (resolvingId() === conflict.id) {
                    <div class="resolution-form">
                      <label>Enter resolution decision rationale or agreement notes:</label>
                      <textarea
                        #notesInput
                        placeholder="e.g., Aligned with security lead David Chen: OAuth2 ratified as primary platform standard. Deprecation window of 60 days granted for static API keys."
                        rows="3"
                      ></textarea>
                      <div class="res-buttons">
                        <button class="cancel-btn" (click)="resolvingId.set(null)">Cancel</button>
                        <button class="confirm-btn" (click)="confirmResolve(conflict.id, notesInput.value)">
                          Confirm Resolution
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="prompt-resolve">
                      <span>Requires executive or engineering lead alignment to reconcile these contradicting decisions.</span>
                      <button class="resolve-btn" (click)="resolvingId.set(conflict.id)">
                        Resolve Conflict →
                      </button>
                    </div>
                  }
                </div>
              }

            </article>
          }
        }
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .conflicts-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* HEADER */
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

    .unresolved-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: #fee2e2;
      color: #dc2626;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #fca5a5;
    }

    /* STATS */
    .conflict-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }

    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
    }

    .stat-card span {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }

    .stat-card strong {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .text-danger { color: #dc2626 !important; }
    .text-warning { color: #ea580c !important; }
    .text-success { color: #059669 !important; }

    /* TOOLBAR */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tabs {
      display: flex;
      gap: 4px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 8px;
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

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      width: 320px;
      color: #94a3b8;
    }

    .search-box input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 12px;
      color: #1e293b;
    }

    /* CONFLICT LIST */
    .conflict-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .conflict-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      transition: box-shadow 0.15s ease;
    }

    .conflict-card:hover {
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
    }

    .conflict-card.resolved {
      opacity: 0.85;
      background: #fafafa;
    }

    .conflict-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 10px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .header-left h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 750;
      color: #0f172a;
    }

    .severity-pill {
      font-size: 10px;
      font-weight: 750;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      letter-spacing: 0.5px;
    }

    .severity-pill.sev-crit {
      background: #fee2e2;
      color: #dc2626;
    }

    .severity-pill.sev-med {
      background: #fff7ed;
      color: #ea580c;
    }

    .active-tag {
      font-size: 11px;
      font-weight: 650;
      color: #dc2626;
      background: #fef2f2;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #fee2e2;
    }

    .resolved-tag {
      font-size: 11px;
      font-weight: 650;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .explanation {
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin: 8px 0 18px;
    }

    /* COMPARISON GRID */
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: stretch;
      gap: 14px;
      margin-bottom: 18px;
    }

    .decision-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .decision-box.current {
      border-color: #c7d2fe;
      background: #fdfdff;
    }

    .box-tag {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .box-tag span:first-child {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #4f46e5;
    }

    .decision-box.prior .box-tag span:first-child {
      color: #64748b;
    }

    .conf-score {
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .decision-box h4 {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }

    .decision-box p {
      margin: 0 0 12px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }

    .box-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      flex-wrap: wrap;
    }

    .source-meeting {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .source-meeting a {
      color: #4f46e5;
      font-weight: 600;
    }

    .source-meeting a:hover {
      text-decoration: underline;
    }

    .vs-divider {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vs-divider span {
      background: #e2e8f0;
      color: #64748b;
      font-size: 10px;
      font-weight: 800;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* RESOLUTION */
    .resolution-action-bar {
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }

    .prompt-resolve {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .prompt-resolve span {
      font-size: 12px;
      color: #64748b;
    }

    .resolve-btn {
      padding: 8px 16px;
      border-radius: 7px;
      border: 0;
      background: #4f46e5;
      color: white;
      font-size: 12px;
      font-weight: 650;
      cursor: pointer;
      transition: background 0.15s ease;
      flex-shrink: 0;
    }

    .resolve-btn:hover {
      background: #4338ca;
    }

    .resolution-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .resolution-form label {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    .resolution-form textarea {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 10px;
      font-size: 12px;
      color: #1e293b;
      outline: 0;
      resize: vertical;
    }

    .resolution-form textarea:focus {
      border-color: #6366f1;
    }

    .res-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .cancel-btn {
      padding: 7px 14px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 12px;
      cursor: pointer;
    }

    .confirm-btn {
      padding: 7px 14px;
      border-radius: 6px;
      border: 0;
      background: #10b981;
      color: white;
      font-size: 12px;
      font-weight: 650;
      cursor: pointer;
    }

    .confirm-btn:hover {
      background: #059669;
    }

    .resolution-resolved-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      background: #f1fdf6;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 6px;
    }

    .res-title {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .res-title strong {
      color: #065f46;
    }

    .res-title span {
      color: #047857;
    }

    .resolution-resolved-box p {
      margin: 0;
      font-size: 12px;
      color: #064e3b;
      line-height: 1.4;
    }

    /* EMPTY STATE */
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
      background: #ecfdf5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
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

    /* RESPONSIVE */
    @media (max-width: 900px) {
      .conflict-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .comparison-grid {
        grid-template-columns: 1fr;
      }

      .vs-divider {
        padding: 4px 0;
      }
    }

    @media (max-width: 600px) {
      .conflict-stats {
        grid-template-columns: 1fr;
      }

      .prompt-resolve {
        flex-direction: column;
        align-items: flex-start;
      }

      .search-box {
        width: 100%;
      }
    }
  `]
})
export class ConflictsComponent {
  readonly store = inject(StoreService);

  readonly filter = signal<'all' | 'unresolved' | 'resolved'>('unresolved');
  readonly searchTerm = signal('');
  readonly resolvingId = signal<string | null>(null);

  readonly criticalCount = computed(() =>
    this.store.conflicts().filter(c => c.severity === 'critical' && !c.resolved).length
  );

  readonly resolvedCount = computed(() =>
    this.store.conflicts().filter(c => c.resolved).length
  );

  readonly filteredConflicts = computed(() => {
    let list = this.store.conflicts();

    if (this.filter() === 'unresolved') {
      list = list.filter(c => !c.resolved);
    } else if (this.filter() === 'resolved') {
      list = list.filter(c => c.resolved);
    }

    const query = this.searchTerm().toLowerCase().trim();
    if (query) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.explanation.toLowerCase().includes(query) ||
        c.currentDecision.title.toLowerCase().includes(query) ||
        c.previousDecision.title.toLowerCase().includes(query)
      );
    }

    return list;
  });

  onSearch(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  confirmResolve(conflictId: string, notes: string): void {
    this.store.resolveConflict(conflictId, notes);
    this.resolvingId.set(null);
  }
}
