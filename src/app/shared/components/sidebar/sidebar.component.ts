import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <aside class="sidebar">

      <div class="logo">
        <div class="logo-mark">S</div>

        <div>
          <div class="logo-name">SYNCORA</div>
          <div class="logo-subtitle">Stay in sync</div>
        </div>
      </div>

      <nav class="navigation">

        <div class="nav-section">
          <span>OVERVIEW</span>
        </div>

        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">⌂</span>
          Dashboard
        </a>

        <div class="nav-section">
          <span>WORK</span>
        </div>

        <a
          routerLink="/meetings"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">◫</span>
          Meetings
          <span class="count-badge">{{ store.meetings().length }}</span>
        </a>

        <a
          routerLink="/actions"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">✓</span>
          Actions
          @if (store.openActions().length > 0) {
            <span class="count-badge">{{ store.openActions().length }}</span>
          }
        </a>

        <a
          routerLink="/decisions"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">◆</span>
          Decisions
        </a>

        <a
          routerLink="/conflicts"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">!</span>
          Conflicts

          @if (store.unresolvedConflicts().length > 0) {
            <span class="conflict-count">{{ store.unresolvedConflicts().length }}</span>
          }
        </a>

        <div class="nav-section">
          <span>WORKSPACE</span>
        </div>

        <a
          routerLink="/team"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">◎</span>
          Team
        </a>

        <a
          routerLink="/activity"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">↻</span>
          Activity
        </a>

      </nav>

      <div class="sidebar-bottom">

        <a
          routerLink="/settings"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="icon">⚙</span>
          Settings
        </a>

        <div class="user">

          <div class="avatar" [style.background]="store.currentUser().color">
            {{ store.currentUser().initials }}
          </div>

          <div class="user-info">
            <strong>{{ store.currentUser().name }}</strong>
            <span>{{ store.currentUser().role || 'Administrator' }}</span>
          </div>

        </div>

      </div>

    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      min-height: 100vh;
      padding: 24px 16px;
      box-sizing: border-box;

      background: #ffffff;
      border-right: 1px solid #e2e8f0;

      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 10px 32px;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: white;
      font-weight: 700;

      background: linear-gradient(
        135deg,
        #6366f1,
        #8b5cf6
      );
    }

    .logo-name {
      color: #0f172a;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .logo-subtitle {
      margin-top: 2px;
      color: #94a3b8;
      font-size: 11px;
    }

    .navigation {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-section {
      margin: 18px 10px 7px;

      color: #94a3b8;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .nav-item {
      position: relative;

      display: flex;
      align-items: center;
      gap: 12px;

      padding: 9px 12px;
      border-radius: 8px;

      color: #64748b;
      text-decoration: none;

      font-size: 13px;
      font-weight: 500;

      transition: 0.15s ease;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .nav-item.active {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }

    .icon {
      width: 20px;
      text-align: center;
      font-size: 15px;
    }

    .count-badge {
      margin-left: auto;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      background: #f1f5f9;
      padding: 1px 7px;
      border-radius: 999px;
    }

    .conflict-count {
      margin-left: auto;

      min-width: 20px;
      height: 20px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 999px;

      background: #fee2e2;
      color: #dc2626;

      font-size: 11px;
      font-weight: 700;
      padding: 0 6px;
    }

    .sidebar-bottom {
      margin-top: auto;
    }

    .user {
      display: flex;
      align-items: center;
      gap: 10px;

      margin-top: 16px;
      padding: 12px;

      border-top: 1px solid #e2e8f0;
    }

    .avatar {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background: #e0e7ff;
      color: white;

      font-size: 11px;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-info strong {
      color: #0f172a;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-info span {
      margin-top: 2px;
      color: #94a3b8;
      font-size: 10px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
        padding: 16px 8px;
      }
      .logo-name, .logo-subtitle, .nav-section, .nav-item span:not(.icon), .user-info {
        display: none;
      }
      .logo {
        justify-content: center;
        padding: 0 0 20px;
      }
      .nav-item {
        justify-content: center;
        padding: 10px;
      }
      .user {
        justify-content: center;
        padding: 8px 0;
      }
    }
  `]
})
export class SidebarComponent {
  readonly store = inject(StoreService);
}