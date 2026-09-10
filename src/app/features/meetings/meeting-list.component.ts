import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { Meeting } from '../../core/models/actionsync.model';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="meetings-page">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="eyebrow">WORKSPACE</div>
          <h1>Meetings</h1>
          <p>
            Review meetings, analysis results, actions, and decisions converted into structured intelligence.
          </p>
        </div>

        <button class="primary-button" (click)="showNewModal.set(true)">
          + Process New Meeting
        </button>
      </div>

      <!-- SUMMARY COUNTERS BAR -->
      <div class="metrics-bar">
        <div class="metric-box">
          <span>All Meetings</span>
          <strong>{{ store.meetings().length }}</strong>
        </div>
        <div class="metric-box">
          <span>Fully Analyzed</span>
          <strong class="text-success">{{ analyzedCount() }}</strong>
        </div>
        <div class="metric-box">
          <span>In Pipeline</span>
          <strong class="text-warning">{{ processingCount() }}</strong>
        </div>
        <div class="metric-box">
          <span>Total Actions Extracted</span>
          <strong class="text-primary">{{ totalActionsExtracted() }}</strong>
        </div>
      </div>

      <!-- TOOLBAR (Search + Filter + Sort) -->
      <div class="toolbar">

        <!-- STATUS TABS -->
        <div class="tabs">
          <button
            [class.active]="filter() === 'all'"
            (click)="filter.set('all')"
          >
            All
            <span>{{ store.meetings().length }}</span>
          </button>

          <button
            [class.active]="filter() === 'analyzed'"
            (click)="filter.set('analyzed')"
          >
            Analyzed
            <span>{{ analyzedCount() }}</span>
          </button>

          <button
            [class.active]="filter() === 'processing'"
            (click)="filter.set('processing')"
          >
            Processing
            <span>{{ processingCount() }}</span>
          </button>
        </div>

        <!-- SEARCH & DROPDOWNS -->
        <div class="toolbar-right">
          <!-- SEARCH -->
          <div class="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search meetings by title, department, or summary..."
              [value]="searchTerm()"
              (input)="onSearch($event)"
            />
          </div>

          <!-- DEPARTMENT FILTER -->
          <div class="select-wrapper">
            <select [value]="departmentFilter()" (change)="departmentFilter.set($any($event.target).value)">
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <!-- SORT DROPDOWN -->
          <div class="select-wrapper">
            <select [value]="sortBy()" (change)="sortBy.set($any($event.target).value)">
              <option value="newest">Sort: Newest First</option>
              <option value="actions">Sort: Most Actions</option>
              <option value="decisions">Sort: Most Decisions</option>
              <option value="confidence">Sort: Highest Confidence</option>
            </select>
          </div>
        </div>

      </div>

      <!-- MEETING LIST -->
      <div class="meeting-list">

        @if (filteredMeetings().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">◫</div>
            <h2>No meetings match your criteria</h2>
            <p>Try resetting your search query or selecting a different department filter.</p>
            <button class="reset-btn" (click)="resetFilters()">Reset Filters</button>
          </div>
        } @else {

          @for (meeting of filteredMeetings(); track meeting.id) {

            <a
              class="meeting-card"
              [routerLink]="['/meetings', meeting.id]"
            >

              <div class="meeting-main">

                <div class="meeting-icon" [class.proc-icon]="meeting.status === 'Processing'">
                  @if (meeting.status === 'Processing') {
                    ↻
                  } @else {
                    ◫
                  }
                </div>

                <div class="meeting-info">

                  <div class="title-row">
                    <h2>{{ meeting.title }}</h2>

                    <span class="dept-badge">{{ meeting.department }}</span>

                    <span
                      class="status"
                      [class.analyzed]="meeting.status === 'Analyzed'"
                      [class.processing]="meeting.status === 'Processing'"
                      [class.pending]="meeting.status === 'Pending'"
                    >
                      <i></i>
                      {{ meeting.status }}
                    </span>
                  </div>

                  <div class="metadata">
                    <span>{{ meeting.date }}</span>
                    <span>·</span>
                    <span>{{ meeting.time }}</span>
                    <span>·</span>
                    <span>{{ meeting.duration }}</span>
                  </div>

                  <p class="meeting-summary-preview">
                    {{ meeting.summary }}
                  </p>

                  <div class="attendees">
                    @for (person of meeting.participants; track person.id) {
                      <span class="avatar" [style.background]="person.color" [title]="person.name">
                        {{ person.initials }}
                      </span>
                    }
                    <span class="attendee-count">
                      {{ meeting.participants.length }} attendees
                    </span>
                  </div>

                </div>

              </div>

              <div class="meeting-stats">

                <div class="stat">
                  <strong>{{ meeting.actionCount }}</strong>
                  <span>Actions</span>
                </div>

                <div class="stat">
                  <strong>{{ meeting.decisionCount }}</strong>
                  <span>Decisions</span>
                </div>

                <div class="stat">
                  <strong>{{ meeting.insights ? meeting.insights.length : 0 }}</strong>
                  <span>Insights</span>
                </div>

                <div class="stat confidence">
                  <strong>{{ meeting.confidence }}%</strong>
                  <span>Confidence</span>
                </div>

                <div class="arrow">
                  →
                </div>

              </div>

            </a>

          }

        }

      </div>

      <!-- NEW MEETING MODAL -->
      @if (showNewModal()) {
        <div class="modal-backdrop" (click)="showNewModal.set(false)">
          <div class="modal-window" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>Process New Meeting</h2>
                <p>Convert transcript or meeting notes into structured intelligence</p>
              </div>
              <button class="close-btn" (click)="showNewModal.set(false)">×</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Meeting Title</label>
                <input #titleInput type="text" placeholder="e.g., Mobile App SDK Security Review" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Department</label>
                  <select #deptSelect>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Duration</label>
                  <input #durationInput type="text" placeholder="e.g., 45 min" value="45 min" />
                </div>
              </div>

              <div class="form-group">
                <label>Meeting Purpose / Goal</label>
                <input #purposeInput type="text" placeholder="e.g., Agree on encryption standards and staging migration" />
              </div>

              <div class="form-group">
                <label>Verbatim Transcript or Meeting Notes</label>
                <textarea
                  #notesInput
                  rows="4"
                  placeholder="Paste dialogue transcript or key meeting notes here. The AI engine will extract decisions, assign action items, and detect conflicts..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="showNewModal.set(false)">Cancel</button>
              <button
                class="btn-save"
                (click)="submitNewMeeting(titleInput.value, deptSelect.value, durationInput.value, purposeInput.value, notesInput.value)"
              >
                Run AI Intelligence Pipeline
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .meetings-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
    }

    .eyebrow {
      color: #6366f1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 28px;
      font-weight: 750;
      letter-spacing: -0.5px;
    }

    .page-header p {
      margin: 7px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .primary-button {
      border: 0;
      border-radius: 8px;
      padding: 10px 18px;
      background: #4f46e5;
      color: white;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .primary-button:hover {
      background: #4338ca;
    }

    /* METRICS BAR */
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }

    .metric-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 14px 18px;
    }

    .metric-box span {
      display: block;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-box strong {
      display: block;
      font-size: 22px;
      color: #1e293b;
      margin-top: 4px;
      font-weight: 800;
    }

    .text-success { color: #059669 !important; }
    .text-warning { color: #ea580c !important; }
    .text-primary { color: #4f46e5 !important; }

    /* TOOLBAR */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tabs {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .tabs button {
      border: 0;
      border-radius: 6px;
      padding: 7px 12px;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tabs button.active {
      background: white;
      color: #334155;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      font-weight: 600;
    }

    .tabs span {
      background: #e2e8f0;
      color: #64748b;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 999px;
    }

    .tabs button.active span {
      background: #eef2ff;
      color: #4f46e5;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #94a3b8;
      width: 280px;
    }

    .search-box input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 12px;
      color: #1e293b;
    }

    .select-wrapper select {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #475569;
      font-size: 12px;
      outline: 0;
    }

    /* LIST */
    .meeting-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meeting-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .meeting-card:hover {
      border-color: #c7d2fe;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
      transform: translateY(-1px);
    }

    .meeting-main {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      min-width: 0;
      flex: 1;
    }

    .meeting-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 18px;
    }

    .proc-icon {
      background: #eff6ff;
      color: #2563eb;
      animation: spin 3s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .meeting-info {
      min-width: 0;
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    h2 {
      margin: 0;
      color: #1e293b;
      font-size: 14px;
      font-weight: 700;
    }

    .dept-badge {
      background: #f1f5f9;
      color: #475569;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
    }

    .status i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .status.analyzed {
      background: #ecfdf5;
      color: #059669;
    }

    .status.processing {
      background: #eff6ff;
      color: #2563eb;
    }

    .status.pending {
      background: #f8fafc;
      color: #64748b;
    }

    .metadata {
      display: flex;
      gap: 7px;
      margin-top: 6px;
      color: #94a3b8;
      font-size: 11px;
    }

    .meeting-summary-preview {
      margin: 6px 0 0;
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .attendees {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }

    .avatar {
      width: 24px;
      height: 24px;
      margin-right: -4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      border-radius: 50%;
      color: white;
      font-size: 8px;
      font-weight: 700;
    }

    .attendee-count {
      margin-left: 10px;
      color: #94a3b8;
      font-size: 11px;
    }

    .meeting-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-shrink: 0;
    }

    .stat {
      min-width: 50px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: center;
    }

    .stat strong {
      color: #334155;
      font-size: 14px;
      font-weight: 700;
    }

    .stat span {
      color: #94a3b8;
      font-size: 9px;
    }

    .stat.confidence strong {
      color: #059669;
    }

    .arrow {
      color: #cbd5e1;
      font-size: 18px;
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
      font-size: 32px;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    .empty-state h2 {
      margin: 0 0 6px;
      color: #1e293b;
      font-size: 16px;
    }

    .empty-state p {
      margin: 0 0 16px;
      color: #64748b;
      font-size: 13px;
    }

    .reset-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: white;
      font-size: 12px;
      font-weight: 600;
      color: #4f46e5;
      cursor: pointer;
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-window {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 18px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
    }

    .modal-header p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
    }

    .close-btn {
      border: 0;
      background: transparent;
      font-size: 22px;
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
      padding: 8px 18px;
      border: 0;
      background: #4f46e5;
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .metrics-bar {
        grid-template-columns: repeat(2, 1fr);
      }
      .meeting-stats {
        display: none;
      }
    }

    @media (max-width: 650px) {
      .metrics-bar {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column;
        gap: 12px;
      }
      .search-box {
        width: 100%;
      }
    }
  `]
})
export class MeetingListComponent {
  readonly store = inject(StoreService);

  readonly filter = signal<'all' | 'analyzed' | 'processing'>('all');
  readonly departmentFilter = signal<string>('all');
  readonly sortBy = signal<string>('newest');
  readonly searchTerm = signal<string>('');
  readonly showNewModal = signal(false);

  readonly analyzedCount = computed(() =>
    this.store.meetings().filter(m => m.status === 'Analyzed').length
  );

  readonly processingCount = computed(() =>
    this.store.meetings().filter(m => m.status === 'Processing').length
  );

  readonly totalActionsExtracted = computed(() =>
    this.store.meetings().reduce((acc, m) => acc + m.actionCount, 0)
  );

  readonly filteredMeetings = computed(() => {
    let list = this.store.meetings();

    // Status filter
    if (this.filter() === 'analyzed') {
      list = list.filter(m => m.status === 'Analyzed');
    } else if (this.filter() === 'processing') {
      list = list.filter(m => m.status === 'Processing');
    }

    // Department filter
    if (this.departmentFilter() !== 'all') {
      list = list.filter(m => m.department.toLowerCase() === this.departmentFilter().toLowerCase());
    }

    // Search query
    const q = this.searchTerm().toLowerCase().trim();
    if (q) {
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      );
    }

    // Sort
    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      if (sort === 'actions') return b.actionCount - a.actionCount;
      if (sort === 'decisions') return b.decisionCount - a.decisionCount;
      if (sort === 'confidence') return b.confidence - a.confidence;
      return 0; // default order is newest
    });
  });

  onSearch(e: Event): void {
    this.searchTerm.set((e.target as HTMLInputElement).value);
  }

  resetFilters(): void {
    this.filter.set('all');
    this.departmentFilter.set('all');
    this.searchTerm.set('');
    this.sortBy.set('newest');
  }

  submitNewMeeting(title: string, dept: string, duration: string, purpose: string, notes: string): void {
    if (!title.trim()) return;

    const newMeeting = this.store.createMeeting({
      title: title.trim(),
      department: dept || 'Engineering',
      duration: duration || '30 min',
      purpose: purpose.trim() || 'General alignment',
      summary: notes.trim()
        ? `Dialogue analysis synthesized: key points include alignment on ${title.trim()} deliverables.`
        : 'Automated intelligence pipeline processed meeting audio and extracted core decisions and commitments.',
      actionCount: 3,
      decisionCount: 1,
      confidence: 95,
      keyTopics: [title.trim(), `${dept} Strategy`, 'Next Steps'],
      insights: [
        {
          id: `in-${Date.now()}`,
          category: 'strategic',
          title: `Roadmap Alignment on ${title.trim()}`,
          description: 'Key stakeholders achieved consensus on architecture and target timeline.',
          impact: 'high',
          confidence: 96
        }
      ]
    });

    this.showNewModal.set(false);
  }
}