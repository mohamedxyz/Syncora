import { Component } from '@angular/core';

type ActionStatus = 'Open' | 'In Progress' | 'Completed';
type ActionPriority = 'High' | 'Medium' | 'Low';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  owner: string;
  ownerInitials: string;
  meeting: string;
  meetingId: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  confidence: number;
  createdAt: string;
}

@Component({
  selector: 'app-action-workspace',
  standalone: true,
  template: `
    <div class="actions-page">

      <!-- HEADER -->

      <section class="page-header">

        <div>
          <div class="eyebrow">WORKSPACE</div>

          <h1>Actions</h1>

          <p>
            Track commitments extracted from your meetings.
          </p>
        </div>

        <button class="primary-button" (click)="createAction()">
          + New Action
        </button>

      </section>


      <!-- SUMMARY -->

      <section class="summary-grid">

        <div class="summary-card">
          <div class="summary-icon purple">✓</div>

          <div>
            <span>Total Actions</span>
            <strong>{{ actions.length }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon blue">◷</div>

          <div>
            <span>Open</span>
            <strong>{{ openCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon orange">!</div>

          <div>
            <span>Due Soon</span>
            <strong>{{ dueSoonCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon green">✓</div>

          <div>
            <span>Completed</span>
            <strong>{{ completedCount }}</strong>
          </div>
        </div>

      </section>


      <!-- TOOLBAR -->

      <section class="toolbar">

        <div class="tabs">

          <button
            [class.active]="filter === 'all'"
            (click)="setFilter('all')"
          >
            All
            <span>{{ actions.length }}</span>
          </button>

          <button
            [class.active]="filter === 'open'"
            (click)="setFilter('open')"
          >
            Open
            <span>{{ openCount }}</span>
          </button>

          <button
            [class.active]="filter === 'due'"
            (click)="setFilter('due')"
          >
            Due Soon
            <span>{{ dueSoonCount }}</span>
          </button>

          <button
            [class.active]="filter === 'completed'"
            (click)="setFilter('completed')"
          >
            Completed
            <span>{{ completedCount }}</span>
          </button>

        </div>


        <div class="toolbar-actions">

          <div class="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search actions..."
              [(value)]="searchTerm"
              (input)="onSearch($event)"
            />
          </div>

          <button class="filter-button">
            ≡ Filter
          </button>

          <button class="filter-button">
            ↕ Sort
          </button>

        </div>

      </section>


      <!-- CONTENT -->

      <div class="content-layout">

        <!-- ACTION LIST -->

        <section class="action-list">

          @if (filteredActions.length === 0) {

            <div class="empty-state">
              <div class="empty-icon">✓</div>

              <h2>No actions found</h2>

              <p>
                Try changing your filter or search term.
              </p>
            </div>

          } @else {

            @for (
              action of filteredActions;
              track action.id
            ) {

              <article
                class="action-card"
                [class.selected]="selectedAction?.id === action.id"
                (click)="selectAction(action)"
              >

                <div
                  class="checkbox"
                  [class.checked]="action.status === 'Completed'"
                  (click)="toggleComplete(action, $event)"
                >
                  @if (action.status === 'Completed') {
                    ✓
                  }
                </div>


                <div class="action-body">

                  <div class="action-title-row">

                    <h2
                      [class.completed-title]="
                        action.status === 'Completed'
                      "
                    >
                      {{ action.title }}
                    </h2>

                    <span
                      class="priority"
                      [class.high]="action.priority === 'High'"
                      [class.medium]="action.priority === 'Medium'"
                      [class.low]="action.priority === 'Low'"
                    >
                      {{ action.priority }}
                    </span>

                  </div>


                  <p class="description">
                    {{ action.description }}
                  </p>


                  <div class="action-meta">

                    <span class="owner">
                      <span class="mini-avatar">
                        {{ action.ownerInitials }}
                      </span>

                      {{ action.owner }}
                    </span>

                    <span>·</span>

                    <span>
                      {{ action.meeting }}
                    </span>

                    <span>·</span>

                    <span
                      class="due"
                      [class.overdue]="isOverdue(action)"
                    >
                      {{ action.dueDate }}
                    </span>

                  </div>

                </div>


                <div class="action-right">

                  <span
                    class="status"
                    [class.open]="action.status === 'Open'"
                    [class.progress]="action.status === 'In Progress'"
                    [class.completed]="action.status === 'Completed'"
                  >
                    {{ action.status }}
                  </span>

                  <span class="confidence">
                    {{ action.confidence }}%
                  </span>

                  <span class="arrow">→</span>

                </div>

              </article>

            }

          }

        </section>


        <!-- DETAIL PANEL -->

        @if (selectedAction) {

          <aside class="detail-panel">

            <div class="detail-header">

              <div>
                <span class="detail-label">
                  ACTION DETAIL
                </span>

                <h2>Action</h2>
              </div>

              <button
                class="close-button"
                (click)="clearSelection()"
              >
                ×
              </button>

            </div>


            <div class="detail-content">

              <span
                class="priority"
                [class.high]="selectedAction.priority === 'High'"
                [class.medium]="selectedAction.priority === 'Medium'"
                [class.low]="selectedAction.priority === 'Low'"
              >
                {{ selectedAction.priority }} Priority
              </span>


              <h3>
                {{ selectedAction.title }}
              </h3>


              <p class="detail-description">
                {{ selectedAction.description }}
              </p>


              <div class="detail-section">

                <span class="section-label">
                  STATUS
                </span>

                <div class="status-control">

                  <button
                    [class.active]="
                      selectedAction.status === 'Open'
                    "
                    (click)="changeStatus('Open')"
                  >
                    Open
                  </button>

                  <button
                    [class.active]="
                      selectedAction.status === 'In Progress'
                    "
                    (click)="changeStatus('In Progress')"
                  >
                    In Progress
                  </button>

                  <button
                    [class.active]="
                      selectedAction.status === 'Completed'
                    "
                    (click)="changeStatus('Completed')"
                  >
                    Completed
                  </button>

                </div>

              </div>


              <div class="detail-section">

                <span class="section-label">
                  OWNER
                </span>

                <div class="detail-person">

                  <div class="large-avatar">
                    {{ selectedAction.ownerInitials }}
                  </div>

                  <div>
                    <strong>
                      {{ selectedAction.owner }}
                    </strong>

                    <span>
                      Action owner
                    </span>
                  </div>

                </div>

              </div>


              <div class="detail-section">

                <span class="section-label">
                  DEADLINE
                </span>

                <div class="deadline">
                  <span class="calendar-icon">□</span>

                  <div>
                    <strong>
                      {{ selectedAction.dueDate }}
                    </strong>

                    <span
                      [class.red]="isOverdue(selectedAction)"
                    >
                      {{ deadlineText(selectedAction) }}
                    </span>
                  </div>
                </div>

              </div>


              <div class="detail-section">

                <span class="section-label">
                  SOURCE MEETING
                </span>

                <div class="source-meeting">

                  <div class="source-icon">
                    ◫
                  </div>

                  <div>
                    <strong>
                      {{ selectedAction.meeting }}
                    </strong>

                    <span>
                      Meeting analysis
                    </span>
                  </div>

                  <span class="source-arrow">
                    →
                  </span>

                </div>

              </div>


              <div class="detail-section">

                <span class="section-label">
                  AI CONFIDENCE
                </span>

                <div class="confidence-bar">

                  <div class="bar-background">
                    <div
                      class="bar-fill"
                      [style.width.%]="selectedAction.confidence"
                    ></div>
                  </div>

                  <strong>
                    {{ selectedAction.confidence }}%
                  </strong>

                </div>

                <p class="confidence-help">
                  Confidence that this commitment was correctly
                  identified from the meeting.
                </p>

              </div>

            </div>


            <div class="detail-footer">

              <button class="secondary-button">
                Edit Action
              </button>

              <button
                class="complete-button"
                (click)="completeSelected()"
              >
                {{
                  selectedAction.status === 'Completed'
                    ? 'Reopen Action'
                    : 'Mark Complete'
                }}
              </button>

            </div>

          </aside>

        }

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .actions-page {
      max-width: 1450px;
      margin: 0 auto;
    }

    /* HEADER */

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .eyebrow {
      margin-bottom: 7px;
      color: #6366f1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.4px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 28px;
      letter-spacing: -.5px;
    }

    .page-header p {
      margin: 7px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .primary-button {
      padding: 10px 16px;
      border: 0;
      border-radius: 8px;
      background: #4f46e5;
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary-button:hover {
      background: #4338ca;
    }

    /* SUMMARY */

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .summary-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      font-size: 14px;
      font-weight: 700;
    }

    .summary-icon.purple {
      background: #eef2ff;
      color: #4f46e5;
    }

    .summary-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .summary-icon.orange {
      background: #fff7ed;
      color: #ea580c;
    }

    .summary-icon.green {
      background: #ecfdf5;
      color: #059669;
    }

    .summary-card span,
    .summary-card strong {
      display: block;
    }

    .summary-card span {
      color: #94a3b8;
      font-size: 10px;
    }

    .summary-card strong {
      margin-top: 4px;
      color: #1e293b;
      font-size: 19px;
    }

    /* TOOLBAR */

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      padding: 4px;
      border-radius: 8px;
      background: #f1f5f9;
    }

    .tabs button {
      border: 0;
      border-radius: 6px;
      padding: 8px 11px;
      background: transparent;
      color: #64748b;
      font-size: 11px;
      cursor: pointer;
    }

    .tabs button.active {
      background: white;
      color: #334155;
      font-weight: 600;
      box-shadow: 0 1px 3px #0000000c;
    }

    .tabs span {
      margin-left: 4px;
      color: #94a3b8;
    }

    .toolbar-actions {
      display: flex;
      gap: 7px;
    }

    .search-box {
      width: 210px;
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      border: 0;
      outline: 0;
      color: #334155;
      font-size: 11px;
    }

    .search-box input::placeholder {
      color: #94a3b8;
    }

    .filter-button {
      padding: 8px 11px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #64748b;
      font-size: 11px;
      cursor: pointer;
    }

    /* CONTENT */

    .content-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .content-layout:has(.detail-panel) {
      grid-template-columns: minmax(0, 1fr) 370px;
    }

    .action-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 13px;
      min-height: 88px;
      padding: 15px 17px;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      transition: .15s ease;
    }

    .action-card:hover,
    .action-card.selected {
      border-color: #c7d2fe;
      box-shadow: 0 3px 12px #4f46e510;
    }

    .checkbox {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: 1.5px solid #cbd5e1;
      border-radius: 5px;
      color: white;
      font-size: 10px;
      cursor: pointer;
    }

    .checkbox.checked {
      border-color: #10b981;
      background: #10b981;
    }

    .action-body {
      min-width: 0;
      flex: 1;
    }

    .action-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-title-row h2 {
      margin: 0;
      color: #334155;
      font-size: 12px;
      font-weight: 650;
    }

    .completed-title {
      color: #94a3b8 !important;
      text-decoration: line-through;
    }

    .description {
      margin: 5px 0 8px;
      overflow: hidden;
      color: #64748b;
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
      font-size: 9px;
    }

    .owner {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .mini-avatar {
      width: 19px;
      height: 19px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 7px;
      font-weight: 700;
    }

    .due.overdue {
      color: #dc2626;
      font-weight: 600;
    }

    /* BADGES */

    .priority,
    .status {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 4px 7px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 700;
      white-space: nowrap;
    }

    .priority.high {
      background: #fef2f2;
      color: #dc2626;
    }

    .priority.medium {
      background: #fff7ed;
      color: #ea580c;
    }

    .priority.low {
      background: #f1f5f9;
      color: #64748b;
    }

    .status.open {
      background: #eff6ff;
      color: #2563eb;
    }

    .status.progress {
      background: #fff7ed;
      color: #ea580c;
    }

    .status.completed {
      background: #ecfdf5;
      color: #059669;
    }

    .action-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .confidence {
      color: #059669;
      font-size: 9px;
      font-weight: 700;
    }

    .arrow {
      color: #94a3b8;
      font-size: 17px;
    }

    /* DETAIL */

    .detail-panel {
      position: sticky;
      top: 20px;
      align-self: start;
      overflow: hidden;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
    }

    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 19px;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-label {
      color: #6366f1;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.2px;
    }

    .detail-header h2 {
      margin: 5px 0 0;
      color: #1e293b;
      font-size: 15px;
    }

    .close-button {
      border: 0;
      background: transparent;
      color: #94a3b8;
      font-size: 22px;
      cursor: pointer;
    }

    .detail-content {
      padding: 20px;
    }

    .detail-content h3 {
      margin: 14px 0 8px;
      color: #1e293b;
      font-size: 16px;
      line-height: 1.4;
    }

    .detail-description {
      margin: 0 0 23px;
      color: #64748b;
      font-size: 11px;
      line-height: 1.7;
    }

    .detail-section {
      padding: 17px 0;
      border-top: 1px solid #f1f5f9;
    }

    .section-label {
      display: block;
      margin-bottom: 10px;
      color: #94a3b8;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .status-control {
      display: flex;
      gap: 4px;
      padding: 3px;
      background: #f8fafc;
      border-radius: 7px;
    }

    .status-control button {
      flex: 1;
      padding: 7px 4px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: #64748b;
      font-size: 9px;
      cursor: pointer;
    }

    .status-control button.active {
      background: white;
      color: #4f46e5;
      font-weight: 700;
      box-shadow: 0 1px 3px #0000000b;
    }

    .detail-person,
    .deadline,
    .source-meeting {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .large-avatar {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 9px;
      font-weight: 700;
    }

    .detail-person strong,
    .detail-person span,
    .deadline strong,
    .deadline span,
    .source-meeting strong,
    .source-meeting span {
      display: block;
    }

    .detail-person strong,
    .deadline strong,
    .source-meeting strong {
      color: #334155;
      font-size: 10px;
    }

    .detail-person span,
    .deadline span,
    .source-meeting span {
      margin-top: 3px;
      color: #94a3b8;
      font-size: 9px;
    }

    .calendar-icon {
      width: 31px;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      background: #eff6ff;
      color: #2563eb;
    }

    .deadline .red {
      color: #dc2626;
    }

    .source-icon {
      width: 31px;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      background: #eef2ff;
      color: #4f46e5;
    }

    .source-arrow {
      margin-left: auto;
      color: #94a3b8 !important;
      font-size: 14px !important;
    }

    .confidence-bar {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .bar-background {
      flex: 1;
      height: 6px;
      overflow: hidden;
      border-radius: 999px;
      background: #e2e8f0;
    }

    .bar-fill {
      height: 100%;
      border-radius: inherit;
      background: #10b981;
    }

    .confidence-bar strong {
      color: #059669;
      font-size: 10px;
    }

    .confidence-help {
      margin: 8px 0 0;
      color: #94a3b8;
      font-size: 9px;
      line-height: 1.5;
    }

    .detail-footer {
      display: flex;
      gap: 7px;
      padding: 14px 19px;
      border-top: 1px solid #f1f5f9;
    }

    .secondary-button,
    .complete-button {
      flex: 1;
      padding: 9px;
      border-radius: 7px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    .secondary-button {
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
    }

    .complete-button {
      border: 0;
      background: #4f46e5;
      color: white;
    }

    /* EMPTY */

    .empty-state {
      padding: 70px 20px;
      text-align: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .empty-icon {
      width: 42px;
      height: 42px;
      margin: 0 auto 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #ecfdf5;
      color: #059669;
    }

    .empty-state h2 {
      margin: 0;
      color: #334155;
      font-size: 14px;
    }

    .empty-state p {
      color: #94a3b8;
      font-size: 10px;
    }

    @media (max-width: 1000px) {
      .content-layout:has(.detail-panel) {
        grid-template-columns: 1fr;
      }

      .detail-panel {
        position: static;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 700px) {
      .page-header,
      .toolbar {
        display: block;
      }

      .toolbar-actions {
        margin-top: 10px;
      }

      .search-box {
        flex: 1;
      }

      .action-right {
        display: none;
      }

      .summary-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class ActionWorkspaceComponent {

  filter: 'all' | 'open' | 'due' | 'completed' = 'all';

  searchTerm = '';

  selectedAction: ActionItem | null = null;

  actions: ActionItem[] = [
    {
      id: 'action-001',
      title: 'Prepare OAuth2 implementation plan',
      description:
        'Create the implementation plan for OAuth2 authentication and short-lived access tokens.',
      owner: 'Sarah Miller',
      ownerInitials: 'SM',
      meeting: 'Weekly Engineering Sync',
      meetingId: 'weekly-engineering',
      dueDate: 'Mar 18, 2026',
      priority: 'High',
      status: 'Open',
      confidence: 97,
      createdAt: 'Mar 14, 2026'
    },

    {
      id: 'action-002',
      title: 'Schedule security review',
      description:
        'Coordinate a security review before the authentication implementation reaches production.',
      owner: 'David Chen',
      ownerInitials: 'DC',
      meeting: 'Architecture Review',
      meetingId: 'architecture-review',
      dueDate: 'Mar 19, 2026',
      priority: 'Medium',
      status: 'In Progress',
      confidence: 94,
      createdAt: 'Mar 13, 2026'
    },

    {
      id: 'action-003',
      title: 'Update migration documentation',
      description:
        'Update the database migration documentation to reflect the revised staging timeline.',
      owner: 'James Wilson',
      ownerInitials: 'JW',
      meeting: 'Weekly Engineering Sync',
      meetingId: 'weekly-engineering',
      dueDate: 'Mar 21, 2026',
      priority: 'Low',
      status: 'Open',
      confidence: 91,
      createdAt: 'Mar 14, 2026'
    },

    {
      id: 'action-004',
      title: 'Review API error handling',
      description:
        'Review the current API error handling strategy and document the recommended changes.',
      owner: 'Michael Lee',
      ownerInitials: 'ML',
      meeting: 'Product Planning — Q2',
      meetingId: 'product-planning',
      dueDate: 'Mar 17, 2026',
      priority: 'High',
      status: 'Open',
      confidence: 88,
      createdAt: 'Mar 13, 2026'
    },

    {
      id: 'action-005',
      title: 'Create authentication test cases',
      description:
        'Create automated test cases covering OAuth2 login, refresh and token expiration.',
      owner: 'Sarah Miller',
      ownerInitials: 'SM',
      meeting: 'Architecture Review',
      meetingId: 'architecture-review',
      dueDate: 'Mar 22, 2026',
      priority: 'Medium',
      status: 'Open',
      confidence: 95,
      createdAt: 'Mar 13, 2026'
    },

    {
      id: 'action-006',
      title: 'Send Q2 roadmap to leadership',
      description:
        'Share the updated Q2 engineering roadmap with the leadership team.',
      owner: 'Ahmed Hassan',
      ownerInitials: 'AH',
      meeting: 'Product Planning — Q2',
      meetingId: 'product-planning',
      dueDate: 'Mar 15, 2026',
      priority: 'Medium',
      status: 'Completed',
      confidence: 99,
      createdAt: 'Mar 13, 2026'
    },

    {
      id: 'action-007',
      title: 'Prepare staging environment',
      description:
        'Prepare the staging environment for the upcoming database migration.',
      owner: 'James Wilson',
      ownerInitials: 'JW',
      meeting: 'Weekly Engineering Sync',
      meetingId: 'weekly-engineering',
      dueDate: 'Mar 16, 2026',
      priority: 'High',
      status: 'Completed',
      confidence: 96,
      createdAt: 'Mar 14, 2026'
    },

    {
      id: 'action-008',
      title: 'Review frontend authentication flow',
      description:
        'Validate the frontend authentication flow against the new API authentication strategy.',
      owner: 'Michael Lee',
      ownerInitials: 'ML',
      meeting: 'Design & Engineering Sync',
      meetingId: 'design-sync',
      dueDate: 'Mar 24, 2026',
      priority: 'Low',
      status: 'Open',
      confidence: 86,
      createdAt: 'Mar 12, 2026'
    }
  ];


  get filteredActions(): ActionItem[] {

    let result = this.actions;

    if (this.filter === 'open') {
      result = result.filter(
        action =>
          action.status === 'Open' ||
          action.status === 'In Progress'
      );
    }

    if (this.filter === 'due') {
      result = result.filter(
        action =>
          action.status !== 'Completed' &&
          this.isDueSoon(action)
      );
    }

    if (this.filter === 'completed') {
      result = result.filter(
        action => action.status === 'Completed'
      );
    }

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();

      result = result.filter(action =>
        action.title.toLowerCase().includes(search) ||
        action.description.toLowerCase().includes(search) ||
        action.owner.toLowerCase().includes(search) ||
        action.meeting.toLowerCase().includes(search)
      );
    }

    return result;
  }


  get openCount(): number {
    return this.actions.filter(
      action =>
        action.status === 'Open' ||
        action.status === 'In Progress'
    ).length;
  }


  get completedCount(): number {
    return this.actions.filter(
      action => action.status === 'Completed'
    ).length;
  }


  get dueSoonCount(): number {
    return this.actions.filter(
      action =>
        action.status !== 'Completed' &&
        this.isDueSoon(action)
    ).length;
  }


  setFilter(
    filter: 'all' | 'open' | 'due' | 'completed'
  ): void {
    this.filter = filter;
  }


  selectAction(action: ActionItem): void {
    this.selectedAction = action;
  }


  clearSelection(): void {
    this.selectedAction = null;
  }


  toggleComplete(
    action: ActionItem,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    action.status =
      action.status === 'Completed'
        ? 'Open'
        : 'Completed';

    if (this.selectedAction?.id === action.id) {
      this.selectedAction = action;
    }
  }


  changeStatus(status: ActionStatus): void {

    if (!this.selectedAction) {
      return;
    }

    this.selectedAction.status = status;
  }


  completeSelected(): void {

    if (!this.selectedAction) {
      return;
    }

    this.selectedAction.status =
      this.selectedAction.status === 'Completed'
        ? 'Open'
        : 'Completed';
  }


  createAction(): void {

    const newAction: ActionItem = {
      id: `action-${Date.now()}`,
      title: 'New action',
      description: 'Add the action description.',
      owner: 'Ahmed Hassan',
      ownerInitials: 'AH',
      meeting: 'Manually created',
      meetingId: '',
      dueDate: 'No deadline',
      priority: 'Medium',
      status: 'Open',
      confidence: 100,
      createdAt: 'Just now'
    };

    this.actions = [
      newAction,
      ...this.actions
    ];

    this.selectedAction = newAction;
  }


  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }


  isDueSoon(action: ActionItem): boolean {

    if (action.dueDate === 'No deadline') {
      return false;
    }

    const due = new Date(action.dueDate);
    const today = new Date();

    const difference =
      due.getTime() - today.getTime();

    const days =
      difference / (1000 * 60 * 60 * 24);

    return days <= 3;
  }


  isOverdue(action: ActionItem): boolean {

    if (action.dueDate === 'No deadline') {
      return false;
    }

    const due = new Date(action.dueDate);
    const today = new Date();

    return (
      due.getTime() < today.getTime() &&
      action.status !== 'Completed'
    );
  }


  deadlineText(action: ActionItem): string {

    if (action.dueDate === 'No deadline') {
      return 'No deadline';
    }

    if (this.isOverdue(action)) {
      return 'Overdue';
    }

    if (this.isDueSoon(action)) {
      return 'Due soon';
    }

    return 'Upcoming';
  }
}