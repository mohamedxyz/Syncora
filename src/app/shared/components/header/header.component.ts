import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">

      <div class="search">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search meetings, actions, decisions..."
        />
        <kbd>⌘ K</kbd>
      </div>

      <div class="header-actions">

        <button class="icon-button">
          ♧
        </button>

        <button class="notification">
          ♧
          <span></span>
        </button>

        <div class="header-avatar">
          AH
        </div>

      </div>

    </header>
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
    }

    .search {
      width: 420px;

      display: flex;
      align-items: center;
      gap: 10px;

      padding: 8px 12px;

      border: 1px solid #e2e8f0;
      border-radius: 8px;

      color: #94a3b8;
    }

    .search input {
      flex: 1;

      border: 0;
      outline: 0;

      color: #334155;
      font-size: 13px;
    }

    .search input::placeholder {
      color: #94a3b8;
    }

    kbd {
      padding: 3px 6px;

      border: 1px solid #e2e8f0;
      border-radius: 4px;

      background: #f8fafc;
      color: #94a3b8;

      font-size: 10px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    button {
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    .icon-button,
    .notification {
      position: relative;

      width: 36px;
      height: 36px;

      color: #64748b;
      font-size: 17px;
    }

    .notification span {
      position: absolute;
      top: 7px;
      right: 7px;

      width: 6px;
      height: 6px;

      border-radius: 50%;
      background: #ef4444;
    }

    .header-avatar {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background: #4f46e5;
      color: white;

      font-size: 11px;
      font-weight: 700;
    }
  `]
})
export class HeaderComponent {}