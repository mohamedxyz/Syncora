
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  duration: string;
  status: 'Analyzed' | 'Processing' | 'Pending';
  actions: number;
  decisions: number;
  confidence: number;
}

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="meetings-page">

      <div class="page-header">
        <div>
          <div class="eyebrow">WORKSPACE</div>
          <h1>Meetings</h1>
          <p>
            Review meetings, analysis results, actions and decisions.
          </p>
        </div>

        <button class="primary-button">
          + New Meeting
        </button>
      </div>

      <div class="toolbar">

        <div class="tabs">
          <button
            [class.active]="filter === 'all'"
            (click)="filter = 'all'"
          >
            All
            <span>{{ meetings.length }}</span>
          </button>

          <button
            [class.active]="filter === 'analyzed'"
            (click)="filter = 'analyzed'"
          >
            Analyzed
          </button>

          <button
            [class.active]="filter === 'processing'"
            (click)="filter = 'processing'"
          >
            Processing
          </button>
        </div>

        <div class="toolbar-right">
          <button class="filter-button">≡ Filter</button>
          <button class="filter-button">↕ Sort</button>
        </div>

      </div>

      <div class="meeting-list">

        @for (meeting of filteredMeetings; track meeting.id) {

          <a
            class="meeting-card"
            [routerLink]="['/meetings', meeting.id]"
          >

            <div class="meeting-main">

              <div class="meeting-icon">
                ◫
              </div>

              <div class="meeting-info">

                <div class="title-row">
                  <h2>{{ meeting.title }}</h2>

                  <span
                    class="status"
                    [class.analyzed]="meeting.status === 'Analyzed'"
                    [class.processing]="meeting.status === 'Processing'"
                    [class.pending]="meeting.status === 'Pending'"
                  >
                    <i></i>
                    {{ meeting.status }}
                  </span>
                </div>

                <div class="metadata">
                  <span>{{ meeting.date }}</span>
                  <span>·</span>
                  <span>{{ meeting.time }}</span>
                  <span>·</span>
                  <span>{{ meeting.duration }}</span>
                </div>

                <div class="attendees">
                  @for (person of meeting.attendees; track person) {
                    <span class="avatar">{{ initials(person) }}</span>
                  }
                  <span class="attendee-count">
                    {{ meeting.attendees.length }} attendees
                  </span>
                </div>

              </div>

            </div>

            <div class="meeting-stats">

              <div class="stat">
                <strong>{{ meeting.actions }}</strong>
                <span>Actions</span>
              </div>

              <div class="stat">
                <strong>{{ meeting.decisions }}</strong>
                <span>Decisions</span>
              </div>

              <div class="stat confidence">
                <strong>{{ meeting.confidence }}%</strong>
                <span>Confidence</span>
              </div>

              <div class="arrow">
                →
              </div>

            </div>

          </a>

        }

      </div>

    </div>
  `,
  styles: [`
    .meetings-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }

    .eyebrow {
      color: #6366f1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 28px;
    }

    .page-header p {
      margin: 7px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .primary-button {
      border: 0;
      border-radius: 8px;
      padding: 11px 17px;
      background: #4f46e5;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .tabs {
      display: flex;
      gap: 5px;
      padding: 4px;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .tabs button {
      border: 0;
      border-radius: 6px;
      padding: 8px 12px;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      cursor: pointer;
    }

    .tabs button.active {
      background: white;
      color: #334155;
      box-shadow: 0 1px 3px #00000010;
      font-weight: 600;
    }

    .tabs span {
      margin-left: 5px;
      color: #94a3b8;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }

    .filter-button {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #64748b;
      font-size: 12px;
      cursor: pointer;
    }

    .meeting-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meeting-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      text-decoration: none;
      transition: .15s ease;
    }

    .meeting-card:hover {
      border-color: #c7d2fe;
      box-shadow: 0 4px 14px #0f172a0a;
      transform: translateY(-1px);
    }

    .meeting-main {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      min-width: 0;
    }

    .meeting-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 18px;
    }

    .meeting-info {
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    h2 {
      margin: 0;
      color: #1e293b;
      font-size: 14px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 7px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
    }

    .status i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .status.analyzed {
      background: #ecfdf5;
      color: #059669;
    }

    .status.processing {
      background: #eff6ff;
      color: #2563eb;
    }

    .status.pending {
      background: #f8fafc;
      color: #64748b;
    }

    .metadata {
      display: flex;
      gap: 7px;
      margin-top: 7px;
      color: #94a3b8;
      font-size: 11px;
    }

    .attendees {
      display: flex;
      align-items: center;
      margin-top: 12px;
    }

    .avatar {
      width: 25px;
      height: 25px;
      margin-right: -5px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 8px;
      font-weight: 700;
    }

    .avatar:nth-child(2n) {
      background: #dcfce7;
      color: #15803d;
    }

    .avatar:nth-child(3n) {
      background: #fef3c7;
      color: #b45309;
    }

    .attendee-count {
      margin-left: 12px;
      color: #94a3b8;
      font-size: 10px;
    }

    .meeting-stats {
      display: flex;
      align-items: center;
      gap: 28px;
      flex-shrink: 0;
    }

    .stat {
      min-width: 55px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .stat strong {
      color: #334155;
      font-size: 15px;
    }

    .stat span {
      color: #94a3b8;
      font-size: 9px;
    }

    .stat.confidence strong {
      color: #059669;
    }

    .arrow {
      color: #94a3b8;
      font-size: 20px;
    }

    @media (max-width: 800px) {
      .meeting-card {
        align-items: flex-start;
      }

      .meeting-stats {
        display: none;
      }
    }
  `]
})
export class MeetingListComponent {

  filter: 'all' | 'analyzed' | 'processing' = 'all';

  meetings: Meeting[] = [
    {
      id: 'weekly-engineering',
      title: 'Weekly Engineering Sync',
      date: 'Mar 14, 2026',
      time: '10:00 AM',
      duration: '48 min',
      attendees: [
        'Ahmed Hassan',
        'Sarah Miller',
        'David Chen',
        'James Wilson'
      ],
      status: 'Analyzed',
      actions: 12,
      decisions: 4,
      confidence: 94
    },
    {
      id: 'product-planning',
      title: 'Product Planning — Q2',
      date: 'Mar 13, 2026',
      time: '2:00 PM',
      duration: '1h 12 min',
      attendees: [
        'Ahmed Hassan',
        'Emily Stone',
        'Michael Lee'
      ],
      status: 'Analyzed',
      actions: 8,
      decisions: 7,
      confidence: 91
    },
    {
      id: 'architecture-review',
      title: 'Architecture Review',
      date: 'Mar 13, 2026',
      time: '11:30 AM',
      duration: '42 min',
      attendees: [
        'David Chen',
        'Sarah Miller',
        'James Wilson'
      ],
      status: 'Analyzed',
      actions: 5,
      decisions: 3,
      confidence: 89
    },
    {
      id: 'design-sync',
      title: 'Design & Engineering Sync',
      date: 'Mar 12, 2026',
      time: '4:00 PM',
      duration: '36 min',
      attendees: [
        'Ahmed Hassan',
        'Emily Stone'
      ],
      status: 'Processing',
      actions: 0,
      decisions: 0,
      confidence: 0
    },
    {
      id: 'leadership',
      title: 'Leadership Weekly',
      date: 'Mar 11, 2026',
      time: '9:00 AM',
      duration: '55 min',
      attendees: [
        'Ahmed Hassan',
        'Michael Lee',
        'Sarah Miller',
        'James Wilson'
      ],
      status: 'Analyzed',
      actions: 9,
      decisions: 5,
      confidence: 96
    }
  ];

  get filteredMeetings(): Meeting[] {
    if (this.filter === 'analyzed') {
      return this.meetings.filter(m => m.status === 'Analyzed');
    }

    if (this.filter === 'processing') {
      return this.meetings.filter(m => m.status === 'Processing');
    }

    return this.meetings;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}