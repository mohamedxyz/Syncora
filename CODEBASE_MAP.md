# Syncora Codebase Map

> **Repository**: `Syncora` (`mohamedxyz/Syncora`)  
> **Tagline**: Convert your meetings into actionable intel  
> **Tech Stack**: Angular (Standalone Components, Signals, Router, SCSS)  
> **Last Updated**: September 2026

---

## 1. Directory Structure

```
Syncora/
├── .env.example                               # [Stub] Environment variables template (0 B)
├── .gitignore                                 # Git ignore patterns (Python & VSCode defaults)
├── angular.json                               # [Stub] Angular CLI workspace configuration (0 B)
├── package.json                               # [Stub] Node.js dependencies & scripts (0 B)
├── README.md                                  # Repository overview
├── tsconfig.json                              # [Stub] TypeScript compiler configuration (0 B)
└── src/
    ├── app/
    │   ├── app.component.ts                   # Root application shell (Sidebar + Header + RouterOutlet)
    │   ├── app.config.ts                      # [Stub] Application configuration & providers (0 B)
    │   ├── app.routes.ts                      # Top-level client-side routing definitions
    │   ├── core/                              # Singleton services, interceptors, and data models
    │   │   ├── interceptors/
    │   │   │   └── api-error.interceptor.ts   # [Stub] HTTP error interceptor (0 B)
    │   │   ├── models/
    │   │   │   └── actionsync.model.ts        # Domain models & Signal-based StoreService
    │   │   └── services/
    │   │       ├── actionsync-api.service.ts  # [Stub] Backend HTTP API client (0 B)
    │   │       └── store.service.ts           # [Stub] Dedicated store service file (0 B, implementation in actionsync.model.ts)
    │   ├── features/                          # Domain feature modules / page components
    │   │   ├── actions/
    │   │   │   └── action-workspace.component.ts # Full-page Action Item Workspace & Manager
    │   │   ├── conflicts/
    │   │   │   └── conflicts.component.ts     # [Stub] Decision conflicts view (0 B)
    │   │   ├── dashboard/
    │   │   │   └── dashboard.component.ts     # [Stub] Overview KPI dashboard (0 B)
    │   │   └── meetings/
    │   │       ├── meeting-analysis.component.ts # Meeting intelligence & analysis drilldown
    │   │       └── meeting-list.component.ts  # Meetings directory & status overview
    │   └── shared/                            # Reusable presentational components and utilities
    │       ├── components/
    │       │   ├── header/
    │       │   │   └── header.component.ts    # Global top bar (Search, shortcuts, alerts, profile)
    │       │   └── sidebar/
    │       │       └── sidebar.component.ts   # Main vertical navigation & app branding
    │       └── pipes/
    │           └── confidence.pipe.ts         # [Stub] AI confidence score formatting pipe (0 B)
    └── styles/
        ├── _variables.scss                    # [Stub] Design tokens & color palettes (0 B)
        └── styles.scss                        # [Stub] Global application styling (0 B)
```

### Directory Classification

| Directory | Type | Purpose | Status |
|---|---|---|---|
| `src/app/core` | Core Logic | Cross-cutting domain models, state stores, and HTTP interceptors | Models & state defined; API services are stubs |
| `src/app/features` | Feature Pages | Route-level views for actions, meetings, dashboard, and conflicts | Active for `actions` and `meetings`; `dashboard` and `conflicts` are stubs |
| `src/app/shared` | UI Components | Reusable navigation shell components (Header, Sidebar) | Active and styled |
| `src/styles` | Styling | Global styles and SCSS variables | Empty placeholders (components use scoped inline styles) |
| Root | Config | Build, TypeScript, and dependency manifests | Tracked as 0-byte placeholders |

---

## 2. Important Files

### Active Source Files

| File Path | Purpose | Key Exports / Classes | Important Dependencies | Dependents |
|---|---|---|---|---|
| `src/app/app.component.ts` | Root layout shell | `AppComponent` | `@angular/core`, `@angular/router`, `SidebarComponent`, `HeaderComponent` | Bootstrap entry point |
| `src/app/app.routes.ts` | Routing table | `routes: Routes` | `@angular/router`, `DashboardComponent` (eager), lazy loaders for features | `app.component.ts` (via router) |
| `src/app/core/models/actionsync.model.ts` | Domain models & Reactive Store | `User`, `Meeting`, `Action`, `Decision`, `Conflict`, `Activity`, `DashboardKpi`, `StoreService` | `@angular/core` (`signal`, `computed`, `Injectable`) | Core state across all features |
| `src/app/features/actions/action-workspace.component.ts` | Action tracker & workspace | `ActionWorkspaceComponent`, `ActionItem`, `ActionStatus`, `ActionPriority` | `@angular/core` | Routed via `/actions` |
| `src/app/features/meetings/meeting-list.component.ts` | Meeting directory & filtering | `MeetingListComponent`, `Meeting` | `@angular/core`, `@angular/router` | Routed via `/meetings` |
| `src/app/features/meetings/meeting-analysis.component.ts` | Transcript & analysis drilldown | `MeetingAnalysisComponent` | `@angular/core`, `@angular/router` (`ActivatedRoute`, `RouterLink`) | Routed via `/meetings/:id` |
| `src/app/shared/components/header/header.component.ts` | Top navigation bar | `HeaderComponent` | `@angular/core` | `AppComponent` |
| `src/app/shared/components/sidebar/sidebar.component.ts` | Left navigation sidebar | `SidebarComponent` | `@angular/core`, `@angular/router` (`RouterLink`, `RouterLinkActive`) | `AppComponent` |

### Key Placeholder / Stub Files (0 Bytes)

The following files exist in the repository tree as 0-byte placeholders for future implementation:

- `package.json` & `angular.json` & `tsconfig.json`: Project manifest and compiler configurations.
- `src/app/app.config.ts`: Modern Angular bootstrap configuration (`ApplicationConfig`).
- `src/app/core/services/store.service.ts`: Empty because the `StoreService` implementation is currently located inside `actionsync.model.ts`.
- `src/app/core/services/actionsync-api.service.ts`: Future HTTP client for backend REST integration.
- `src/app/core/interceptors/api-error.interceptor.ts`: Future HTTP interceptor for unified error handling.
- `src/app/features/dashboard/dashboard.component.ts`: Overview page referenced by `app.routes.ts`.
- `src/app/features/conflicts/conflicts.component.ts`: Decision conflict resolution page referenced by sidebar navigation.
- `src/app/shared/pipes/confidence.pipe.ts`: Formatting pipe for AI model confidence scores.
- `src/styles/_variables.scss` & `src/styles/styles.scss`: Shared SCSS styling assets.

---

## 3. Architecture

### Component Hierarchy & Layout

```
AppComponent (App Shell)
├── SidebarComponent (Permanent left navigation: 250px)
│   ├── Brand ("SYNCORA")
│   ├── Navigation links (Dashboard, Meetings, Actions, Decisions, Conflicts, Team, Activity)
│   └── User profile card
└── Main Area (Flexible container)
    ├── HeaderComponent (Top bar: 68px, Global search, alerts, quick actions)
    └── Page Content (RouterOutlet)
        ├── [Route: /dashboard]       -> DashboardComponent (Stub)
        ├── [Route: /meetings]        -> MeetingListComponent (Active)
        ├── [Route: /meetings/:id]    -> MeetingAnalysisComponent (Active)
        └── [Route: /actions]         -> ActionWorkspaceComponent (Active)
```

### Routing Strategy
- **Mode**: Angular Standalone Route Configuration (`app.routes.ts`).
- **Default Route**: Redirects empty path `''` to `'dashboard'` with `pathMatch: 'full'`.
- **Code Splitting**: Feature pages (`meetings`, `meetings/:id`, `actions`) use dynamic import lazy loading:
  ```ts
  loadComponent: () => import('./features/...').then(m => m.Component)
  ```

### State Management & Data Flow
1. **Signal Store (`StoreService`)**:
   - Implemented in `src/app/core/models/actionsync.model.ts` using Angular Signals (`signal`, `computed`).
   - Maintains reactive collections: `currentUser`, `users`, `meetings`, `decisions`, `actions`, `conflicts`, and `activities`.
   - Exposes computed slices: `openActions`, `unresolvedConflicts`.
   - Provides mutation functions: `updateActionStatus(id, status)`, `resolveConflict(id)`.
2. **Local Component State**:
   - `ActionWorkspaceComponent`: Maintains an internal `actions: ActionItem[]` list with local filter state (`all`, `open`, `due`, `completed`), live search filtering, manual action creation, and selection management.
   - `MeetingListComponent`: Maintains an internal mock array of meetings and filter status (`all`, `analyzed`, `processing`).
   - `MeetingAnalysisComponent`: Maintains internal participant metadata and static pipeline analysis stages.

### API & Backend Boundary
- **Current State**: 100% client-side mock data. Components run self-contained data models.
- **Planned Boundary**: `src/app/core/services/actionsync-api.service.ts` is designated as the injectable HTTP service layer, with `api-error.interceptor.ts` handling request/response lifecycle errors.

---

## 4. Configuration

| File | Purpose | Current State |
|---|---|---|
| `package.json` | Dependency list and npm scripts | 0 Bytes (Needs `@angular/core`, `@angular/router`, TypeScript, etc.) |
| `angular.json` | Angular CLI workspace configuration | 0 Bytes (Needs build targets, architect configurations) |
| `tsconfig.json` | TypeScript compiler options | 0 Bytes (Needs target `ES2022`, module resolution, experimental decorators) |
| `.env.example` | Environment variable specifications | 0 Bytes |
| `.gitignore` | Version control exclusion rules | Contains standard Python/Django/VSCode ignore rules |

---

## 5. Tests

- **Test Framework**: None currently configured (no `karma.conf.js`, `jest.config.js`, or Angular test harness).
- **Test Files**: Zero `*.spec.ts` files currently exist in the repository.
- **Execution**: To run tests once configured, standard Angular command will be `npm test` / `ng test`.

---

## 6. Generated / Vendor Files

The following directories/files should **NOT** be manually inspected during regular feature development:
- `.git/`: Internal Git database and revision history.
- `node_modules/`: (Will be generated when dependencies are installed).
- `.angular/` / `dist/`: (Will be generated during Angular CLI build runs).

---

## 7. Important Modification Relationships

When implementing or altering features, inspect and update the following file groups together:

### 1. Actions Management Feature
- `src/app/features/actions/action-workspace.component.ts` (View, filters, action creation)
- `src/app/core/models/actionsync.model.ts` (Domain `Action` interface & status types)
- `src/app/core/services/store.service.ts` (Centralized signal store for actions)

### 2. Meetings & Intelligence Analysis Feature
- `src/app/features/meetings/meeting-list.component.ts` (Meeting overview & status tags)
- `src/app/features/meetings/meeting-analysis.component.ts` (Pipeline stages, extracted items)
- `src/app/app.routes.ts` (Dynamic routing for `meetings/:id`)
- `src/app/core/models/actionsync.model.ts` (`Meeting`, `Decision`, and `Conflict` models)

### 3. Navigation & App Shell
- `src/app/app.component.ts` (App container layout)
- `src/app/shared/components/sidebar/sidebar.component.ts` (Navigation links and badges)
- `src/app/shared/components/header/header.component.ts` (Search and top action buttons)
- `src/app/app.routes.ts` (Route mappings for sidebar links)

### 4. Architectural Cleanup / Separation
- `src/app/core/models/actionsync.model.ts` (Extract embedded `StoreService` into `store.service.ts`)
- `src/app/core/services/store.service.ts` (Target destination for standalone `StoreService`)
