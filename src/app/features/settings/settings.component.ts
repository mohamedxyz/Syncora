import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-page">

      <!-- HEADER -->
      <section class="page-header">
        <div>
          <div class="eyebrow">PREFERENCES & CONFIGURATION</div>
          <h1>Workspace Settings</h1>
          <p>
            Configure AI extraction sensitivity, integrations, webhooks, and team defaults.
          </p>
        </div>

        <button class="primary-button" (click)="saveSettings()">
          Save Changes
        </button>
      </section>

      @if (savedToast()) {
        <div class="toast">
          ✓ Settings successfully saved!
        </div>
      }

      <div class="settings-grid">

        <!-- WORKSPACE GENERAL -->
        <div class="settings-card">
          <h2>General Configuration</h2>
          <p class="card-subtitle">Basic details about your organization workspace</p>

          <div class="form-group">
            <label>Workspace Name</label>
            <input type="text" [value]="workspaceName()" (input)="workspaceName.set($any($event.target).value)" />
          </div>

          <div class="form-group">
            <label>Default Meeting Department</label>
            <select [value]="defaultDepartment()" (change)="defaultDepartment.set($any($event.target).value)">
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div class="form-group">
            <label>Timezone</label>
            <select>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST" selected>EST (Eastern Standard Time - New York)</option>
              <option value="PST">PST (Pacific Standard Time - San Francisco)</option>
              <option value="CET">CET (Central European Time - Berlin)</option>
            </select>
          </div>
        </div>

        <!-- AI INTELLIGENCE PIPELINE -->
        <div class="settings-card">
          <h2>AI Intelligence & Extraction Engine</h2>
          <p class="card-subtitle">Tune automated commitment detection and conflict thresholds</p>

          <div class="form-group">
            <div class="slider-label">
              <label>Minimum Confidence Threshold for Auto-Tasks</label>
              <strong>{{ confidenceThreshold() }}%</strong>
            </div>
            <input
              type="range"
              min="60"
              max="98"
              [value]="confidenceThreshold()"
              (input)="confidenceThreshold.set(+$any($event.target).value)"
            />
            <span class="field-hint">Action items detected below this score will require manual human confirmation.</span>
          </div>

          <div class="toggle-row">
            <div>
              <strong>Cross-Meeting Conflict Detection</strong>
              <span>Automatically flag contradictory commitments across disparate team syncs.</span>
            </div>
            <input type="checkbox" [checked]="conflictDetection()" (change)="conflictDetection.set(!conflictDetection())" />
          </div>

          <div class="toggle-row">
            <div>
              <strong>Sentiment & Urgency Scoring</strong>
              <span>Calculate speaker sentiment and surface urgent conversational inflection points.</span>
            </div>
            <input type="checkbox" [checked]="sentimentScoring()" (change)="sentimentScoring.set(!sentimentScoring())" />
          </div>
        </div>

        <!-- INTEGRATIONS -->
        <div class="settings-card full-width">
          <h2>Meeting & Tool Integrations</h2>
          <p class="card-subtitle">Connect your calendar, communication tools, and issue trackers</p>

          <div class="integrations-list">
            <div class="integration-item">
              <div class="int-icon meet">G</div>
              <div class="int-info">
                <strong>Google Meet & Calendar</strong>
                <span>Auto-sync meetings and process transcripts on call conclusion.</span>
              </div>
              <span class="status-connected">Connected</span>
            </div>

            <div class="integration-item">
              <div class="int-icon zoom">Z</div>
              <div class="int-info">
                <strong>Zoom Cloud Recording</strong>
                <span>Ingest cloud recordings and speaker audio tracks.</span>
              </div>
              <button class="connect-btn">Connect</button>
            </div>

            <div class="integration-item">
              <div class="int-icon slack">S</div>
              <div class="int-info">
                <strong>Slack Notifications</strong>
                <span>Broadcast meeting executive summaries and action assignments to #eng-sync.</span>
              </div>
              <span class="status-connected">Connected</span>
            </div>

            <div class="integration-item">
              <div class="int-icon jira">J</div>
              <div class="int-info">
                <strong>Jira Software & Linear</strong>
                <span>Two-way synchronization for extracted action items into backlog sprints.</span>
              </div>
              <button class="connect-btn">Connect</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .settings-page {
      max-width: 1200px;
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
      padding: 9px 18px;
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

    .toast {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
      animation: fadeIn 0.2s ease;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .settings-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .settings-card.full-width {
      grid-column: span 2;
    }

    .settings-card h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .card-subtitle {
      margin: -8px 0 6px;
      font-size: 12px;
      color: #94a3b8;
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

    .form-group input[type="text"], .form-group select {
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 9px 12px;
      font-size: 13px;
      color: #1e293b;
      outline: 0;
    }

    .form-group input:focus, .form-group select:focus {
      border-color: #6366f1;
    }

    .slider-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .slider-label strong {
      color: #4f46e5;
      font-size: 13px;
    }

    .field-hint {
      font-size: 11px;
      color: #94a3b8;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-top: 1px solid #f1f5f9;
    }

    .toggle-row strong {
      display: block;
      font-size: 13px;
      color: #1e293b;
    }

    .toggle-row span {
      display: block;
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .toggle-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #4f46e5;
      cursor: pointer;
    }

    /* INTEGRATIONS */
    .integrations-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .integration-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      background: #fafafa;
    }

    .int-icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      color: white;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .int-icon.meet { background: #ea4335; }
    .int-icon.zoom { background: #2d8cff; }
    .int-icon.slack { background: #4a154b; }
    .int-icon.jira { background: #0052cc; }

    .int-info {
      flex: 1;
      min-width: 0;
    }

    .int-info strong {
      display: block;
      font-size: 13px;
      color: #0f172a;
    }

    .int-info span {
      display: block;
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.3;
    }

    .status-connected {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 4px 8px;
      border-radius: 999px;
    }

    .connect-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: white;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
    }

    .connect-btn:hover {
      background: #f1f5f9;
    }

    @media (max-width: 900px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      .settings-card.full-width {
        grid-column: span 1;
      }
      .integrations-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent {
  readonly workspaceName = signal('Syncora Labs');
  readonly defaultDepartment = signal('Engineering');
  readonly confidenceThreshold = signal(85);
  readonly conflictDetection = signal(true);
  readonly sentimentScoring = signal(true);
  readonly savedToast = signal(false);

  saveSettings(): void {
    this.savedToast.set(true);
    setTimeout(() => {
      this.savedToast.set(false);
    }, 3000);
  }
}
