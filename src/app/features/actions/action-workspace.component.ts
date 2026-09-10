import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { Action, ActionStatus, Priority } from '../../core/models/actionsync.model';

export interface ActionItemView {
  id: string;
  title: string;
  description: string;
  owner: string;
  ownerId: string;
  ownerInitials: string;
  ownerColor: string;
  meeting: string;
  meetingId: string;
  dueDate: string;
  priority: string;
  status: string;
  confidence: number;
  createdAt: string;
  raw: Action;
}

@Component({
  selector: 'app-action-workspace',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="actions-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">WORKSPACE</div>
          <h1>Actions & Commitments</h1>
          <p>
            Track, assign, and reconcile action items extracted directly from meeting dialogues.
          </p>
        </div>

        <button class="primary-button" (click)="openCreateModal()">
          + New Action
        </button>
      </section>

      <!-- SUMMARY COUNTERS -->
      <section class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon purple">✓</div>
          <div>
            <span>Total Actions</span>
            <strong>{{ store.actions().length }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon blue">◷</div>
          <div>
            <span>My Tasks</span>
            <strong>{{ myTasksCount() }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon orange">!</div>
          <div>
            <span>Due Soon / Overdue</span>
            <strong>{{ store.dueSoonActions().length + store.overdueActions().length }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon green">✓</div>
          <div>
            <span>Completed</span>
            <strong>{{ store.completedActions().length }}</strong>
          </div>
        </div>
      </section>

      <!-- TOOLBAR -->
      <section class="toolbar">
        <div class="tabs">
          <button [class.active]="filter() === 'all'" (click)="filter.set('all')">
            All
            <span>{{ store.actions().length }}</span>
          </button>

          <button [class.active]="filter() === 'my'" (click)="filter.set('my')">
            My Tasks
            <span>{{ myTasksCount() }}</span>
          </button>

          <button [class.active]="filter() === 'open'" (click)="filter.set('open')">
            Open
            <span>{{ store.openActions().length }}</span>
          </button>

          <button [class.active]="filter() === 'due'" (click)="filter.set('due')">
            Due Soon
            <span>{{ store.dueSoonActions().length }}</span>
          </button>

          <button [class.active]="filter() === 'overdue'" (click)="filter.set('overdue')">
            Overdue
            <span>{{ store.overdueActions().length }}</span>
          </button>

          <button [class.active]="filter() === 'completed'" (click)="filter.set('completed')">
            Completed
            <span>{{ store.completedActions().length }}</span>
          </button>
        </div>

        <div class="toolbar-actions">
          <div class="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search actions, assignees, meetings..."
              [value]="searchTerm()"
              (input)="onSearch($event)"
            />
          </div>

          <div class="priority-select">
            <select [value]="priorityFilter()" (change)="priorityFilter.set($any($event.target).value)">
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </section>

      <!-- CONTENT LAYOUT (List + Detail Panel) -->
      <div class="content-layout">

        <!-- ACTION LIST -->
        <section class="action-list">
          @if (filteredActions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">✓</div>
              <h2>No actions found</h2>
              <p>Try adjusting your search criteria, priority filter, or view tab.</p>
            </div>
          } @else {
            @for (action of filteredActions(); track action.id) {
              <article
                class="action-card"
                [class.selected]="selectedAction()?.id === action.id"
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
                    <h2 [class.completed-title]="action.status === 'Completed'">
                      {{ action.title }}
                    </h2>

                    <span
                      class="priority"
                      [class.critical]="action.priority.toLowerCase() === 'critical'"
                      [class.high]="action.priority.toLowerCase() === 'high'"
                      [class.medium]="action.priority.toLowerCase() === 'medium'"
                      [class.low]="action.priority.toLowerCase() === 'low'"
                    >
                      {{ action.priority }}
                    </span>
                  </div>

                  <p class="description">
                    {{ action.description }}
                  </p>

                  <div class="action-meta">
                    <span class="owner">
                      <span class="mini-avatar" [style.background]="action.ownerColor">
                        {{ action.ownerInitials }}
                      </span>
                      {{ action.owner }}
                    </span>

                    <span>·</span>

                    <span class="meta-meeting">
                      ◫ {{ action.meeting }}
                    </span>

                    <span>·</span>

                    <span
                      class="due"
                      [class.overdue]="isOverdue(action)"
                    >
                      Due {{ action.dueDate }}
                    </span>
                  </div>
                </div>

                <div class="action-right">
                  <span
                    class="status-pill"
                    [class.open]="action.status === 'Open'"
                    [class.progress]="action.status === 'In Progress'"
                    [class.review]="action.status === 'Review'"
                    [class.completed]="action.status === 'Completed'"
                  >
                    {{ action.status }}
                  </span>

                  <span class="confidence">
                    {{ action.confidence }}% conf
                  </span>

                  <span class="arrow">→</span>
                </div>
              </article>
            }
          }
        </section>

        <!-- DETAIL PANEL -->
        @if (selectedAction()) {
          <aside class="detail-panel">
            <div class="detail-header">
              <div>
                <span class="detail-label">ACTION DETAIL</span>
                <h2>Commitment</h2>
              </div>
              <button class="close-button" (click)="selectedAction.set(null)">×</button>
            </div>

            <div class="detail-content">
              <span
                class="priority"
                [class.critical]="selectedAction()!.priority.toLowerCase() === 'critical'"
                [class.high]="selectedAction()!.priority.toLowerCase() === 'high'"
                [class.medium]="selectedAction()!.priority.toLowerCase() === 'medium'"
                [class.low]="selectedAction()!.priority.toLowerCase() === 'low'"
              >
                {{ selectedAction()!.priority }} Priority
              </span>

              <h3>{{ selectedAction()!.title }}</h3>
              <p class="detail-description">{{ selectedAction()!.description }}</p>

              <!-- STATUS CONTROL -->
              <div class="detail-section">
                <span class="section-label">STATUS</span>
                <div class="status-control">
                  <button
                    [class.active]="selectedAction()!.status === 'Open'"
                    (click)="changeStatus('backlog')"
                  >
                    Backlog
                  </button>
                  <button
                    [class.active]="selectedAction()!.status === 'In Progress'"
                    (click)="changeStatus('in-progress')"
                  >
                    In Progress
                  </button>
                  <button
                    [class.active]="selectedAction()!.status === 'Review'"
                    (click)="changeStatus('review')"
                  >
                    Review
                  </button>
                  <button
                    [class.active]="selectedAction()!.status === 'Completed'"
                    (click)="changeStatus('done')"
                  >
                    Done
                  </button>
                </div>
              </div>

              <!-- ASSIGNEE -->
              <div class="detail-section">
                <span class="section-label">ASSIGNEE</span>
                <div class="detail-person">
                  <div class="large-avatar" [style.background]="selectedAction()!.ownerColor">
                    {{ selectedAction()!.ownerInitials }}
                  </div>
                  <div>
                    <strong>{{ selectedAction()!.owner }}</strong>
                    <span>Responsible Contributor</span>
                  </div>
                </div>
              </div>

              <!-- DEADLINE -->
              <div class="detail-section">
                <span class="section-label">DEADLINE</span>
                <div class="deadline">
                  <span class="calendar-icon">📅</span>
                  <div>
                    <strong>{{ selectedAction()!.dueDate }}</strong>
                    <span [class.red]="isOverdue(selectedAction()!)">
                      {{ deadlineText(selectedAction()!) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- SOURCE MEETING -->
              <div class="detail-section">
                <span class="section-label">SOURCE MEETING</span>
                <a [routerLink]="['/meetings', selectedAction()!.meetingId]" class="source-meeting">
                  <div class="source-icon">◫</div>
                  <div>
                    <strong>{{ selectedAction()!.meeting }}</strong>
                    <span>Jump to meeting analysis</span>
                  </div>
                  <span class="source-arrow">→</span>
                </a>
              </div>

              <!-- AI CONFIDENCE -->
              <div class="detail-section">
                <span class="section-label">AI CONFIDENCE SCORE</span>
                <div class="confidence-bar">
                  <div class="bar-background">
                    <div
                      class="bar-fill"
                      [style.width.%]="selectedAction()!.confidence"
                    ></div>
                  </div>
                  <strong>{{ selectedAction()!.confidence }}%</strong>
                </div>
                <p class="confidence-help">
                  Confidence that this commitment and deadline were accurately identified from transcript context.
                </p>
              </div>
            </div>

            <div class="detail-footer">
              <button class="delete-button" (click)="deleteCurrentAction()">
                Delete
              </button>
              <button class="complete-button" (click)="toggleCompleteSelected()">
                {{ selectedAction()!.status === 'Completed' ? 'Reopen Action' : 'Mark Done' }}
              </button>
            </div>
          </aside>
        }

      </div>

      <!-- CREATE ACTION MODAL -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="showCreateModal.set(false)">
          <div class="modal-window" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>New Action Commitment</h2>
              <button class="close-button" (click)="showCreateModal.set(false)">×</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Action Title</label>
                <input #newTitle type="text" placeholder="e.g., Deliver OAuth2 token revocation endpoints" />
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea #newDesc rows="3" placeholder="Specify deliverables, criteria, and scope..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Assignee</label>
                  <select #newOwner>
                    @for (u of store.users(); track u.id) {
                      <option [value]="u.id">{{ u.name }} ({{ u.role }})</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label>Priority</label>
                  <select #newPri>
                    <option value="critical">Critical</option>
                    <option value="high" selected>High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Due Date</label>
                  <input #newDue type="text" placeholder="e.g., Mar 25, 2026" value="Mar 25, 2026" />
                </div>

                <div class="form-group">
                  <label>Source Meeting</label>
                  <select #newMeeting>
                    @for (m of store.meetings(); track m.id) {
                      <option [value]="m.id">{{ m.title }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="showCreateModal.set(false)">Cancel</button>
              <button
                class="btn-save"
                (click)="saveNewAction(newTitle.value, newDesc.value, newOwner.value, newPri.value, newDue.value, newMeeting.value)"
              >
                Create Action Item
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

    .actions-page {
      max-width: 1450px;
      margin: 0 auto;
    }

    /* HEADER */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
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
      font-weight: 750;
      letter-spacing: -0.5px;
    }

    .page-header p {
      margin: 7px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .primary-button {
      padding: 10px 18px;
      border: 0;
      border-radius: 8px;
      background: #4f46e5;
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
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

    .summary-icon.purple { background: #eef2ff; color: #4f46e5; }
    .summary-icon.blue { background: #eff6ff; color: #2563eb; }
    .summary-icon.orange { background: #fff7ed; color: #ea580c; }
    .summary-icon.green { background: #ecfdf5; color: #059669; }

    .summary-card span {
      display: block;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .summary-card strong {
      display: block;
      margin-top: 4px;
      color: #1e293b;
      font-size: 20px;
      font-weight: 800;
    }

    /* TOOLBAR */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      gap: 12px;
      flex-wrap: wrap;
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
      font-weight: 650;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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

    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .search-box {
      width: 250px;
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
      font-size: 12px;
    }

    .priority-select select {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #475569;
      font-size: 12px;
      outline: 0;
    }

    /* CONTENT LAYOUT */
    .content-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .content-layout:has(.detail-panel) {
      grid-template-columns: minmax(0, 1fr) 390px;
    }

    .action-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      min-height: 84px;
      padding: 15px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-card:hover, .action-card.selected {
      border-color: #c7d2fe;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.07);
    }

    .checkbox {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #cbd5e1;
      border-radius: 5px;
      color: white;
      font-size: 11px;
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
      color: #1e293b;
      font-size: 13px;
      font-weight: 700;
    }

    .completed-title {
      color: #94a3b8 !important;
      text-decoration: line-through;
    }

    .priority {
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority.critical { background: #fee2e2; color: #dc2626; }
    .priority.high { background: #fff7ed; color: #ea580c; }
    .priority.medium { background: #f1f5f9; color: #475569; }
    .priority.low { background: #f8fafc; color: #94a3b8; }

    .description {
      margin: 4px 0 6px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .action-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: #94a3b8;
      flex-wrap: wrap;
    }

    .owner {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #334155;
      font-weight: 500;
    }

    .mini-avatar {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      color: white;
      font-size: 7px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .due.overdue {
      color: #dc2626;
      font-weight: 700;
    }

    .action-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .status-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .status-pill.open { background: #f8fafc; color: #64748b; }
    .status-pill.progress { background: #eff6ff; color: #2563eb; }
    .status-pill.review { background: #fff7ed; color: #ea580c; }
    .status-pill.completed { background: #ecfdf5; color: #059669; }

    .confidence {
      font-size: 10px;
      color: #94a3b8;
    }

    .arrow {
      color: #cbd5e1;
      font-size: 16px;
    }

    /* DETAIL PANEL */
    .detail-panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 88px;
      height: fit-content;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #6366f1;
    }

    .detail-header h2 {
      margin: 2px 0 0;
      font-size: 16px;
      color: #0f172a;
    }

    .close-button {
      border: 0;
      background: transparent;
      font-size: 22px;
      color: #94a3b8;
      cursor: pointer;
    }

    .detail-content h3 {
      margin: 10px 0 6px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .detail-description {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 18px;
    }

    .detail-section {
      margin-bottom: 16px;
    }

    .section-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    .status-control {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 8px;
    }

    .status-control button {
      border: 0;
      border-radius: 6px;
      padding: 6px 4px;
      background: transparent;
      color: #64748b;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    .status-control button.active {
      background: white;
      color: #4f46e5;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .detail-person {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .large-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-person strong {
      display: block;
      font-size: 12px;
      color: #0f172a;
    }

    .detail-person span {
      font-size: 10px;
      color: #94a3b8;
    }

    .deadline {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .deadline strong {
      color: #1e293b;
    }

    .deadline span.red {
      color: #dc2626;
      font-weight: 700;
      margin-left: 6px;
    }

    .source-meeting {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
    }

    .source-meeting:hover {
      border-color: #c7d2fe;
    }

    .source-icon {
      color: #4f46e5;
      font-size: 14px;
    }

    .source-meeting strong {
      display: block;
      font-size: 11px;
      color: #0f172a;
    }

    .source-meeting span {
      font-size: 10px;
      color: #94a3b8;
    }

    .source-arrow {
      margin-left: auto;
      color: #4f46e5;
    }

    .confidence-bar {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bar-background {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #059669;
      border-radius: 999px;
    }

    .confidence-help {
      margin: 6px 0 0;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.4;
    }

    .detail-footer {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
      margin-top: 14px;
    }

    .delete-button {
      padding: 8px 14px;
      border: 1px solid #fecaca;
      border-radius: 7px;
      background: white;
      color: #dc2626;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .complete-button {
      flex: 1;
      padding: 8px 16px;
      border: 0;
      border-radius: 7px;
      background: #4f46e5;
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
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
      color: #10b981;
      margin-bottom: 10px;
    }

    .empty-state h2 {
      margin: 0 0 4px;
      font-size: 15px;
      color: #1e293b;
    }

    .empty-state p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
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

    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
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

    @media (max-width: 900px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .content-layout:has(.detail-panel) {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
      .toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .search-box {
        width: 100%;
      }
    }
  `]
})
export class ActionWorkspaceComponent {
  readonly store = inject(StoreService);

  readonly filter = signal<'all' | 'my' | 'open' | 'due' | 'overdue' | 'completed'>('all');
  readonly priorityFilter = signal<string>('all');
  readonly searchTerm = signal<string>('');
  readonly selectedAction = signal<ActionItemView | null>(null);
  readonly showCreateModal = signal(false);

  readonly mappedActions = computed<ActionItemView[]>(() => {
    return this.store.actions().map(a => {
      let statusLabel = 'Open';
      if (a.status === 'in-progress') statusLabel = 'In Progress';
      else if (a.status === 'review') statusLabel = 'Review';
      else if (a.status === 'done') statusLabel = 'Completed';

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        owner: a.owner.name,
        ownerId: a.owner.id,
        ownerInitials: a.owner.initials,
        ownerColor: a.owner.color,
        meeting: a.meetingTitle,
        meetingId: a.meetingId,
        dueDate: a.dueDate,
        priority: a.priority.charAt(0).toUpperCase() + a.priority.slice(1),
        status: statusLabel,
        confidence: a.confidence || 95,
        createdAt: a.createdAt || 'Recent',
        raw: a
      };
    });
  });

  readonly myTasksCount = computed(() => {
    const curUser = this.store.currentUser();
    return this.mappedActions().filter(a => a.ownerId === curUser.id).length;
  });

  readonly filteredActions = computed(() => {
    let list = this.mappedActions();
    const curUserId = this.store.currentUser().id;

    // View filter
    const f = this.filter();
    if (f === 'my') {
      list = list.filter(a => a.ownerId === curUserId);
    } else if (f === 'open') {
      list = list.filter(a => a.status !== 'Completed');
    } else if (f === 'due') {
      list = list.filter(a => a.status !== 'Completed' && this.isDueSoon(a));
    } else if (f === 'overdue') {
      list = list.filter(a => this.isOverdue(a));
    } else if (f === 'completed') {
      list = list.filter(a => a.status === 'Completed');
    }

    // Priority filter
    const pri = this.priorityFilter();
    if (pri !== 'all') {
      list = list.filter(a => a.priority.toLowerCase() === pri.toLowerCase());
    }

    // Search query
    const q = this.searchTerm().toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.meeting.toLowerCase().includes(q)
      );
    }

    return list;
  });

  onSearch(e: Event): void {
    this.searchTerm.set((e.target as HTMLInputElement).value);
  }

  selectAction(action: ActionItemView): void {
    this.selectedAction.set(action);
  }

  toggleComplete(action: ActionItemView, e: MouseEvent): void {
    e.stopPropagation();
    const newStatus: ActionStatus = action.status === 'Completed' ? 'in-progress' : 'done';
    this.store.updateActionStatus(action.id, newStatus);

    if (this.selectedAction()?.id === action.id) {
      const updated = this.mappedActions().find(a => a.id === action.id);
      this.selectedAction.set(updated || null);
    }
  }

  toggleCompleteSelected(): void {
    const sel = this.selectedAction();
    if (!sel) return;
    const newStatus: ActionStatus = sel.status === 'Completed' ? 'in-progress' : 'done';
    this.store.updateActionStatus(sel.id, newStatus);
    const updated = this.mappedActions().find(a => a.id === sel.id);
    this.selectedAction.set(updated || null);
  }

  changeStatus(status: ActionStatus): void {
    const sel = this.selectedAction();
    if (!sel) return;
    this.store.updateActionStatus(sel.id, status);
    const updated = this.mappedActions().find(a => a.id === sel.id);
    this.selectedAction.set(updated || null);
  }

  deleteCurrentAction(): void {
    const sel = this.selectedAction();
    if (!sel) return;
    this.store.deleteAction(sel.id);
    this.selectedAction.set(null);
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  saveNewAction(title: string, desc: string, ownerId: string, priority: string, due: string, meetingId: string): void {
    if (!title.trim()) return;

    const owner = this.store.users().find(u => u.id === ownerId) || this.store.currentUser();
    const meeting = this.store.meetings().find(m => m.id === meetingId) || this.store.meetings()[0];

    const created = this.store.createAction({
      title: title.trim(),
      description: desc.trim() || 'Committed task',
      status: 'backlog',
      priority: priority as Priority,
      owner,
      dueDate: due.trim() || 'Mar 25, 2026',
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      confidence: 100
    });

    this.showCreateModal.set(false);
    const createdView = this.mappedActions().find(a => a.id === created.id);
    if (createdView) {
      this.selectedAction.set(createdView);
    }
  }

  isDueSoon(action: ActionItemView): boolean {
    if (action.dueDate === 'No deadline') return false;
    const due = new Date(action.dueDate);
    const now = new Date('2026-03-15T00:00:00');
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 4;
  }

  isOverdue(action: ActionItemView): boolean {
    if (action.dueDate === 'No deadline' || action.status === 'Completed') return false;
    const due = new Date(action.dueDate);
    const now = new Date('2026-03-15T00:00:00');
    return due.getTime() < now.getTime();
  }

  deadlineText(action: ActionItemView): string {
    if (this.isOverdue(action)) return 'Overdue';
    if (this.isDueSoon(action)) return 'Due soon';
    return 'Upcoming';
  }
}