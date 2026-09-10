import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { User } from '../../core/models/actionsync.model';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="team-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">WORKSPACE DIRECTORY</div>
          <h1>Team & Contributors</h1>
          <p>
            Track ownership, meeting attendance, and action distribution across the organization.
          </p>
        </div>

        <button class="primary-button" (click)="showInviteModal.set(true)">
          + Invite Member
        </button>
      </section>

      <!-- STATS -->
      <section class="team-stats">
        <div class="stat-card">
          <span>Active Contributors</span>
          <strong>{{ store.users().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Total Tasks Assigned</span>
          <strong class="text-primary">{{ store.actions().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Pending Completion</span>
          <strong class="text-warning">{{ store.openActions().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Avg Attendance Rate</span>
          <strong class="text-success">92%</strong>
        </div>
      </section>

      <!-- SEARCH BAR -->
      <section class="toolbar">
        <div class="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search team by name, role, or email..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
        </div>
      </section>

      <!-- TEAM MEMBERS GRID -->
      <section class="members-grid">
        @for (member of filteredUsers(); track member.id) {
          <article class="member-card" [class.selected]="selectedMember()?.id === member.id" (click)="selectMember(member)">
            <div class="member-head">
              <div class="avatar-large" [style.background]="member.color">
                {{ member.initials }}
              </div>
              <div class="member-info">
                <h3>{{ member.name }}</h3>
                <span class="member-role">{{ member.role || 'Contributor' }}</span>
                <span class="member-email">{{ member.email }}</span>
              </div>
            </div>

            <div class="member-metrics">
              <div class="metric-item">
                <strong>{{ getActionCount(member.id) }}</strong>
                <span>Assigned Tasks</span>
              </div>
              <div class="metric-item">
                <strong>{{ getMeetingCount(member.id) }}</strong>
                <span>Meetings</span>
              </div>
              <div class="metric-item">
                <strong>{{ getDecisionCount(member.id) }}</strong>
                <span>Decisions</span>
              </div>
            </div>

            <div class="member-footer">
              <span class="view-link">View Tasks & Details →</span>
            </div>
          </article>
        }
      </section>

      <!-- DETAIL DRAWER / MODAL -->
      @if (selectedMember()) {
        <div class="drawer-backdrop" (click)="selectedMember.set(null)">
          <aside class="drawer-panel" (click)="$event.stopPropagation()">
            <div class="drawer-header">
              <div class="drawer-lead">
                <div class="avatar-large" [style.background]="selectedMember()!.color">
                  {{ selectedMember()!.initials }}
                </div>
                <div>
                  <h2>{{ selectedMember()!.name }}</h2>
                  <span>{{ selectedMember()!.role }} · {{ selectedMember()!.email }}</span>
                </div>
              </div>
              <button class="close-btn" (click)="selectedMember.set(null)">×</button>
            </div>

            <div class="drawer-content">
              <h3>Assigned Action Items ({{ memberTasks().length }})</h3>

              @if (memberTasks().length === 0) {
                <div class="empty-drawer">
                  <p>No active action items assigned to this contributor.</p>
                </div>
              } @else {
                <div class="drawer-tasks">
                  @for (task of memberTasks(); track task.id) {
                    <div class="drawer-task-card">
                      <div class="dt-top">
                        <span class="dt-priority" [class.high]="task.priority === 'high' || task.priority === 'critical'">
                          {{ task.priority }}
                        </span>
                        <span class="dt-status">{{ task.status }}</span>
                      </div>
                      <h4>{{ task.title }}</h4>
                      <p>{{ task.description }}</p>
                      <div class="dt-meta">
                        <span>Due: {{ task.dueDate }}</span>
                        <span>·</span>
                        <a [routerLink]="['/meetings', task.meetingId]">
                          {{ task.meetingTitle }}
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </aside>
        </div>
      }

      <!-- INVITE MODAL -->
      @if (showInviteModal()) {
        <div class="modal-backdrop" (click)="showInviteModal.set(false)">
          <div class="modal-window" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Invite Team Member</h2>
              <button class="close-btn" (click)="showInviteModal.set(false)">×</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Full Name</label>
                <input #nameInput type="text" placeholder="e.g., Alex Rivera" />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input #emailInput type="email" placeholder="alex@syncora.app" />
              </div>

              <div class="form-group">
                <label>Role</label>
                <input #roleInput type="text" placeholder="e.g., Senior Infrastructure Engineer" />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" (click)="showInviteModal.set(false)">Cancel</button>
              <button
                class="btn-save"
                (click)="inviteMember(nameInput.value, emailInput.value, roleInput.value)"
              >
                Send Invite
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

    .team-page {
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

    .team-stats {
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

    .text-primary { color: #4f46e5 !important; }
    .text-warning { color: #ea580c !important; }
    .text-success { color: #059669 !important; }

    .toolbar {
      margin-bottom: 18px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      max-width: 380px;
      color: #94a3b8;
    }

    .search-box input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 12px;
      color: #1e293b;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .member-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .member-card:hover {
      border-color: #c7d2fe;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
      transform: translateY(-1px);
    }

    .member-head {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-large {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      color: white;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .member-info {
      min-width: 0;
    }

    .member-info h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .member-role {
      display: block;
      font-size: 11px;
      color: #4f46e5;
      font-weight: 600;
      margin-top: 1px;
    }

    .member-email {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .member-metrics {
      display: flex;
      justify-content: space-around;
      background: #f8fafc;
      border-radius: 8px;
      padding: 10px;
      border: 1px solid #f1f5f9;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .metric-item strong {
      font-size: 15px;
      color: #1e293b;
    }

    .metric-item span {
      font-size: 9px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .member-footer {
      display: flex;
      justify-content: flex-end;
    }

    .view-link {
      font-size: 11px;
      font-weight: 600;
      color: #6366f1;
    }

    /* DRAWER */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
    }

    .drawer-panel {
      width: 440px;
      background: white;
      height: 100%;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .drawer-lead {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .drawer-lead h2 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
    }

    .drawer-lead span {
      font-size: 11px;
      color: #64748b;
    }

    .close-btn {
      border: 0;
      background: transparent;
      font-size: 22px;
      color: #94a3b8;
      cursor: pointer;
    }

    .drawer-content {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }

    .drawer-content h3 {
      margin: 0 0 14px;
      font-size: 13px;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .drawer-tasks {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .drawer-task-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
    }

    .dt-top {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin-bottom: 6px;
    }

    .dt-priority {
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }

    .dt-priority.high {
      color: #dc2626;
    }

    .dt-status {
      color: #4f46e5;
      font-weight: 600;
    }

    .drawer-task-card h4 {
      margin: 0 0 4px;
      font-size: 12px;
      color: #1e293b;
    }

    .drawer-task-card p {
      margin: 0 0 8px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .dt-meta {
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      gap: 6px;
    }

    .dt-meta a {
      color: #4f46e5;
    }

    .empty-drawer {
      padding: 30px 10px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
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
      max-width: 440px;
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
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input {
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 8px 10px;
      font-size: 12px;
      color: #1e293b;
      outline: 0;
    }

    .form-group input:focus {
      border-color: #6366f1;
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

    @media (max-width: 1000px) {
      .members-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .team-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 650px) {
      .members-grid {
        grid-template-columns: 1fr;
      }
      .team-stats {
        grid-template-columns: 1fr;
      }
      .drawer-panel {
        width: 100%;
      }
    }
  `]
})
export class TeamComponent {
  readonly store = inject(StoreService);

  readonly searchTerm = signal('');
  readonly selectedMember = signal<User | null>(null);
  readonly showInviteModal = signal(false);

  readonly filteredUsers = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    if (!q) return this.store.users();

    return this.store.users().filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  readonly memberTasks = computed(() => {
    const mem = this.selectedMember();
    if (!mem) return [];
    return this.store.actions().filter(a => a.owner.id === mem.id);
  });

  getActionCount(userId: string): number {
    return this.store.actions().filter(a => a.owner.id === userId).length;
  }

  getMeetingCount(userId: string): number {
    return this.store.meetings().filter(m =>
      m.participants.some(p => p.id === userId) || m.owner.id === userId
    ).length;
  }

  getDecisionCount(userId: string): number {
    return this.store.decisions().filter(d => d.owner.id === userId).length;
  }

  onSearch(e: Event): void {
    this.searchTerm.set((e.target as HTMLInputElement).value);
  }

  selectMember(user: User): void {
    this.selectedMember.set(user);
  }

  inviteMember(name: string, email: string, role: string): void {
    if (!name.trim() || !email.trim()) return;

    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const color = colors[this.store.users().length % colors.length];

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      initials,
      color,
      role: role.trim() || 'Contributor'
    };

    this.store.users.update(list => [...list, newUser]);
    this.showInviteModal.set(false);
  }
}
