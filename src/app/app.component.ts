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
    }

    .page-content {
      padding: 32px;
    }
  `]
})
export class AppComponent {}
