import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { Decision } from '../../core/models/actionsync.model';

@Component({
  selector: 'app-decisions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="decisions-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">ORGANIZATIONAL RECORD</div>
          <h1>Decisions</h1>
          <p>
            Searchable registry of ratified commitments, technical architectures, and policy choices.
          </p>
        </div>

        <button class="primary-button" (click)="showNewModal.set(true)">
          + Record Decision
        </button>
      </section>

      <!-- STATS -->
      <section class="dec-stats">
        <div class="stat-card">
          <span>Total Ratified Decisions</span>
          <strong>{{ store.decisions().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Active & Confirmed</span>
          <strong class="text-success">{{ confirmedCount() }}</strong>
        </div>
        <div class="stat-card">
          <span>Under Review</span>
          <strong class="text-warning">{{ underReviewCount() }}</strong>
        </div>
        <div class="stat-card">
          <span>Superseded</span>
          <strong class="text-neutral">{{ supersededCount() }}</strong>
        </div>
      </section>

      <!-- TOOLBAR -->
      <section class="toolbar">
        <div class="tabs">
          <button [class.active]="filter() === 'all'" (click)="filter.set('all')">
            All
            <span>{{ store.decisions().length }}</span>
          </button>
          <button [class.active]="filter() === 'confirmed'" (click)="filter.set('confirmed')">
            Confirmed
            <span>{{ confirmedCount() }}</span>
          </button>
          <button [class.active]="filter() === 'under-review'" (click)="filter.set('under-review')">
            Under Review
            <span>{{ underReviewCount() }}</span>
          </button>
          <button [class.active]="filter() === 'superseded'" (click)="filter.set('superseded')">
            Superseded
            <span>{{ supersededCount() }}</span>
          </button>
        </div>

        <div class="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search decisions, context, meeting sources..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>
      </section>

      <!-- DECISION GRID -->
      <section class="dec-grid">
        @if (filteredDecisions().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">◆</div>
            <h3>No decisions found</h3>
            <p>Try clearing your filter or searching for another keyword.</p>
          </div>
        } @else {
          @for (decision of filteredDecisions(); track decision.id) {
            <article class="decision-card" [class.superseded]="decision.status === 'superseded'">
              <div class="card-top">
                <span class="decision-id">#{{ decision.id.toUpperCase() }}</span>
                <span
                  class="status-badge"
                  [class.confirmed]="decision.status === 'confirmed'"
                  [class.under-review]="decision.status === 'under-review'"
                  [class.superseded]="decision.status === 'superseded'"
                >
                  {{ decision.status }}
                </span>
              </div>

              <h3>{{ decision.title }}</h3>
              <p class="description">{{ decision.description }}</p>

              @if (decision.context) {
                <div class="context-box">
                  <span class="context-lbl">Context:</span>
                  <span class="context-val">{{ decision.context }}</span>
                </div>
              }

              <div class="card-footer">
                <div class="meta-owner">
                  <span class="avatar" [style.background]="decision.owner.color">
                    {{ decision.owner.initials }}
                  </span>
                  <span>{{ decision.owner.name }}</span>
                </div>

                <div class="meta-meeting">
                  <span>Source:</span>
                  <a [routerLink]="['/meetings', decision.meetingId]">
                    {{ decision.meetingTitle }}
                  </a>
                </div>

                <div class="meta-date">
                  <span>{{ decision.date }}</span>
                </div>

                <div class="meta-confidence">
                  <strong>{{ decision.confidence }}%</strong>
                  <span>confidence</span>
                </div>
              </div>
            </article>
          }
        }
      </section>

      <!-- NEW DECISION MODAL -->
      @if (showNewModal()) {
        <div class="modal-backdrop" (click)="showNewModal.set(false)">
          <div class="modal-window" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Record New Decision</h2>
              <button class="close-btn" (click)="showNewModal.set(false)">×</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Decision Title</label>
                <input #titleInput type="text" placeholder="e.g., Adopt OpenTelemetry for distributed tracing" />
              </div>

              <div class="form-group">
                <label>Description & Scope</label>
                <textarea #descInput rows="3" placeholder="Explain the agreed solution, alternatives rejected, and business justification..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Meeting Source</label>
                  <select #meetingSelect>
                    @for (m of store.meetings(); track m.id) {
                      <option [value]="m.id">{{ m.title }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label>Status</label>
                  <select #statusSelect>
                    <option value="confirmed">Confirmed</option>
                    <option value="under-review">Under Review</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="showNewModal.set(false)">Cancel</button>
              <button
                class="btn-save"
                (click)="saveDecision(titleInput.value, descInput.value, meetingSelect.value, statusSelect.value)"
              >
                Record Decision
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .decisions-page {
      max-width: 1400px;
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

    .primary-button {
      padding: 9px 16px;
      border-radius: 8px;
      border: 0;
      background: #4f46e5;
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary-button:hover {
      background: #4338ca;
    }

    .dec-stats {
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
    }

    .stat-card strong {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .text-success { color: #059669 !important; }
    .text-warning { color: #ea580c !important; }
    .text-neutral { color: #94a3b8 !important; }

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
      width: 340px;
      color: #94a3b8;
    }

    .search-box input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 12px;
      color: #1e293b;
    }

    .dec-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .decision-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .decision-card:hover {
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
      border-color: #cbd5e1;
    }

    .decision-card.superseded {
      opacity: 0.75;
      background: #fafafa;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .decision-id {
      font-size: 10px;
      font-weight: 800;
      color: #a5b4fc;
      letter-spacing: 0.5px;
    }

    .status-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: capitalize;
    }

    .status-badge.confirmed {
      background: #ecfdf5;
      color: #059669;
    }

    .status-badge.under-review {
      background: #fff7ed;
      color: #ea580c;
    }

    .status-badge.superseded {
      background: #f1f5f9;
      color: #64748b;
      text-decoration: line-through;
    }

    .decision-card h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.4;
    }

    .description {
      margin: 0;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      flex: 1;
    }

    .context-box {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 6px 10px;
      border-radius: 0 6px 6px 0;
      font-size: 11px;
      display: flex;
      gap: 6px;
    }

    .context-lbl {
      color: #6366f1;
      font-weight: 700;
    }

    .context-val {
      color: #64748b;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
      font-size: 11px;
      color: #94a3b8;
      flex-wrap: wrap;
    }

    .meta-owner {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #334155;
    }

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      color: white;
      font-size: 8px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .meta-meeting a {
      color: #4f46e5;
      font-weight: 600;
    }

    .meta-confidence strong {
      color: #059669;
      font-weight: 700;
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-window {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
    }

    .close-btn {
      border: 0;
      background: transparent;
      font-size: 20px;
      color: #94a3b8;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .form-group label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input, .form-group textarea, .form-group select {
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 8px 10px;
      font-size: 12px;
      color: #1e293b;
      outline: 0;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      border-color: #6366f1;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 14px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel {
      padding: 8px 14px;
      border: 1px solid #cbd5e1;
      background: white;
      border-radius: 6px;
      font-size: 12px;
      color: #475569;
      cursor: pointer;
    }

    .btn-save {
      padding: 8px 16px;
      border: 0;
      background: #4f46e5;
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .empty-state {
      grid-column: span 2;
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
      background: #eef2ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
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

    @media (max-width: 900px) {
      .dec-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .dec-grid {
        grid-template-columns: 1fr;
      }

      .empty-state {
        grid-column: span 1;
      }
    }

    @media (max-width: 600px) {
      .dec-stats {
        grid-template-columns: 1fr;
      }

      .search-box {
        width: 100%;
      }
    }
  `]
})
export class DecisionsComponent {
  readonly store = inject(StoreService);

  readonly filter = signal<'all' | 'confirmed' | 'under-review' | 'superseded'>('all');
  readonly searchTerm = signal('');
  readonly showNewModal = signal(false);

  readonly confirmedCount = computed(() =>
    this.store.decisions().filter(d => d.status === 'confirmed').length
  );

  readonly underReviewCount = computed(() =>
    this.store.decisions().filter(d => d.status === 'under-review').length
  );

  readonly supersededCount = computed(() =>
    this.store.decisions().filter(d => d.status === 'superseded').length
  );

  readonly filteredDecisions = computed(() => {
    let list = this.store.decisions();

    if (this.filter() !== 'all') {
      list = list.filter(d => d.status === this.filter());
    }

    const query = this.searchTerm().toLowerCase().trim();
    if (query) {
      list = list.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.meetingTitle.toLowerCase().includes(query) ||
        (d.context && d.context.toLowerCase().includes(query))
      );
    }

    return list;
  });

  onSearch(e: Event): void {
    this.searchTerm.set((e.target as HTMLInputElement).value);
  }

  saveDecision(title: string, description: string, meetingId: string, status: string): void {
    if (!title.trim()) return;

    const meeting = this.store.meetings().find(m => m.id === meetingId);
    const newDec: Decision = {
      id: `d-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      date: 'Today',
      meetingId: meetingId || 'general',
      meetingTitle: meeting ? meeting.title : 'Ad-hoc Sync',
      owner: this.store.currentUser(),
      confidence: 95,
      status: status as any
    };

    this.store.decisions.update(list => [newDec, ...list]);
    this.store.addActivity({
      id: `act-${Date.now()}`,
      type: 'decision',
      title: 'Decision Recorded',
      description: `"${newDec.title}" recorded with ${newDec.status} status.`,
      timestamp: 'Just now',
      user: this.store.currentUser(),
      link: '/decisions'
    });

    this.showNewModal.set(false);
  }
}
