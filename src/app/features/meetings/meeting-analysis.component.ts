import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-meeting-analysis',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="analysis-page">

      <div class="back">
        <a routerLink="/meetings">← Back to meetings</a>
      </div>

      <section class="hero">

        <div>
          <div class="eyebrow">MEETING ANALYSIS</div>

          <h1>Weekly Engineering Sync</h1>

          <div class="metadata">
            <span>March 14, 2026</span>
            <span>·</span>
            <span>10:00 AM</span>
            <span>·</span>
            <span>48 minutes</span>
          </div>
        </div>

        <div class="hero-actions">
          <button class="secondary">⋯</button>
          <button class="primary">Export Analysis</button>
        </div>

      </section>


      <section class="pipeline">

        <div class="pipeline-title">
          <span>ANALYSIS PIPELINE</span>
          <strong>Complete</strong>
        </div>

        <div class="pipeline-track">

          <div class="pipeline-step complete">
            <div class="step-dot">✓</div>
            <span>Transcript</span>
          </div>

          <div class="line complete"></div>

          <div class="pipeline-step complete">
            <div class="step-dot">✓</div>
            <span>Topics</span>
          </div>

          <div class="line complete"></div>

          <div class="pipeline-step complete">
            <div class="step-dot">✓</div>
            <span>Actions</span>
          </div>

          <div class="line complete"></div>

          <div class="pipeline-step complete">
            <div class="step-dot">✓</div>
            <span>Decisions</span>
          </div>

          <div class="line complete"></div>

          <div class="pipeline-step complete">
            <div class="step-dot">✓</div>
            <span>Conflicts</span>
          </div>

        </div>

      </section>


      <section class="metrics">

        <div class="metric">
          <span>Participants</span>
          <strong>8</strong>
        </div>

        <div class="metric">
          <span>Topics</span>
          <strong>6</strong>
        </div>

        <div class="metric green">
          <span>Actions</span>
          <strong>12</strong>
        </div>

        <div class="metric blue">
          <span>Decisions</span>
          <strong>4</strong>
        </div>

        <div class="metric red">
          <span>Conflicts</span>
          <strong>1</strong>
        </div>

        <div class="metric">
          <span>Confidence</span>
          <strong>94%</strong>
        </div>

      </section>


      <section class="analysis-grid">

        <div class="card">

          <div class="card-header">
            <div>
              <h2>Executive Summary</h2>
              <p>AI-generated meeting summary</p>
            </div>

            <span class="confidence-badge">
              94% confidence
            </span>
          </div>

          <p class="summary">
            The engineering team aligned on the authentication
            architecture for the upcoming platform release. OAuth2
            with short-lived access tokens was selected as the
            preferred approach. The team also reviewed the database
            migration timeline and agreed to move the staging
            migration forward by one week.
          </p>

          <div class="key-points">

            <div>
              <span class="point-icon green">✓</span>
              <span>Authentication strategy finalized</span>
            </div>

            <div>
              <span class="point-icon blue">◆</span>
              <span>Database migration timeline updated</span>
            </div>

            <div>
              <span class="point-icon orange">!</span>
              <span>Security review required before production</span>
            </div>

          </div>

        </div>


        <div class="card">

          <div class="card-header">
            <div>
              <h2>Participants</h2>
              <p>8 people attended</p>
            </div>
          </div>

          <div class="participants">

            @for (person of participants; track person.name) {

              <div class="participant">

                <div class="person-avatar">
                  {{ person.initials }}
                </div>

                <div>
                  <strong>{{ person.name }}</strong>
                  <span>{{ person.role }}</span>
                </div>

              </div>

            }

          </div>

        </div>

      </section>


      <section class="card decisions-card">

        <div class="card-header">
          <div>
            <h2>Decisions</h2>
            <p>4 decisions extracted from this meeting</p>
          </div>

          <button class="text-button">
            View all
          </button>
        </div>

        <div class="decision">

          <div class="decision-number">01</div>

          <div class="decision-content">
            <strong>
              Use OAuth2 for API authentication
            </strong>

            <p>
              The team agreed to use OAuth2 with short-lived
              access tokens for the new API.
            </p>

            <span>
              Decided by Engineering · 10:24 AM
            </span>
          </div>

          <span class="decision-status">
            Confirmed
          </span>

        </div>

        <div class="decision">

          <div class="decision-number">02</div>

          <div class="decision-content">
            <strong>
              Move staging migration to March 20
            </strong>

            <p>
              Staging migration will happen one week earlier
              than the original schedule.
            </p>

            <span>
              Decided by Engineering · 10:41 AM
            </span>
          </div>

          <span class="decision-status">
            Confirmed
          </span>

        </div>

      </section>


      <section class="card actions-card">

        <div class="card-header">
          <div>
            <h2>Actions</h2>
            <p>12 actions extracted from this meeting</p>
          </div>

          <button class="text-button">
            View workspace
          </button>
        </div>

        <div class="action-row">

          <div class="check"></div>

          <div>
            <strong>Prepare OAuth2 implementation plan</strong>
            <span>Sarah Miller · Due Mar 18</span>
          </div>

          <span class="priority high">High</span>

        </div>

        <div class="action-row">

          <div class="check"></div>

          <div>
            <strong>Schedule security review</strong>
            <span>David Chen · Due Mar 19</span>
          </div>

          <span class="priority medium">Medium</span>

        </div>

        <div class="action-row">

          <div class="check"></div>

          <div>
            <strong>Update migration documentation</strong>
            <span>James Wilson · Due Mar 21</span>
          </div>

          <span class="priority low">Low</span>

        </div>

      </section>

    </div>
  `,
  styles: [`
    .analysis-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .back {
      margin-bottom: 20px;
    }

    .back a {
      color: #64748b;
      text-decoration: none;
      font-size: 12px;
    }

    .back a:hover {
      color: #4f46e5;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
    }

    .eyebrow {
      color: #6366f1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.4px;
      margin-bottom: 7px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 26px;
    }

    .metadata {
      display: flex;
      gap: 7px;
      margin-top: 8px;
      color: #94a3b8;
      font-size: 11px;
    }

    .hero-actions {
      display: flex;
      gap: 8px;
    }

    button {
      cursor: pointer;
    }

    .primary,
    .secondary {
      border-radius: 7px;
      padding: 9px 13px;
      font-size: 12px;
      font-weight: 600;
    }

    .primary {
      border: 0;
      background: #4f46e5;
      color: white;
    }

    .secondary {
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
    }

    .pipeline,
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
    }

    .pipeline {
      padding: 20px 24px;
      margin-bottom: 16px;
    }

    .pipeline-title {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .pipeline-title strong {
      color: #059669;
      letter-spacing: 0;
    }

    .pipeline-track {
      display: flex;
      align-items: center;
      margin-top: 20px;
    }

    .pipeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      min-width: 70px;
    }

    .pipeline-step span {
      color: #64748b;
      font-size: 10px;
    }

    .step-dot {
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #ecfdf5;
      color: #059669;
      font-size: 11px;
      font-weight: 700;
    }

    .line {
      flex: 1;
      height: 2px;
      background: #d1fae5;
      margin-bottom: 18px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }

    .metric {
      padding: 17px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .metric span {
      display: block;
      color: #94a3b8;
      font-size: 9px;
      font-weight: 600;
    }

    .metric strong {
      display: block;
      margin-top: 6px;
      color: #334155;
      font-size: 21px;
    }

    .metric.green strong {
      color: #059669;
    }

    .metric.blue strong {
      color: #2563eb;
    }

    .metric.red strong {
      color: #dc2626;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .card {
      padding: 21px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    h2 {
      margin: 0;
      color: #1e293b;
      font-size: 14px;
    }

    .card-header p {
      margin: 5px 0 0;
      color: #94a3b8;
      font-size: 10px;
    }

    .confidence-badge {
      padding: 5px 8px;
      border-radius: 999px;
      background: #ecfdf5;
      color: #059669;
      font-size: 9px;
      font-weight: 700;
    }

    .summary {
      color: #475569;
      font-size: 12px;
      line-height: 1.8;
    }

    .key-points {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }

    .key-points div {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #475569;
      font-size: 11px;
    }

    .point-icon {
      width: 21px;
      height: 21px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 700;
    }

    .point-icon.green {
      background: #ecfdf5;
      color: #059669;
    }

    .point-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .point-icon.orange {
      background: #fff7ed;
      color: #ea580c;
    }

    .participants {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 10px;
      padding-top: 17px;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .person-avatar {
      width: 31px;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 9px;
      font-weight: 700;
    }

    .participant strong,
    .participant span {
      display: block;
    }

    .participant strong {
      color: #334155;
      font-size: 10px;
    }

    .participant span {
      margin-top: 3px;
      color: #94a3b8;
      font-size: 9px;
    }

    .decisions-card,
    .actions-card {
      margin-bottom: 16px;
    }

    .decision,
    .action-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 17px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .decision:last-child,
    .action-row:last-child {
      border-bottom: 0;
    }

    .decision-number {
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 800;
    }

    .decision-content,
    .action-row > div:nth-child(2) {
      flex: 1;
    }

    .decision-content strong,
    .action-row strong {
      display: block;
      color: #334155;
      font-size: 11px;
    }

    .decision-content p {
      margin: 4px 0;
      color: #64748b;
      font-size: 10px;
    }

    .decision-content span,
    .action-row span {
      color: #94a3b8;
      font-size: 9px;
    }

    .decision-status {
      padding: 4px 7px;
      border-radius: 999px;
      background: #ecfdf5;
      color: #059669 !important;
      font-weight: 700;
    }

    .text-button {
      border: 0;
      background: transparent;
      color: #4f46e5;
      font-size: 10px;
      font-weight: 700;
    }

    .check {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
    }

    .priority {
      padding: 4px 7px;
      border-radius: 999px;
      font-size: 8px !important;
      font-weight: 700;
    }

    .priority.high {
      background: #fef2f2;
      color: #dc2626 !important;
    }

    .priority.medium {
      background: #fff7ed;
      color: #ea580c !important;
    }

    .priority.low {
      background: #f1f5f9;
      color: #64748b !important;
    }

    @media (max-width: 900px) {
      .metrics {
        grid-template-columns: repeat(3, 1fr);
      }

      .analysis-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .hero {
        display: block;
      }

      .hero-actions {
        margin-top: 15px;
      }

      .metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .pipeline-track {
        overflow-x: auto;
      }
    }
  `]
})
export class MeetingAnalysisComponent {

  constructor(private route: ActivatedRoute) {}

  participants = [
    { name: 'Ahmed Hassan', role: 'Product Lead', initials: 'AH' },
    { name: 'Sarah Miller', role: 'Engineering Lead', initials: 'SM' },
    { name: 'David Chen', role: 'Security', initials: 'DC' },
    { name: 'James Wilson', role: 'Backend', initials: 'JW' },
    { name: 'Emily Stone', role: 'Design', initials: 'ES' },
    { name: 'Michael Lee', role: 'Frontend', initials: 'ML' }
  ];
}