# Drilldown Implementation Plan

## Overview Page Interactive Features Development

**Created:** January 9, 2026
**Status:** Planning Complete
**Target:** Transform static Overview dashboard into fully interactive ops control plane

---

## Executive Summary

The Overview page currently displays 5 KPI cards and 3 analytics sections (Submissions Trend, Failure Categories, At-Risk Agents) with "View details" links that are non-functional. This plan outlines the implementation of interactive drilldown workflows that enable Store Ops PMs to quickly drill from high-level metrics to actionable insights.

### Business Value
- **Reduce mean-time-to-insight** from 15+ mins (manual data exploration) to <30 seconds
- **Enable root-cause analysis** directly from KPI anomalies
- **Support the core user journey**: "What's breaking SLAs this week?" → root cause → action plan

---

## Current State Analysis

### What Exists (85% Visually Complete)
| Component | UI Status | Interactivity |
|-----------|-----------|---------------|
| KPI Tiles (5) | Fully styled | No click handlers |
| Submissions vs Approvals Chart | Functional chart | "View details" decorative |
| Failure Categories Chart | Functional chart | "View details" decorative |
| At-Risk Agents Table | Fully styled | Row clicks not wired |
| Agent Detail Page | Complete | Not linked from Overview |

### What's Missing
- Dialog/Modal component for quick-view overlays
- KPI tile click handlers and expanded views
- Chart drilldown navigation
- Table row click handlers
- Filter propagation to drilldown pages

---

## Architecture Decision: Modal vs Full-Page Drilldowns

After analyzing Power BI interaction patterns and the operational workflow needs:

### Hybrid Approach Recommended
1. **KPI Cards** → Modal overlay with expanded metrics + "Go to full page" option
2. **Chart "View details"** → Navigate to dedicated drilldown page
3. **At-Risk Agents rows** → Navigate to existing Agent Detail page

**Rationale:**
- Modals keep context for quick metric exploration
- Full pages allow deeper analysis with filters and tables
- Matches Power BI drillthrough behavior (click-to-detail navigation)

---

## Implementation Plan

### Phase 1: Foundation Components
**Effort:** 2-3 hours

#### 1.1 Create Dialog Component
Create `src/components/ui/Dialog.tsx` following Radix UI/Shadcn patterns:

```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

Features:
- Backdrop with click-to-close
- Keyboard navigation (Escape to close)
- Focus trap for accessibility
- Smooth enter/exit animations
- Obsidian Aurora themed styling

#### 1.2 Create KPIDetailCard Component
Reusable component for modal content showing:
- Metric value with trend indicator
- Sparkline mini-chart (last 7 days)
- Contributing factors breakdown
- Natural language insight sentence
- Link to relevant full page

---

### Phase 2: KPI Card Drilldowns
**Effort:** 4-5 hours

Each of the 5 KPI cards becomes clickable with a modal showing expanded context.

#### 2.1 Time to Publish (4.2 days p50)

**Modal Content:**
| Section | Data |
|---------|------|
| Primary Metric | 4.2 days (p50), 7.8 days (p90) |
| Trend | -12% vs last period (improving) |
| Sparkline | 7-day trend |
| Breakdown | By stage: Submission→Review (1.2d), Review→Decision (2.1d), Decision→Published (0.9d) |
| Top Bottlenecks | "Action Required" stage has 8 agents stuck >5 days |
| Insight | "68% of time-to-publish is spent in manual review. Consider scaling reviewer capacity or improving pre-validation." |
| Action Link | "View Publishing Funnel →" navigates to `/funnel` |

**Data Source:** `/api/metrics?type=leadTime` + stage duration calculations

#### 2.2 First-Pass Approval Rate (68%)

**Modal Content:**
| Section | Data |
|---------|------|
| Primary Metric | 68% first-pass approval |
| Trend | -5% vs last period (degrading) |
| Comparison | Target: 80%, Industry benchmark: 72% |
| Failure Distribution | Pie chart showing rejection reasons |
| Top Failures | 1. RAI Violation (28%), 2. Metadata Issues (22%), 3. Manifest Mismatch (18%) |
| Insight | "RAI violations spiked 3x this week due to new content policy checks. 4 publishers need remediation guidance." |
| Action Link | "View Quality Metrics →" navigates to `/quality` |

**Data Source:** `/api/metrics?type=approvalRate` + `/api/snapshots` aggregates

#### 2.3 SLA Compliance (82%)

**Modal Content:**
| Section | Data |
|---------|------|
| Primary Metric | 82% within SLA |
| Trend | -8% vs last period (degrading) |
| SLA Targets | Standard: 5 days, Expedited: 2 days |
| Breach Count | 12 agents currently in SLA breach |
| At-Risk | 7 agents approaching SLA deadline (24-48 hours) |
| By Publisher | Contoso Ltd: 2 breaches, Fabrikam: 3 breaches |
| Insight | "SLA breaches concentrated in manual review phase. 3 publishers account for 67% of breaches—consider dedicated support." |
| Action Link | "View SLA Breaches →" navigates to `/agents?filter=sla-breach` |

**Data Source:** `/api/incidents?type=sla` + `/api/submissions?slaStatus=breached`

#### 2.4 RAI Pass Rate (91%)

**Modal Content:**
| Section | Data |
|---------|------|
| Primary Metric | 91% RAI compliant |
| Trend | +3% vs last period (improving) |
| Failure Types | Content policy: 5, Prompt safety: 2, Output guardrails: 2 |
| By Agent Type | Declarative: 94%, Custom Engine: 87% |
| Recent Failures | List of 3 most recent RAI failures with agent names |
| Insight | "Custom engine agents fail RAI checks 2x more than declarative agents. Recommend enhanced pre-submission validation for custom agents." |
| Action Link | "View RAI Failures →" navigates to `/quality?category=rai_violation` |

**Data Source:** `/api/metrics?type=rai` + validation findings aggregates

#### 2.5 Active Incidents (3)

**Modal Content:**
| Section | Data |
|---------|------|
| Primary Metric | 3 active incidents |
| Trend | +2 vs last period (increasing) |
| By Severity | Critical: 1, High: 1, Medium: 1 |
| Breakdown Table | Agent name, Type, Days open, Owner |
| Critical Alert | "Sales Assistant Pro" - Runtime errors affecting 1.2k users |
| Insight | "1 critical incident requires immediate attention: agent failing 23% of invocations. Recommend temporary rollback." |
| Action Link | "View All Incidents →" navigates to `/incidents` (new page) |

**Data Source:** `/api/incidents?status=active`

---

### Phase 3: Chart Drilldown Pages
**Effort:** 4-5 hours

#### 3.1 Submissions Trend Drilldown (`/overview/submissions-trend`)

**Purpose:** Detailed analysis of submission and approval patterns over time

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Overview    Submissions vs Approvals Analysis     │
├─────────────────────────────────────────────────────────────┤
│ Date Range: [Last 30 days ▼]  Publisher: [All ▼]  Status: [All ▼] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ Total Submissions   │ │ Total Approvals     │ │ Approval Rate       │ │
│ │ 187                 │ │ 127                 │ │ 68%                 │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Expanded Line Chart - Submissions & Approvals with tooltips]        │
│ - Click any data point to see that day's submissions                 │
├─────────────────────────────────────────────────────────────┤
│ Daily Breakdown Table                                                │
│ Date        | Submissions | Approvals | Rejections | Pending        │
│ Jan 9, 2026 |     6       |     4     |     1      |    1           │
│ Jan 8, 2026 |     8       |     5     |     2      |    1           │
│ ...         |             |           |            |                │
├─────────────────────────────────────────────────────────────┤
│ AI Insight: "Submission volume peaks on Mondays (avg 9.2).          │
│ Consider staffing review capacity accordingly."                      │
└─────────────────────────────────────────────────────────────┘
```

**Data Source:** `/api/snapshots?startDate=X&endDate=Y` with date range filter

**New Components Needed:**
- `SubmissionsTrendDetail.tsx` - Page component
- `DailySubmissionsTable.tsx` - Data table with sorting

#### 3.2 Failure Categories Drilldown (`/overview/failures`)

**Purpose:** Deep-dive into validation failure patterns for root cause analysis

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Overview    Failure Category Analysis             │
├─────────────────────────────────────────────────────────────┤
│ Date Range: [Last 30 days ▼]  Severity: [All ▼]  Publisher: [All ▼] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ Total Failures      │ │ Must-Fix Issues     │ │ Avg Time to Fix     │ │
│ │ 312                 │ │ 187 (60%)           │ │ 2.3 days            │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Expanded Horizontal Bar Chart with click-to-filter]                 │
├─────────────────────────────────────────────────────────────┤
│ Failure Trend (Stacked Area Chart by Category)                       │
│ - Shows which categories are increasing/decreasing over time         │
├─────────────────────────────────────────────────────────────┤
│ Agents with This Failure (filtered table)                            │
│ Agent          | Publisher     | Category        | Submitted  | Days │
│ HR Helper Bot  | Fabrikam Inc  | RAI Violation   | Jan 5      | 4    │
│ Data Insights  | Northwind     | Metadata Issues | Jan 6      | 3    │
├─────────────────────────────────────────────────────────────┤
│ AI Insight: "RAI violations increased 47% this week after           │
│ policy update v2.3. Recommend publishing updated guidelines."        │
└─────────────────────────────────────────────────────────────┘
```

**Data Source:** `/api/snapshots` aggregated + `/api/submissions?validationStatus=failed`

**New Components Needed:**
- `FailureCategoriesDetail.tsx` - Page component
- `FailureTrendChart.tsx` - Stacked area chart
- `FailedAgentsTable.tsx` - Filterable table
- `FailureCategoryInsight.tsx` - AI-generated remediation guidance

#### 3.3 At-Risk Agents Full View (`/overview/at-risk`)

**Purpose:** Complete view of all agents requiring attention with actionable triage

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Overview    At-Risk Agents Triage                 │
├─────────────────────────────────────────────────────────────┤
│ Risk Type: [All ▼]  Publisher: [All ▼]  Sort: [Days in Review ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ Total At-Risk       │ │ SLA Breach          │ │ RAI Failures        │ │
│ │ 12                  │ │ 4                   │ │ 3                   │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Risk Distribution [Donut Chart by Risk Type]                         │
├─────────────────────────────────────────────────────────────┤
│ At-Risk Agents (Full Table with Actions)                             │
│ ☐ | Agent               | Publisher      | Risk        | Days | Status         | Actions      │
│ ☐ | Sales Assistant Pro | Contoso Ltd    | SLA Breach  | 12   | Action Required| [View] [Escalate] │
│ ☐ | HR Helper Bot       | Fabrikam Inc   | RAI Failure | 8    | Human Review   | [View] [Contact]  │
│ ☐ | Data Insights Agent | Northwind      | Latency     | 6    | Action Required| [View] [Escalate] │
├─────────────────────────────────────────────────────────────┤
│ Bulk Actions: [☐ Select All] [Escalate Selected] [Generate Report]  │
├─────────────────────────────────────────────────────────────┤
│ AI Recommendation: "Prioritize Sales Assistant Pro (12 days).       │
│ Publisher Contoso Ltd has 2 agents in breach—schedule joint call."   │
└─────────────────────────────────────────────────────────────┘
```

**Data Source:** `/api/agents?status=at-risk` (new filter) + `/api/incidents`

**New Components Needed:**
- `AtRiskAgentsDetail.tsx` - Page component
- `RiskDistributionChart.tsx` - Donut chart
- `AtRiskAgentsTable.tsx` - Full table with actions
- Bulk action handlers (mock implementations)

---

### Phase 4: Row Click Navigation
**Effort:** 1-2 hours

#### 4.1 At-Risk Agents Table Row Click
Wire each row in the Overview page table to navigate to Agent Detail:

```typescript
// In Overview page
<TableRow
  onClick={() => router.push(`/agents/${agent.id}`)}
  className="tw-cursor-pointer hover:tw-bg-obsidian-700/30"
>
```

The Agent Detail page (`/agents/[agentId]`) already exists and shows:
- Agent information header
- Version history
- Submission timeline
- Validation findings
- Publisher information

#### 4.2 Chart Data Point Clicks (Enhancement)
Make chart data points clickable to filter by that date/category:

```typescript
// In SubmissionsTrendChart
onDataPointClick={(date) => {
  router.push(`/overview/submissions-trend?date=${date}`);
}}
```

---

### Phase 5: Natural Language Insights
**Effort:** 2-3 hours

Each modal and drilldown page includes an AI-generated insight sentence.

#### 5.1 Insight Generation Rules
Create `src/lib/insights.ts` with rule-based insight generators:

```typescript
interface InsightContext {
  metricType: KPIType;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  contributingFactors: Factor[];
}

function generateInsight(context: InsightContext): string {
  // Rule-based logic to generate natural language insights
}
```

#### 5.2 Insight Templates by KPI

**Time to Publish:**
- Improving: "Time-to-publish decreased by {X}% this period. {Stage} optimization is driving improvement."
- Degrading: "Time-to-publish increased by {X}% due to {bottleneck}. Consider {action}."
- Stable: "Publishing velocity stable at {X} days. {Count} agents in active review."

**First-Pass Approval:**
- Improving: "First-pass approval improved {X}% as {category} failures decreased."
- Degrading: "{Category} failures driving {X}% decline. {Count} publishers need remediation support."

**SLA Compliance:**
- Improving: "SLA compliance improved to {X}% with only {count} agents at risk."
- Degrading: "{Count} agents in breach, concentrated with {publishers}. Recommend immediate triage."

**RAI Pass Rate:**
- Improving: "RAI compliance improved {X}%. Proactive validation preventing failures."
- Degrading: "RAI failures increased after policy update. {Count} agents need re-review."

**Active Incidents:**
- Low (0-2): "Healthy incident count. Continue monitoring post-publish metrics."
- Medium (3-5): "{Count} incidents active. {Critical} requires immediate attention."
- High (6+): "Elevated incident level. Consider temporary submission pause for affected publishers."

---

### Phase 6: Filter Context Propagation
**Effort:** 2 hours

Ensure dashboard filters (date range, publisher) propagate to drilldowns.

#### 6.1 Create Filter Context
```typescript
// src/contexts/FilterContext.tsx
interface FilterState {
  dateRange: '7d' | '30d' | '60d' | '90d' | 'custom';
  startDate: Date;
  endDate: Date;
  publisherId?: string;
  channel?: string;
}

const FilterContext = createContext<FilterState>(defaultFilters);
```

#### 6.2 Update AppShell
Pass filter state via context provider:
```typescript
<FilterContext.Provider value={filters}>
  {children}
</FilterContext.Provider>
```

#### 6.3 Consume in Drilldown Pages
```typescript
const { dateRange, startDate, endDate } = useFilters();
const { data } = useSnapshots({ startDate, endDate });
```

---

## New Routes Summary

| Route | Purpose | New Page? |
|-------|---------|-----------|
| `/overview` | Main dashboard | Existing (enhance) |
| `/overview/submissions-trend` | Submissions analysis | NEW |
| `/overview/failures` | Failure category analysis | NEW |
| `/overview/at-risk` | At-risk agents triage | NEW |
| `/agents/[agentId]` | Agent detail | Existing |
| `/incidents` | Incidents management | NEW (optional) |

---

## New Components Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| `Dialog` | `src/components/ui/Dialog.tsx` | Modal overlay foundation |
| `KPIDetailModal` | `src/components/features/overview/KPIDetailModal.tsx` | KPI expanded view |
| `KPIInsightCard` | `src/components/features/overview/KPIInsightCard.tsx` | Metric + insight display |
| `SubmissionsTrendDetail` | `src/app/(app)/overview/submissions-trend/page.tsx` | Trend drilldown page |
| `FailureCategoriesDetail` | `src/app/(app)/overview/failures/page.tsx` | Failures drilldown page |
| `AtRiskAgentsDetail` | `src/app/(app)/overview/at-risk/page.tsx` | At-risk triage page |
| `DailySubmissionsTable` | `src/components/features/overview/DailySubmissionsTable.tsx` | Daily breakdown |
| `FailedAgentsTable` | `src/components/features/overview/FailedAgentsTable.tsx` | Failed agents list |
| `RiskDistributionChart` | `src/components/charts/RiskDistributionChart.tsx` | Risk donut chart |

---

## Mock Data Enhancements

### New Data Required

#### 1. Extended Agent Status
Add `atRiskStatus` and `riskFactors` to agent data:
```typescript
{
  atRiskStatus: 'sla-breach' | 'rai-failure' | 'latency' | 'regression' | null,
  riskFactors: {
    slaDaysRemaining: number,
    lastValidationFailure: string,
    incidentCount: number
  }
}
```

#### 2. Stage Duration Metrics
Add stage-level timing to submissions:
```typescript
{
  stageDurations: {
    submissionToReview: number,  // hours
    reviewToDecision: number,    // hours
    decisionToPublished: number  // hours
  }
}
```

#### 3. Daily Failure Breakdown
Enhance snapshots with per-category daily counts:
```typescript
{
  failureCategories: {
    rai_violation: { count: 12, trend: 'up' },
    metadata_issues: { count: 8, trend: 'stable' },
    // ...
  }
}
```

---

## Implementation Sequence

### Sprint 1: Foundation (Days 1-2)
1. Create Dialog component
2. Create KPIDetailModal component
3. Wire first KPI card (Time to Publish) as proof of concept
4. Validate modal UX and styling

### Sprint 2: KPI Cards Complete (Days 3-4)
5. Wire remaining 4 KPI cards
6. Add insight generation logic
7. Add "Go to page" navigation from modals

### Sprint 3: Chart Drilldowns (Days 5-7)
8. Create Submissions Trend drilldown page
9. Create Failure Categories drilldown page
10. Wire "View details" buttons
11. Add chart data point click handlers

### Sprint 4: At-Risk Triage (Days 8-9)
12. Create At-Risk Agents drilldown page
13. Wire table row clicks on Overview
14. Add bulk action handlers (mock)

### Sprint 5: Polish (Days 10-11)
15. Filter context propagation
16. Loading states and error handling
17. Accessibility review
18. Performance optimization

---

## Success Criteria

### Functional Requirements
- [ ] All 5 KPI cards are clickable and show modal with expanded data
- [ ] Each modal includes natural language insight sentence
- [ ] "View details" buttons navigate to appropriate drilldown pages
- [ ] Drilldown pages show filterable, sortable data tables
- [ ] At-Risk agents table rows navigate to Agent Detail page
- [ ] Filters propagate from Overview to drilldown pages

### Non-Functional Requirements
- [ ] Modal opens in <200ms
- [ ] Page transitions complete in <500ms
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Mobile responsive (tablet minimum)

### Business Value Validation
- [ ] User can identify SLA breaches in <30 seconds from Overview
- [ ] User can drill to root cause of approval rate decline
- [ ] User can generate action plan for at-risk agents
- [ ] Workflow supports "What's breaking SLAs?" → root cause → action journey

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Modal complexity | Use Radix UI primitives for accessibility |
| Performance with large data | Implement pagination, virtual scrolling |
| Inconsistent styling | Use shared Chart theme and component tokens |
| Data freshness | Show last-updated timestamp on all views |
| Mobile usability | Design mobile-first modal layouts |

---

## Appendix: Wireframes

### KPI Modal Wireframe
```
┌──────────────────────────────────────────────┐
│ [×]                     Time to Publish      │
├──────────────────────────────────────────────┤
│                                              │
│    4.2 days (p50)    ↓ 12% vs last period   │
│                                              │
│    ────────────────────────                  │
│    [Sparkline: 7-day trend]                  │
│    ────────────────────────                  │
│                                              │
│    Stage Breakdown:                          │
│    ├── Submission → Review: 1.2 days         │
│    ├── Review → Decision:   2.1 days         │
│    └── Decision → Published: 0.9 days        │
│                                              │
│    ⚡ "68% of publishing time is spent in   │
│       manual review. Consider scaling        │
│       reviewer capacity."                    │
│                                              │
├──────────────────────────────────────────────┤
│  [View Publishing Funnel →]                  │
└──────────────────────────────────────────────┘
```

### Submissions Trend Page Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│ ← Back    Submissions vs Approvals Analysis    [Export CSV ▼]  │
├────────────────────────────────────────────────────────────────┤
│ [Date: Last 30 days ▼] [Publisher: All ▼] [Apply]              │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│ │   187   │  │   127   │  │   47    │  │   68%   │             │
│ │Submitted│  │Approved │  │Rejected │  │Approval │             │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│    12 ┤     ●                          ●                       │
│       │   ●   ●    ●         ●       ●   ●                    │
│     8 ┤  ●     ●  ● ●   ●   ● ●   ●       ●   ●              │
│       │ ●           ●   ● ●     ●           ● ● ●            │
│     4 ┤                                           ●            │
│       │                                                        │
│     0 └────┬────┬────┬────┬────┬────┬────┬────┬────┬          │
│          Dec 10  Dec 16  Dec 22  Dec 28  Jan 3   Jan 9         │
│                                                                │
│            ● Submissions   ● Approvals                         │
├────────────────────────────────────────────────────────────────┤
│  Date      │ Submissions │ Approvals │ Rejections │ Pending    │
│ ─────────────────────────────────────────────────────────────  │
│  Jan 9     │     6       │     4     │     1      │    1       │
│  Jan 8     │     8       │     5     │     2      │    1       │
│  Jan 7     │     5       │     3     │     1      │    1       │
│  Jan 6     │     7       │     4     │     2      │    1       │
│  ...       │             │           │            │            │
├────────────────────────────────────────────────────────────────┤
│ 💡 Insight: "Submission volume peaks on Mondays (avg 9.2).    │
│    Consider staffing review capacity accordingly."             │
└────────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- `docs/IMPLEMENTATION_BLUEPRINT.md` - Overall project implementation plan
- `docs/context/App Purpose.txt` - Business context and problem statement
- `.claude/skills/obsidian-aurora-design.md` - Design system reference
- `.claude/skills/component-patterns.md` - Component development patterns
