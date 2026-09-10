import { Component, computed, inject, signal, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { InsightCategory, Meeting, MeetingInsight, TranscriptEntry } from '../../core/models/actionsync.model';
import { ConfidencePipe } from '../../shared/pipes/confidence.pipe';

@Component({
  selector: 'app-meeting-analysis',
  standalone: true,
  imports: [RouterLink, ConfidencePipe],
  template: `
    <div class="analysis-page">

      <!-- TOP NAV BREADCRUMB -->
      <div class="back-row">
        <a routerLink="/meetings" class="back-link">
          ← Back to Meetings
        </a>
        <div class="breadcrumb-trail">
          <span>/</span>
          <span>{{ currentMeeting()?.department || 'Workspace' }}</span>
          <span>/</span>
          <span class="active">{{ currentMeeting()?.title || 'Meeting Details' }}</span>
        </div>
      </div>

      @if (!currentMeeting()) {
        <!-- ERROR / NOT FOUND STATE -->
        <div class="not-found-state">
          <div class="nf-icon">◫</div>
          <h2>Meeting not found</h2>
          <p>The requested meeting analysis could not be located or has been archived.</p>
          <a routerLink="/meetings" class="primary-btn">Return to Meetings Directory</a>
        </div>
      } @else if (currentMeeting()!.status === 'Processing') {
        <!-- PROCESSING STATE -->
        <div class="processing-card">
          <div class="proc-spinner"></div>
          <h2>AI Intelligence Pipeline is Processing</h2>
          <p>
            Audio ingestion and speaker diarization are underway for <strong>{{ currentMeeting()!.title }}</strong>.
          </p>
          <div class="pipeline-progress">
            <div class="step done">✓ Audio Ingested</div>
            <div class="step active">↻ NLP Diarization (68%)</div>
            <div class="step pending">Extracting Decisions</div>
            <div class="step pending">Detecting Conflicts</div>
          </div>
          <button class="primary-btn" (click)="simulateProcessingFinish()">
            Fast-Forward Processing (Demo)
          </button>
        </div>
      } @else {
        <!-- HERO SECTION -->
        <section class="hero">
          <div class="hero-details">
            <div class="eyebrow-row">
              <span class="eyebrow">MEETING INTELLIGENCE</span>
              <span class="dept-tag">{{ currentMeeting()!.department }}</span>
            </div>

            <h1>{{ currentMeeting()!.title }}</h1>

            <div class="metadata">
              <span>📅 {{ currentMeeting()!.date }}</span>
              <span>·</span>
              <span>⏰ {{ currentMeeting()!.time }}</span>
              <span>·</span>
              <span>⏱ {{ currentMeeting()!.duration }}</span>
              <span>·</span>
              <span>Host: {{ currentMeeting()!.owner.name }}</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="secondary-btn" (click)="copyShareLink()">
              {{ copied() ? '✓ Copied Link' : 'Share Analysis' }}
            </button>
            <button class="primary-btn" (click)="exportAnalysisReport()">
              Export Intel Report
            </button>
          </div>
        </section>

        <!-- PIPELINE STATUS TRACK -->
        <section class="pipeline-card">
          <div class="pipeline-header">
            <span>PIPELINE EXECUTION STATUS</span>
            <span class="conf-badge">
              <strong>94% Confidence</strong> · Automated Extraction Verified
            </span>
          </div>

          <div class="pipeline-track">
            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Audio & Diarization</span>
            </div>
            <div class="line complete"></div>

            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Executive Summary</span>
            </div>
            <div class="line complete"></div>

            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Key Insights ({{ currentMeeting()!.insights.length }})</span>
            </div>
            <div class="line complete"></div>

            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Decisions ({{ meetingDecisions().length }})</span>
            </div>
            <div class="line complete"></div>

            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Action Items ({{ meetingActions().length }})</span>
            </div>
            <div class="line complete"></div>

            <div class="track-step complete">
              <div class="step-dot">✓</div>
              <span>Conflict Scan</span>
            </div>
          </div>
        </section>

        <!-- SUMMARY METRICS ROW -->
        <section class="metrics-row">
          <div class="metric-card">
            <span>Participants</span>
            <strong>{{ currentMeeting()!.participants.length }}</strong>
          </div>
          <div class="metric-card">
            <span>Topics</span>
            <strong>{{ currentMeeting()!.keyTopics.length }}</strong>
          </div>
          <div class="metric-card green">
            <span>Action Items</span>
            <strong>{{ meetingActions().length }}</strong>
          </div>
          <div class="metric-card blue">
            <span>Decisions</span>
            <strong>{{ meetingDecisions().length }}</strong>
          </div>
          <div class="metric-card purple">
            <span>Strategic Insights</span>
            <strong>{{ currentMeeting()!.insights.length }}</strong>
          </div>
          <div class="metric-card">
            <span>AI Confidence</span>
            <strong class="text-success">{{ currentMeeting()!.confidence }}%</strong>
          </div>
        </section>

        <!-- NAVIGATION TABS -->
        <section class="tab-bar">
          <button [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">
            Overview & Summary
          </button>
          <button [class.active]="activeTab() === 'insights'" (click)="activeTab.set('insights')">
            Insights
            <span class="tab-count">{{ currentMeeting()!.insights.length }}</span>
          </button>
          <button [class.active]="activeTab() === 'decisions'" (click)="activeTab.set('decisions')">
            Decisions
            <span class="tab-count">{{ meetingDecisions().length }}</span>
          </button>
          <button [class.active]="activeTab() === 'actions'" (click)="activeTab.set('actions')">
            Action Items
            <span class="tab-count">{{ meetingActions().length }}</span>
          </button>
          <button [class.active]="activeTab() === 'transcript'" (click)="activeTab.set('transcript')">
            Transcript
            <span class="tab-count">{{ meetingTranscript().length }}</span>
          </button>
          <button [class.active]="activeTab() === 'participants'" (click)="activeTab.set('participants')">
            Participants
            <span class="tab-count">{{ currentMeeting()!.participants.length }}</span>
          </button>
        </section>

        <!-- TAB CONTENT AREAS -->

        <!-- 1. OVERVIEW & SUMMARY -->
        @if (activeTab() === 'overview') {
          <div class="tab-view overview-grid">
            <div class="overview-left">
              <div class="card">
                <div class="card-head">
                  <div>
                    <h2>Executive Summary</h2>
                    <span class="head-sub">AI synthesis of dialogue & core outcomes</span>
                  </div>
                  <span class="badge badge-success">High Confidence</span>
                </div>
                <p class="summary-text">{{ currentMeeting()!.summary }}</p>

                @if (currentMeeting()!.purpose) {
                  <div class="purpose-callout">
                    <strong>Meeting Purpose:</strong>
                    <span>{{ currentMeeting()!.purpose }}</span>
                  </div>
                }

                <div class="topics-section">
                  <h3>Key Topics Discussed</h3>
                  <div class="topic-tags">
                    @for (topic of currentMeeting()!.keyTopics; track topic) {
                      <div class="topic-tag">
                        <span>#</span>
                        {{ topic }}
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- HIGH IMPACT HIGHLIGHTS -->
              <div class="card">
                <div class="card-head">
                  <h2>Key Insights Preview</h2>
                  <button class="text-link" (click)="activeTab.set('insights')">View all {{ currentMeeting()!.insights.length }} →</button>
                </div>

                <div class="insights-preview-list">
                  @for (in of currentMeeting()!.insights.slice(0, 3); track in.id) {
                    <div class="insight-row">
                      <span class="cat-pill" [class.strategic]="in.category === 'strategic'" [class.risk]="in.category === 'risk'" [class.opp]="in.category === 'opportunity'">
                        {{ in.category }}
                      </span>
                      <div class="in-body">
                        <strong>{{ in.title }}</strong>
                        <p>{{ in.description }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="overview-right">
              <!-- PARTICIPANTS WIDGET -->
              <div class="card">
                <div class="card-head">
                  <h2>Attendees ({{ currentMeeting()!.participants.length }})</h2>
                  <button class="text-link" (click)="activeTab.set('participants')">All →</button>
                </div>

                <div class="attendees-compact">
                  @for (p of currentMeeting()!.participants; track p.id) {
                    <div class="attendee-mini">
                      <div class="mini-avatar-lead" [style.background]="p.color">
                        {{ p.initials }}
                      </div>
                      <div class="attendee-mini-info">
                        <strong>{{ p.name }}</strong>
                        <span>{{ p.role || 'Participant' }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- DECISIONS PREVIEW WIDGET -->
              <div class="card">
                <div class="card-head">
                  <h2>Decisions Ratified</h2>
                  <button class="text-link" (click)="activeTab.set('decisions')">All →</button>
                </div>

                <div class="decisions-mini-list">
                  @if (meetingDecisions().length === 0) {
                    <div class="mini-empty">No ratified decisions recorded.</div>
                  } @else {
                    @for (d of meetingDecisions(); track d.id) {
                      <div class="decision-mini">
                        <span class="dec-bullet">◆</span>
                        <div>
                          <strong>{{ d.title }}</strong>
                          <span class="dec-owner">Owner: {{ d.owner.name }}</span>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 2. INSIGHTS TAB -->
        @if (activeTab() === 'insights') {
          <div class="tab-view">
            <div class="filter-subbar">
              <div class="sub-tabs">
                <button [class.active]="insightFilter() === 'all'" (click)="insightFilter.set('all')">
                  All ({{ currentMeeting()!.insights.length }})
                </button>
                <button [class.active]="insightFilter() === 'strategic'" (click)="insightFilter.set('strategic')">
                  Strategic
                </button>
                <button [class.active]="insightFilter() === 'risk'" (click)="insightFilter.set('risk')">
                  Risks
                </button>
                <button [class.active]="insightFilter() === 'opportunity'" (click)="insightFilter.set('opportunity')">
                  Opportunities
                </button>
                <button [class.active]="insightFilter() === 'customer_signal'" (click)="insightFilter.set('customer_signal')">
                  Customer Signals
                </button>
              </div>
            </div>

            <div class="insights-grid">
              @if (filteredInsights().length === 0) {
                <div class="empty-state-card">
                  <div class="empty-ico">💡</div>
                  <h3>No insights in this category</h3>
                  <p>Check the "All" tab to view all extracted intelligence points.</p>
                </div>
              } @else {
                @for (insight of filteredInsights(); track insight.id) {
                  <article class="insight-card">
                    <div class="insight-top">
                      <span class="cat-pill" [class.strategic]="insight.category === 'strategic'" [class.risk]="insight.category === 'risk'" [class.opp]="insight.category === 'opportunity'" [class.cust]="insight.category === 'customer_signal'" [class.prob]="insight.category === 'problem'">
                        {{ insight.category }}
                      </span>
                      <div class="insight-top-meta">
                        @if (insight.timestamp) {
                          <span class="in-time">{{ insight.timestamp }}</span>
                        }
                        <span class="conf-pill">{{ insight.confidence }}% conf</span>
                      </div>
                    </div>

                    <h3>{{ insight.title }}</h3>
                    <p class="in-desc">{{ insight.description }}</p>

                    @if (insight.quote) {
                      <blockquote class="in-quote">
                        “{{ insight.quote }}”
                      </blockquote>
                    }

                    <div class="in-footer">
                      <span class="impact-level">
                        Impact: <strong>{{ insight.impact }}</strong>
                      </span>
                      <button class="create-task-btn" (click)="createActionFromInsight(insight)">
                        + Convert to Task
                      </button>
                    </div>
                  </article>
                }
              }
            </div>
          </div>
        }

        <!-- 3. DECISIONS TAB -->
        @if (activeTab() === 'decisions') {
          <div class="tab-view">
            <div class="decisions-container">
              @if (meetingDecisions().length === 0) {
                <div class="empty-state-card">
                  <div class="empty-ico">◆</div>
                  <h3>No decisions recorded in this meeting</h3>
                  <p>Decisions captured during live meetings appear here automatically.</p>
                </div>
              } @else {
                @for (dec of meetingDecisions(); let idx = $index; track dec.id) {
                  <div class="decision-card-full">
                    <div class="dec-num">0{{ idx + 1 }}</div>
                    <div class="dec-main">
                      <div class="dec-head">
                        <h3>{{ dec.title }}</h3>
                        <span class="badge badge-success">{{ dec.status }}</span>
                      </div>
                      <p>{{ dec.description }}</p>
                      @if (dec.context) {
                        <div class="dec-context-note">
                          <strong>Context:</strong> {{ dec.context }}
                        </div>
                      }
                      <div class="dec-footer">
                        <span>Ratified by: <strong>{{ dec.owner.name }}</strong></span>
                        <span>·</span>
                        <span>Confidence: <strong class="text-success">{{ dec.confidence }}%</strong></span>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- 4. ACTION ITEMS TAB -->
        @if (activeTab() === 'actions') {
          <div class="tab-view">
            <div class="action-topbar">
              <div>
                <h2>Action Items Extracted</h2>
                <p>Track accountability and deadlines committed during this session</p>
              </div>
              <button class="primary-btn" (click)="showAddAction.set(true)">
                + Add Action Item
              </button>
            </div>

            <!-- INLINE ADD ACTION FORM -->
            @if (showAddAction()) {
              <div class="inline-add-card">
                <h3>New Action Item</h3>
                <div class="add-form-fields">
                  <input #actTitle placeholder="Task title..." />
                  <input #actDesc placeholder="Task description..." />
                  <input #actDue type="text" placeholder="Due date (e.g. Mar 25, 2026)" />
                  <select #actPri>
                    <option value="high">High Priority</option>
                    <option value="medium" selected>Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div class="add-form-actions">
                  <button class="secondary-btn" (click)="showAddAction.set(false)">Cancel</button>
                  <button class="primary-btn" (click)="saveNewAction(actTitle.value, actDesc.value, actDue.value, actPri.value)">
                    Save Action
                  </button>
                </div>
              </div>
            }

            <div class="actions-list-full">
              @if (meetingActions().length === 0) {
                <div class="empty-state-card">
                  <div class="empty-ico">✓</div>
                  <h3>No action items found for this meeting</h3>
                  <p>Add one manually above or let AI detect commitments during your next sync.</p>
                </div>
              } @else {
                @for (act of meetingActions(); track act.id) {
                  <div class="action-item-full">
                    <div
                      class="checkbox"
                      [class.checked]="act.status === 'done'"
                      (click)="toggleAction(act.id, act.status)"
                    >
                      @if (act.status === 'done') { ✓ }
                    </div>

                    <div class="act-body">
                      <div class="act-title-row">
                        <strong [class.done]="act.status === 'done'">{{ act.title }}</strong>
                        <span class="pri-tag" [class.high]="act.priority === 'high' || act.priority === 'critical'" [class.med]="act.priority === 'medium'">
                          {{ act.priority }}
                        </span>
                      </div>
                      <p class="act-description">{{ act.description }}</p>

                      <div class="act-meta">
                        <span class="act-owner">
                          <span class="avatar-tiny" [style.background]="act.owner.color">{{ act.owner.initials }}</span>
                          {{ act.owner.name }}
                        </span>
                        <span>·</span>
                        <span class="act-due">Due: {{ act.dueDate }}</span>
                        @if (act.decisionId) {
                          <span>·</span>
                          <span class="act-linked">Linked to Decision</span>
                        }
                      </div>
                    </div>

                    <div class="act-status-select">
                      <select [value]="act.status" (change)="onStatusChange(act.id, $any($event.target).value)">
                        <option value="backlog">Backlog</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- 5. TRANSCRIPT TAB -->
        @if (activeTab() === 'transcript') {
          <div class="tab-view transcript-view">
            <div class="transcript-toolbar">
              <div class="trans-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search verbatim transcript dialogue..."
                  [value]="transcriptSearch()"
                  (input)="transcriptSearch.set($any($event.target).value)"
                />
              </div>

              <div class="speaker-filter">
                <label>Filter Speaker:</label>
                <select [value]="selectedSpeaker()" (change)="selectedSpeaker.set($any($event.target).value)">
                  <option value="all">All Speakers</option>
                  @for (speaker of currentMeeting()!.participants; track speaker.id) {
                    <option [value]="speaker.name">{{ speaker.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="transcript-stream">
              @if (filteredTranscript().length === 0) {
                <div class="empty-state-card">
                  <div class="empty-ico">💬</div>
                  <h3>No transcript dialogue matches</h3>
                  <p>Try searching for a different keyword or reset the speaker filter.</p>
                </div>
              } @else {
                @for (entry of filteredTranscript(); track entry.id) {
                  <div class="transcript-utterance" [class.highlighted]="entry.category">
                    <div class="utterance-avatar" [style.background]="entry.speaker.color">
                      {{ entry.speaker.initials }}
                    </div>

                    <div class="utterance-body">
                      <div class="utterance-header">
                        <strong>{{ entry.speaker.name }}</strong>
                        <span class="utterance-time">{{ entry.timestamp }}</span>
                        @if (entry.category) {
                          <span class="tag-category">{{ entry.category }}</span>
                        }
                      </div>

                      <p class="utterance-text">{{ entry.text }}</p>

                      @if (entry.linkedDecisionId) {
                        <div class="linked-bubble">
                          ◆ Linked to ratified decision
                        </div>
                      }
                      @if (entry.linkedActionId) {
                        <div class="linked-bubble green">
                          ✓ Linked to action commitment
                        </div>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- 6. PARTICIPANTS TAB -->
        @if (activeTab() === 'participants') {
          <div class="tab-view">
            <div class="participants-grid">
              @for (person of currentMeeting()!.participants; track person.id) {
                <div class="participant-card-detail">
                  <div class="p-avatar-large" [style.background]="person.color">
                    {{ person.initials }}
                  </div>
                  <div class="p-info">
                    <h3>{{ person.name }}</h3>
                    <span class="p-role">{{ person.role || 'Contributor' }}</span>
                    <span class="p-email">{{ person.email }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .analysis-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .back-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      font-size: 12px;
    }

    .back-link {
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
    }

    .back-link:hover {
      color: #4f46e5;
    }

    .breadcrumb-trail {
      display: flex;
      gap: 6px;
      color: #94a3b8;
    }

    .breadcrumb-trail .active {
      color: #1e293b;
      font-weight: 600;
    }

    /* HERO */
    .hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 22px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .eyebrow-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .eyebrow {
      color: #6366f1;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.4px;
    }

    .dept-tag {
      background: #eef2ff;
      color: #4f46e5;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: 26px;
      font-weight: 750;
      letter-spacing: -0.5px;
    }

    .metadata {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      color: #64748b;
      font-size: 12px;
      flex-wrap: wrap;
    }

    .hero-actions {
      display: flex;
      gap: 10px;
    }

    .primary-btn, .secondary-btn {
      padding: 9px 15px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.15s ease;
    }

    .primary-btn {
      border: 0;
      background: #4f46e5;
      color: white;
    }

    .primary-btn:hover {
      background: #4338ca;
    }

    .secondary-btn {
      border: 1px solid #cbd5e1;
      background: white;
      color: #334155;
    }

    .secondary-btn:hover {
      background: #f8fafc;
    }

    /* PIPELINE TRACK */
    .pipeline-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }

    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #94a3b8;
    }

    .conf-badge strong {
      color: #059669;
      letter-spacing: 0;
    }

    .pipeline-track {
      display: flex;
      align-items: center;
      margin-top: 14px;
      overflow-x: auto;
    }

    .track-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 80px;
    }

    .step-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ecfdf5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }

    .track-step span {
      font-size: 10px;
      color: #475569;
      font-weight: 500;
      white-space: nowrap;
    }

    .line {
      flex: 1;
      height: 2px;
      background: #d1fae5;
      margin-bottom: 16px;
      min-width: 20px;
    }

    /* METRICS */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .metric-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 14px 16px;
    }

    .metric-card span {
      display: block;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
    }

    .metric-card strong {
      display: block;
      font-size: 22px;
      color: #1e293b;
      margin-top: 4px;
    }

    .metric-card.green strong { color: #059669; }
    .metric-card.blue strong { color: #2563eb; }
    .metric-card.purple strong { color: #7c3aed; }

    /* TAB BAR */
    .tab-bar {
      display: flex;
      gap: 4px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 8px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .tab-bar button {
      border: 0;
      border-radius: 6px;
      padding: 8px 16px;
      background: transparent;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .tab-bar button.active {
      background: white;
      color: #1e293b;
      font-weight: 650;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .tab-count {
      font-size: 10px;
      background: #e2e8f0;
      color: #475569;
      padding: 1px 6px;
      border-radius: 999px;
    }

    .tab-bar button.active .tab-count {
      background: #eef2ff;
      color: #4f46e5;
    }

    /* OVERVIEW GRID */
    .overview-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 18px;
    }

    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 22px;
      margin-bottom: 18px;
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-head h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .head-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .summary-text {
      font-size: 13px;
      color: #334155;
      line-height: 1.8;
      margin-bottom: 16px;
    }

    .purpose-callout {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: #475569;
      margin-bottom: 16px;
    }

    .purpose-callout strong {
      color: #0f172a;
      margin-right: 6px;
    }

    .topics-section h3 {
      font-size: 12px;
      color: #475569;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .topic-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .topic-tag {
      background: #f1f5f9;
      color: #334155;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .topic-tag span {
      color: #6366f1;
      font-weight: 700;
    }

    .text-link {
      border: 0;
      background: transparent;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .insights-preview-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .insight-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 1px solid #f8fafc;
      padding-bottom: 10px;
    }

    .cat-pill {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cat-pill.strategic { background: #eef2ff; color: #4f46e5; }
    .cat-pill.risk { background: #fee2e2; color: #dc2626; }
    .cat-pill.opp { background: #ecfdf5; color: #059669; }
    .cat-pill.cust { background: #fff7ed; color: #ea580c; }
    .cat-pill.prob { background: #fef2f2; color: #b91c1c; }

    .in-body strong {
      display: block;
      font-size: 12px;
      color: #1e293b;
    }

    .in-body p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .attendees-compact {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .attendee-mini {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .mini-avatar-lead {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: white;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .attendee-mini-info strong {
      display: block;
      font-size: 12px;
      color: #1e293b;
    }

    .attendee-mini-info span {
      display: block;
      font-size: 10px;
      color: #94a3b8;
    }

    .decisions-mini-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .decision-mini {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .dec-bullet {
      color: #4f46e5;
      font-size: 10px;
      margin-top: 2px;
    }

    .decision-mini strong {
      display: block;
      font-size: 12px;
      color: #1e293b;
    }

    .dec-owner {
      font-size: 10px;
      color: #94a3b8;
    }

    /* INSIGHTS GRID */
    .filter-subbar {
      margin-bottom: 16px;
    }

    .sub-tabs {
      display: flex;
      gap: 6px;
    }

    .sub-tabs button {
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 11px;
      color: #64748b;
      cursor: pointer;
    }

    .sub-tabs button.active {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
      font-weight: 600;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .insight-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .insight-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .insight-top-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .in-time {
      font-size: 10px;
      color: #94a3b8;
    }

    .conf-pill {
      font-size: 9px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .insight-card h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .in-desc {
      margin: 0;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      flex: 1;
    }

    .in-quote {
      margin: 4px 0 0;
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #cbd5e1;
      font-size: 11px;
      font-style: italic;
      color: #64748b;
      border-radius: 0 6px 6px 0;
    }

    .in-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
      margin-top: 4px;
    }

    .impact-level {
      font-size: 11px;
      color: #64748b;
    }

    .impact-level strong {
      text-transform: capitalize;
      color: #1e293b;
    }

    .create-task-btn {
      border: 1px solid #cbd5e1;
      background: white;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #4f46e5;
      cursor: pointer;
    }

    .create-task-btn:hover {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    /* DECISIONS TAB FULL */
    .decisions-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .decision-card-full {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .dec-num {
      color: #a5b4fc;
      font-size: 18px;
      font-weight: 800;
      line-height: 1;
    }

    .dec-main {
      flex: 1;
    }

    .dec-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .dec-head h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .dec-main p {
      margin: 0 0 10px;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }

    .dec-context-note {
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      color: #475569;
      margin-bottom: 10px;
    }

    .dec-footer {
      display: flex;
      gap: 10px;
      font-size: 11px;
      color: #94a3b8;
    }

    /* ACTION ITEMS TAB FULL */
    .action-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .action-topbar h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .action-topbar p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
    }

    .inline-add-card {
      background: white;
      border: 1px solid #c7d2fe;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .inline-add-card h3 {
      margin: 0 0 10px;
      font-size: 13px;
      color: #4f46e5;
    }

    .add-form-fields {
      display: grid;
      grid-template-columns: 1.5fr 2fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .add-form-fields input, .add-form-fields select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      outline: 0;
    }

    .add-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .actions-list-full {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-item-full {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1.5px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 12px;
      flex-shrink: 0;
    }

    .checkbox.checked {
      background: #10b981;
      border-color: #10b981;
    }

    .act-body {
      flex: 1;
      min-width: 0;
    }

    .act-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .act-title-row strong {
      font-size: 13px;
      color: #1e293b;
    }

    .act-title-row strong.done {
      text-decoration: line-through;
      color: #94a3b8;
    }

    .pri-tag {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .pri-tag.high { background: #fee2e2; color: #dc2626; }
    .pri-tag.med { background: #fff7ed; color: #ea580c; }

    .act-description {
      margin: 4px 0 6px;
      font-size: 11px;
      color: #64748b;
    }

    .act-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #94a3b8;
    }

    .act-owner {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #475569;
    }

    .avatar-tiny {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      color: white;
      font-size: 7px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .act-linked {
      color: #4f46e5;
      font-weight: 600;
    }

    .act-status-select select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 11px;
      color: #334155;
      background: white;
    }

    /* TRANSCRIPT TAB */
    .transcript-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .trans-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      width: 360px;
      color: #94a3b8;
    }

    .trans-search input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 12px;
      color: #1e293b;
    }

    .speaker-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;
    }

    .speaker-filter select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 12px;
      color: #1e293b;
      background: white;
    }

    .transcript-stream {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transcript-utterance {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      gap: 14px;
    }

    .transcript-utterance.highlighted {
      border-left: 3px solid #6366f1;
    }

    .utterance-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .utterance-body {
      flex: 1;
    }

    .utterance-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .utterance-header strong {
      font-size: 12px;
      color: #0f172a;
    }

    .utterance-time {
      font-size: 10px;
      color: #94a3b8;
    }

    .tag-category {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 4px;
      background: #eef2ff;
      color: #4f46e5;
    }

    .utterance-text {
      margin: 0;
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }

    .linked-bubble {
      display: inline-block;
      margin-top: 6px;
      font-size: 10px;
      font-weight: 600;
      color: #4f46e5;
      background: #eef2ff;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .linked-bubble.green {
      color: #059669;
      background: #ecfdf5;
    }

    /* PARTICIPANTS TAB */
    .participants-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .participant-card-detail {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 11px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .p-avatar-large {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      color: white;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .p-info h3 {
      margin: 0;
      font-size: 13px;
      color: #0f172a;
    }

    .p-role {
      display: block;
      font-size: 11px;
      color: #4f46e5;
      font-weight: 600;
      margin-top: 2px;
    }

    .p-email {
      display: block;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 1px;
    }

    /* PROCESSING STATE */
    .processing-card {
      background: white;
      border: 1px solid #c7d2fe;
      border-radius: 14px;
      padding: 48px 24px;
      text-align: center;
      max-width: 600px;
      margin: 40px auto;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.08);
    }

    .proc-spinner {
      width: 44px;
      height: 44px;
      border: 3px solid #e0e7ff;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .processing-card h2 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #0f172a;
    }

    .processing-card p {
      margin: 0 0 24px;
      font-size: 13px;
      color: #64748b;
    }

    .pipeline-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 12px;
    }

    .pipeline-progress .step.done { color: #059669; font-weight: 600; }
    .pipeline-progress .step.active { color: #4f46e5; font-weight: 700; }
    .pipeline-progress .step.pending { color: #94a3b8; }

    /* EMPTY STATES */
    .empty-state-card {
      background: white;
      border: 1px dashed #cbd5e1;
      border-radius: 11px;
      padding: 40px 20px;
      text-align: center;
      grid-column: span 2;
    }

    .empty-ico {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .empty-state-card h3 {
      margin: 0 0 4px;
      font-size: 14px;
      color: #1e293b;
    }

    .empty-state-card p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }

    .not-found-state {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
    }

    .nf-icon {
      font-size: 32px;
      color: #94a3b8;
      margin-bottom: 14px;
    }

    .not-found-state h2 {
      margin: 0 0 6px;
      font-size: 18px;
      color: #0f172a;
    }

    .not-found-state p {
      margin: 0 0 20px;
      font-size: 13px;
      color: #64748b;
    }

    @media (max-width: 950px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
      .insights-grid {
        grid-template-columns: 1fr;
      }
      .participants-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .metrics-row {
        grid-template-columns: repeat(3, 1fr);
      }
      .add-form-fields {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .metrics-row {
        grid-template-columns: repeat(2, 1fr);
      }
      .participants-grid {
        grid-template-columns: 1fr;
      }
      .trans-search {
        width: 100%;
      }
    }
  `]
})
export class MeetingAnalysisComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly store = inject(StoreService);

  meetingId = signal<string>('weekly-engineering');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.meetingId.set(id);
    }
  }

  readonly currentMeeting = computed(() => {
    const id = this.meetingId();
    return this.store.meetings().find(m => m.id === id) || this.store.meetings()[0];
  });

  readonly activeTab = signal<'overview' | 'insights' | 'decisions' | 'actions' | 'transcript' | 'participants'>('overview');
  readonly insightFilter = signal<string>('all');
  readonly transcriptSearch = signal('');
  readonly selectedSpeaker = signal('all');
  readonly showAddAction = signal(false);
  readonly copied = signal(false);

  readonly meetingDecisions = computed(() => {
    const m = this.currentMeeting();
    if (!m) return [];
    return this.store.decisions().filter(d => d.meetingId === m.id);
  });

  readonly meetingActions = computed(() => {
    const m = this.currentMeeting();
    if (!m) return [];
    return this.store.actions().filter(a => a.meetingId === m.id);
  });

  readonly meetingTranscript = computed(() => {
    const m = this.currentMeeting();
    return m?.transcript || [];
  });

  readonly filteredInsights = computed(() => {
    const m = this.currentMeeting();
    if (!m) return [];
    if (this.insightFilter() === 'all') return m.insights;
    return m.insights.filter(i => i.category === this.insightFilter());
  });

  readonly filteredTranscript = computed(() => {
    let list = this.meetingTranscript();
    const speaker = this.selectedSpeaker();
    if (speaker !== 'all') {
      list = list.filter(t => t.speaker.name === speaker);
    }

    const query = this.transcriptSearch().toLowerCase().trim();
    if (query) {
      list = list.filter(t => t.text.toLowerCase().includes(query) || t.speaker.name.toLowerCase().includes(query));
    }

    return list;
  });

  toggleAction(id: string, currentStatus: string): void {
    const next = currentStatus === 'done' ? 'in-progress' : 'done';
    this.store.updateActionStatus(id, next as any);
  }

  onStatusChange(id: string, newStatus: string): void {
    this.store.updateActionStatus(id, newStatus as any);
  }

  saveNewAction(title: string, desc: string, due: string, priority: string): void {
    if (!title.trim()) return;
    const m = this.currentMeeting()!;

    this.store.createAction({
      title: title.trim(),
      description: desc.trim() || 'Action committed during meeting',
      status: 'backlog',
      priority: priority as any,
      owner: this.store.currentUser(),
      dueDate: due.trim() || 'Mar 25, 2026',
      meetingId: m.id,
      meetingTitle: m.title,
      confidence: 100
    });

    this.showAddAction.set(false);
  }

  createActionFromInsight(insight: MeetingInsight): void {
    const m = this.currentMeeting()!;
    this.store.createAction({
      title: `Follow up: ${insight.title}`,
      description: insight.description,
      status: 'backlog',
      priority: insight.impact === 'high' ? 'high' : 'medium',
      owner: this.store.currentUser(),
      dueDate: 'Mar 26, 2026',
      meetingId: m.id,
      meetingTitle: m.title,
      confidence: insight.confidence
    });
    this.activeTab.set('actions');
  }

  simulateProcessingFinish(): void {
    const m = this.currentMeeting();
    if (!m) return;
    this.store.meetings.update(list =>
      list.map(item =>
        item.id === m.id
          ? {
              ...item,
              status: 'Analyzed',
              analyzed: true,
              confidence: 93,
              actionCount: 6,
              decisionCount: 2,
              summary: 'Design tokens and typography specifications verified across desktop and mobile form factors.',
              insights: [
                {
                  id: `in-${Date.now()}`,
                  category: 'strategic',
                  title: 'Single Design Token System Established',
                  description: 'Engineering and Design unified color tokens into SCSS maps, preventing drift across feature views.',
                  impact: 'high',
                  confidence: 96
                }
              ]
            }
          : item
      )
    );
  }

  copyShareLink(): void {
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }

  exportAnalysisReport(): void {
    const m = this.currentMeeting();
    if (!m) return;

    const report = `# Meeting Intelligence Report: ${m.title}
Date: ${m.date} ${m.time} (${m.duration})
Department: ${m.department}
Confidence: ${m.confidence}%

## Executive Summary
${m.summary}

## Key Topics
${m.keyTopics.map(t => `- ${t}`).join('\n')}

## Ratified Decisions
${this.meetingDecisions().map(d => `- [${d.status.toUpperCase()}] ${d.title} (Owner: ${d.owner.name})`).join('\n')}

## Action Commitments
${this.meetingActions().map(a => `- [${a.status.toUpperCase()}] ${a.title} -> Assignee: ${a.owner.name}, Due: ${a.dueDate}`).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${m.id}-intel-report.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
}