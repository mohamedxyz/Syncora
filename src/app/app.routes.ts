import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'meetings',
    loadComponent: () =>
      import('./features/meetings/meeting-list.component')
        .then(m => m.MeetingListComponent)
  },

  {
    path: 'meetings/:id',
    loadComponent: () =>
      import('./features/meetings/meeting-analysis.component')
        .then(m => m.MeetingAnalysisComponent)
  },

  {
    path: 'actions',
    loadComponent: () =>
      import('./features/actions/action-workspace.component')
        .then(m => m.ActionWorkspaceComponent)
  }
];