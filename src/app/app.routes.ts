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
      import('./features/meetings/meeting-list.component').then(
        m => m.MeetingListComponent
      )
  },
  {
    path: 'meetings/:id',
    loadComponent: () =>
      import('./features/meetings/meeting-analysis.component').then(
        m => m.MeetingAnalysisComponent
      )
  },
  {
    path: 'actions',
    loadComponent: () =>
      import('./features/actions/action-workspace.component').then(
        m => m.ActionWorkspaceComponent
      )
  },
  {
    path: 'decisions',
    loadComponent: () =>
      import('./features/decisions/decisions.component').then(
        m => m.DecisionsComponent
      )
  },
  {
    path: 'conflicts',
    loadComponent: () =>
      import('./features/conflicts/conflicts.component').then(
        m => m.ConflictsComponent
      )
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./features/team/team.component').then(m => m.TeamComponent)
  },
  {
    path: 'activity',
    loadComponent: () =>
      import('./features/activity/activity.component').then(
        m => m.ActivityComponent
      )
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        m => m.SettingsComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];