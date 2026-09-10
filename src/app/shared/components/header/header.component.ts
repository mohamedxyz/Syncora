import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { User } from '../../../core/models/actionsync.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">

      <!-- GLOBAL SEARCH TRIGGER -->
      <div class="search" (click)="openSearch()">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search meetings, actions, decisions... (⌘K)"
          readonly
        />
        <kbd>⌘ K</kbd>
      </div>

      <!-- HEADER ACTIONS -->
      <div class="header-actions">

        <!-- NOTIFICATIONS DROPDOWN -->
        <div class="popover-wrapper">
          <button class="notification-btn" (click)="toggleNotifications()" title="Notifications">
            🔔
            @if (store.unreadNotificationsCount() > 0) {
              <span class="notification-dot">{{ store.unreadNotificationsCount() }}</span>
            }
          </button>

          @if (showNotifications()) {
            <div class="popover-panel notif-panel" (click)="$event.stopPropagation()">
              <div class="popover-header">
                <strong>Notifications</strong>
                <button class="text-link" (click)="store.markAllNotificationsRead()">Mark all read</button>
              </div>

              <div class="notif-list">
                @if (store.notifications().length === 0) {
                  <div class="empty-popover">No notifications</div>
                } @else {
                  @for (n of store.notifications(); track n.id) {
                    <div
                      class="notif-item"
                      [class.unread]="!n.read"
                      (click)="onNotificationClick(n)"
                    >
                      <div class="notif-lead">
                        <span class="notif-type" [class.danger]="n.type === 'conflict'" [class.warning]="n.type === 'action'">
                          @switch (n.type) {
                            @case ('conflict') { ⚠ }
                            @case ('action') { ✓ }
                            @case ('decision') { ◆ }
                            @default { ◫ }
                          }
                        </span>
                        <div class="notif-body">
                          <strong>{{ n.title }}</strong>
                          <p>{{ n.message }}</p>
                          <span class="notif-time">{{ n.timestamp }}</span>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- CURRENT USER DROPDOWN (Supports Persona Switching) -->
        <div class="popover-wrapper">
          <div class="header-avatar" [style.background]="store.currentUser().color" (click)="toggleUserMenu()">
            {{ store.currentUser().initials }}
          </div>

          @if (showUserMenu()) {
            <div class="popover-panel user-panel" (click)="$event.stopPropagation()">
              <div class="user-popover-header">
                <div class="large-avatar" [style.background]="store.currentUser().color">
                  {{ store.currentUser().initials }}
                </div>
                <div>
                  <strong>{{ store.currentUser().name }}</strong>
                  <span>{{ store.currentUser().role }}</span>
                  <span class="user-email">{{ store.currentUser().email }}</span>
                </div>
              </div>

              <div class="user-switch-section">
                <span class="section-label">SWITCH ACTIVE PERSONA</span>
                @for (u of store.users(); track u.id) {
                  <button
                    class="persona-btn"
                    [class.active]="u.id === store.currentUser().id"
                    (click)="switchUser(u)"
                  >
                    <span class="mini-avatar" [style.background]="u.color">{{ u.initials }}</span>
                    <span>{{ u.name }} ({{ u.role }})</span>
                  </button>
                }
              </div>

              <div class="user-panel-footer">
                <a routerLink="/settings" class="settings-link" (click)="showUserMenu.set(false)">Workspace Settings →</a>
              </div>
            </div>
          }
        </div>

      </div>

    </header>

    <!-- OMNI-SEARCH MODAL -->
    @if (showSearchModal()) {
      <div class="search-backdrop" (click)="closeSearch()">
        <div class="search-dialog" (click)="$event.stopPropagation()">
          <div class="search-input-box">
            <span class="search-icon">⌕</span>
            <input
              #searchInput
              type="text"
              placeholder="Type to search across meetings, tasks, decisions..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
            />
            <button class="esc-badge" (click)="closeSearch()">ESC</button>
          </div>

          <div class="search-results">
            @if (searchQuery().trim() === '') {
              <div class="search-hint">
                <span>Start typing to search meetings, commitments, decisions, and themes...</span>
              </div>
            } @else if (searchResults().length === 0) {
              <div class="search-empty">
                <span>No results matching "{{ searchQuery() }}"</span>
              </div>
            } @else {
              @for (res of searchResults(); track res.id) {
                <div class="search-result-item" (click)="navigateTo(res.link)">
                  <span class="result-badge" [class.badge-meet]="res.type === 'meeting'" [class.badge-act]="res.type === 'action'" [class.badge-dec]="res.type === 'decision'">
                    {{ res.type }}
                  </span>
                  <div class="result-content">
                    <strong>{{ res.title }}</strong>
                    <p>{{ res.subtitle }}</p>
                  </div>
                  <span class="result-arrow">→</span>
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .header {
      height: 68px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .search {
      width: 440px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.15s ease;
    }

    .search:hover {
      border-color: #c7d2fe;
      background: white;
    }

    .search input {
      flex: 1;
      border: 0;
      outline: 0;
      color: #334155;
      font-size: 13px;
      cursor: pointer;
      background: transparent;
    }

    kbd {
      padding: 2px 6px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .popover-wrapper {
      position: relative;
    }

    .notification-btn {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 15px;
      cursor: pointer;
      transition: 0.15s ease;
    }

    .notification-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .notification-dot {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 9px;
      font-weight: 800;
      border-radius: 999px;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .header-avatar {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.15s ease;
    }

    .header-avatar:hover {
      transform: scale(1.05);
    }

    /* POPOVER PANELS */
    .popover-panel {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
      z-index: 1000;
      animation: fadeIn 0.15s ease;
    }

    .notif-panel {
      width: 360px;
    }

    .popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .popover-header strong {
      font-size: 13px;
      color: #0f172a;
    }

    .text-link {
      background: transparent;
      border: 0;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .notif-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .notif-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f8fafc;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .notif-item:hover {
      background: #f8fafc;
    }

    .notif-item.unread {
      background: #f5f7ff;
    }

    .notif-lead {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .notif-type {
      font-size: 12px;
      margin-top: 1px;
    }

    .notif-type.danger { color: #dc2626; }
    .notif-type.warning { color: #ea580c; }

    .notif-body strong {
      display: block;
      font-size: 12px;
      color: #1e293b;
    }

    .notif-body p {
      margin: 2px 0 4px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.3;
    }

    .notif-time {
      font-size: 9px;
      color: #94a3b8;
    }

    .empty-popover {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    /* USER PANEL */
    .user-panel {
      width: 300px;
      padding: 16px;
    }

    .user-popover-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
    }

    .large-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-popover-header strong {
      display: block;
      font-size: 13px;
      color: #0f172a;
    }

    .user-popover-header span {
      display: block;
      font-size: 11px;
      color: #64748b;
    }

    .user-email {
      font-size: 10px !important;
      color: #94a3b8 !important;
    }

    .user-switch-section {
      padding: 12px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .section-label {
      font-size: 9px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }

    .persona-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #334155;
      font-size: 11px;
      cursor: pointer;
      text-align: left;
    }

    .persona-btn:hover {
      background: #f1f5f9;
    }

    .persona-btn.active {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }

    .mini-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      color: white;
      font-size: 8px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-panel-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }

    .settings-link {
      font-size: 11px;
      font-weight: 600;
      color: #4f46e5;
      text-decoration: none;
    }

    /* SEARCH MODAL */
    .search-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 2000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
    }

    .search-dialog {
      width: 100%;
      max-width: 620px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: fadeIn 0.15s ease;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .search-icon {
      font-size: 18px;
      color: #94a3b8;
    }

    .search-input-box input {
      flex: 1;
      border: 0;
      outline: 0;
      font-size: 15px;
      color: #0f172a;
    }

    .esc-badge {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      padding: 3px 6px;
      cursor: pointer;
    }

    .search-results {
      max-height: 380px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .search-hint, .search-empty {
      padding: 32px;
      text-align: center;
      color: #94a3b8;
      font-size: 13px;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .search-result-item:hover {
      background: #f8fafc;
    }

    .result-badge {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .badge-meet { background: #eff6ff; color: #2563eb; }
    .badge-act { background: #ecfdf5; color: #059669; }
    .badge-dec { background: #eef2ff; color: #4f46e5; }

    .result-content {
      flex: 1;
      min-width: 0;
    }

    .result-content strong {
      display: block;
      font-size: 13px;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-content p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-arrow {
      color: #cbd5e1;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .search {
        width: 220px;
      }
      .search kbd {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  readonly store = inject(StoreService);
  private router = inject(Router);

  readonly showNotifications = signal(false);
  readonly showUserMenu = signal(false);
  readonly showSearchModal = signal(false);
  readonly searchQuery = signal('');

  readonly searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];

    const results: { id: string; type: 'meeting' | 'action' | 'decision'; title: string; subtitle: string; link: string }[] = [];

    // Meetings
    for (const m of this.store.meetings()) {
      if (m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)) {
        results.push({
          id: m.id,
          type: 'meeting',
          title: m.title,
          subtitle: `${m.date} · ${m.department} · ${m.actionCount} actions`,
          link: `/meetings/${m.id}`
        });
      }
    }

    // Actions
    for (const a of this.store.actions()) {
      if (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.owner.name.toLowerCase().includes(q)) {
        results.push({
          id: a.id,
          type: 'action',
          title: a.title,
          subtitle: `Assignee: ${a.owner.name} · Due: ${a.dueDate} · ${a.status}`,
          link: '/actions'
        });
      }
    }

    // Decisions
    for (const d of this.store.decisions()) {
      if (d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          type: 'decision',
          title: d.title,
          subtitle: `Source: ${d.meetingTitle} · ${d.status}`,
          link: '/decisions'
        });
      }
    }

    return results.slice(0, 10);
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalKey(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
    if (event.key === 'Escape' && this.showSearchModal()) {
      this.closeSearch();
    }
  }

  openSearch(): void {
    this.searchQuery.set('');
    this.showSearchModal.set(true);
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
  }

  closeSearch(): void {
    this.showSearchModal.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.set(!this.showUserMenu());
    this.showNotifications.set(false);
  }

  onNotificationClick(n: any): void {
    n.read = true;
    this.showNotifications.set(false);
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  switchUser(user: User): void {
    this.store.currentUser.set(user);
    this.showUserMenu.set(false);
  }

  navigateTo(url: string): void {
    this.closeSearch();
    this.router.navigateByUrl(url);
  }
}