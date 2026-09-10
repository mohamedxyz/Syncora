import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-shell">

      <app-sidebar />

      <div class="main-area">
        <app-header />

        <main class="page-content">
          <router-outlet />
        </main>
      </div>

    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    .main-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .page-content {
      padding: 28px 32px 48px;
      flex: 1;
      max-width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .page-content {
        padding: 16px 16px 36px;
      }
    }
  `]
})
export class AppComponent {}
