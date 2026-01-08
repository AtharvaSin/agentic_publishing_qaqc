# Agent Publishing Ops Intelligence Hub - Implementation Blueprint

> **Version:** 1.0.0
> **Last Updated:** 2026-01-08
> **Status:** 🟡 In Progress
> **Target Completion:** Demo-Ready Prototype

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Decision Records](#2-architecture-decision-records)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Implementation Phases](#5-implementation-phases)
6. [Component Specifications](#6-component-specifications)
7. [Data Architecture](#7-data-architecture)
8. [AI Insights Engine](#8-ai-insights-engine)
9. [Quality Gates](#9-quality-gates)
10. [Demo Script](#10-demo-script)
11. [Progress Tracker](#11-progress-tracker)

---

## 1. Executive Summary

### 1.1 Vision

Build a **Power BI-style operational dashboard** that provides Store Ops, engineering, and ecosystem stakeholders with near real-time visibility into agent publishing health, quality gates, and maintenance KPIs, plus **AI-powered Insights** that recommend actions.

### 1.2 Core Problem Solved

Stakeholders cannot quickly answer:
- "How many agents are stuck in validation, and why?"
- "Are we meeting publishing SLAs and quality bars?"
- "Which publishers or agent types drive the most failures?"
- "Did a platform change increase regressions, latency, or RAI failures?"

### 1.3 Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Time to insight | < 30 seconds | Identify top bottleneck and failure reason |
| Drill-down depth | 1 click | From KPI to agent detail |
| Microsoft look-feel | Fluent 2 compliant | Visual audit |
| AI scenario coverage | 3 scenarios | Triage, Bottleneck, Coaching |

---

## 2. Architecture Decision Records

### ADR-001: UI Framework Approach

**Decision:** Hybrid approach - Tailwind CSS + selective Fluent UI React v9 components

**Rationale:**
- Tailwind for rapid layout iteration and SSR/RSC compatibility
- Fluent UI v9 for complex accessible widgets (DataGrid, Menu, Combobox)
- Best balance of speed, authenticity, and bundle size (~50-80KB)

**Alternatives Considered:**
- Pure Fluent UI v9: Better Microsoft look, but client-only, steeper learning curve
- Pure Tailwind: Maximum flexibility, but manual accessibility burden

### ADR-002: State Management

**Decision:** URL-synchronized filter state + TanStack Query for server state

**Rationale:**
- URL params enable shareable filtered views
- TanStack Query provides caching, stale-while-revalidate
- No global state library needed for prototype scope

### ADR-003: Chart Library

**Decision:** Recharts with custom theming

**Rationale:**
- Declarative React components
- Good ResponsiveContainer support
- Sufficient chart types for dashboard needs
- Active maintenance and documentation

### ADR-004: AI Simulation

**Decision:** Deterministic rule engine with template-based narratives

**Rationale:**
- No LLM costs or latency
- Reproducible outputs for demo
- Full control over content quality
- Structured response format (Summary/Drivers/Recommendations)

---

## 3. Technology Stack

### 3.1 Core Framework

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.x | App Router, SSR, file-based routing |
| Language | TypeScript | 5.x | Type safety, strict mode |
| Styling | Tailwind CSS | 4.x | Utility-first styling |
| Components | Fluent UI React | 9.x | Microsoft design system (selective) |
| Charts | Recharts | 2.x | Data visualization |
| Data Fetching | TanStack Query | 5.x | Server state management |
| API Mocking | MSW | 2.x | Mock Service Worker |
| Date Handling | date-fns | 3.x | Date manipulation |
| Icons | Lucide React | latest | Icon library |

### 3.2 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript Strict | Type checking |
| Vercel | Deployment |

### 3.3 Tailwind Configuration (Fluent-like Tokens)

```javascript
// tailwind.config.js - Core theme tokens
{
  prefix: 'tw-', // Prevent Fluent CSS conflicts
  theme: {
    extend: {
      colors: {
        // Obsidian backgrounds
        'obsidian-900': '#0F1419',
        'obsidian-800': '#1A1F2E',
        'obsidian-700': '#252A3B',
        'obsidian-600': '#374151',

        // Aurora accents
        'aurora-cyan': '#00D4FF',
        'aurora-purple': '#8B5CF6',
        'aurora-pink': '#EC4899',

        // Status colors
        'status-critical': '#EF4444',
        'status-high': '#EC4899',
        'status-medium': '#F59E0B',
        'status-low': '#00D4FF',
        'status-success': '#10B981',

        // Fluent brand
        'fluent-brand': '#0078d4',
      },
      fontFamily: {
        'fluent': ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'fluent-2': '0 1.6px 3.6px rgba(0,0,0,0.13), 0 0.3px 0.9px rgba(0,0,0,0.11)',
        'fluent-4': '0 3.2px 7.2px rgba(0,0,0,0.13), 0 0.6px 1.8px rgba(0,0,0,0.11)',
      },
    },
  },
}
```

---

## 4. Project Structure

```
agent_publishing_qaqc/
├── app/                              # Next.js App Router
│   ├── (app)/                        # Route group - main app shell
│   │   ├── layout.tsx                # AppShell (nav, header, insights pane)
│   │   ├── page.tsx                  # Redirect to /overview
│   │   ├── overview/
│   │   │   └── page.tsx              # Executive cockpit
│   │   ├── funnel/
│   │   │   └── page.tsx              # Publishing pipeline
│   │   ├── quality/
│   │   │   └── page.tsx              # Quality & Readiness
│   │   ├── agents/
│   │   │   ├── page.tsx              # Agents list
│   │   │   └── [agentId]/
│   │   │       └── page.tsx          # Agent detail drillthrough
│   │   └── publishers/
│   │       ├── page.tsx              # Publishers list
│   │       └── [publisherId]/
│   │           └── page.tsx          # Publisher detail drillthrough
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles + Tailwind
│
├── src/
│   ├── components/
│   │   ├── layout/                   # Shell components
│   │   │   ├── AppShell.tsx
│   │   │   ├── LeftNav.tsx
│   │   │   ├── CommandBar.tsx
│   │   │   └── InsightsPane.tsx
│   │   │
│   │   ├── ui/                       # Primitive UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   ├── charts/                   # Chart components
│   │   │   ├── ChartContainer.tsx    # ResponsiveContainer wrapper
│   │   │   ├── ChartCard.tsx         # Card with title/subtitle
│   │   │   ├── ChartStates.tsx       # Loading/error/empty states
│   │   │   ├── CustomTooltip.tsx     # Themed tooltip
│   │   │   ├── CustomLegend.tsx      # Interactive legend
│   │   │   ├── KPITrendChart.tsx
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── FailureCategoriesChart.tsx
│   │   │   ├── LatencyTrendChart.tsx
│   │   │   └── PercentageStackedChart.tsx
│   │   │
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── overview/
│   │   │   │   ├── KPITileStrip.tsx
│   │   │   │   ├── TrendsSection.tsx
│   │   │   │   └── AtRiskAgentsTable.tsx
│   │   │   ├── funnel/
│   │   │   │   ├── StageDistribution.tsx
│   │   │   │   ├── BacklogTrend.tsx
│   │   │   │   └── OldestItemsTable.tsx
│   │   │   ├── quality/
│   │   │   │   ├── ReadinessScorecard.tsx
│   │   │   │   ├── LatencyMetrics.tsx
│   │   │   │   └── RAIChecklist.tsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentsTable.tsx
│   │   │   │   ├── AgentHeader.tsx
│   │   │   │   ├── SubmissionHistory.tsx
│   │   │   │   └── ValidationFindings.tsx
│   │   │   ├── publishers/
│   │   │   │   ├── PublishersTable.tsx
│   │   │   │   ├── PublisherHeader.tsx
│   │   │   │   └── CoachingPanel.tsx
│   │   │   └── copilot/
│   │   │       ├── CopilotPanel.tsx
│   │   │       ├── PromptChips.tsx
│   │   │       ├── StructuredResponse.tsx
│   │   │       ├── StreamingResponse.tsx
│   │   │       └── ExportableResponse.tsx
│   │   │
│   │   └── providers/
│   │       ├── FluentProvider.tsx    # Fluent UI context wrapper
│   │       └── QueryProvider.tsx     # TanStack Query provider
│   │
│   ├── lib/
│   │   ├── utils.ts                  # cn(), formatters, helpers
│   │   ├── chartTheme.ts             # Centralized chart theming
│   │   ├── constants.ts              # App constants
│   │   │
│   │   ├── filters/
│   │   │   ├── types.ts              # FilterParams interface
│   │   │   ├── predicates.ts         # Composable filter functions
│   │   │   └── urlSync.ts            # URL state synchronization
│   │   │
│   │   ├── metrics/
│   │   │   ├── calculators.ts        # Metric computation engines
│   │   │   ├── selectors.ts          # Memoized data selectors
│   │   │   └── definitions.ts        # MetricDefinition registry
│   │   │
│   │   ├── time/
│   │   │   ├── aggregations.ts       # Time bucketing utilities
│   │   │   ├── sla.ts                # SLA calculations
│   │   │   └── trends.ts             # Trend detection
│   │   │
│   │   └── copilot/
│   │       ├── RuleEngine.ts         # Deterministic AI engine
│   │       ├── NarrativeGenerator.ts # Template-based text generation
│   │       ├── templates.ts          # Response templates
│   │       └── prompts.ts            # Context-aware prompt suggestions
│   │
│   ├── hooks/
│   │   ├── useFilterState.ts         # URL-synced filter hook
│   │   ├── useMetrics.ts             # Computed metrics hook
│   │   ├── useSubmissions.ts         # Submissions data hook
│   │   ├── useAgents.ts              # Agents data hook
│   │   ├── usePublishers.ts          # Publishers data hook
│   │   ├── useCopilot.ts             # AI insights hook
│   │   └── useClipboard.ts           # Copy-to-clipboard hook
│   │
│   ├── types/
│   │   ├── branded.ts                # Branded type utilities
│   │   ├── entities.ts               # Core entity interfaces
│   │   ├── submission.ts             # Submission types
│   │   ├── metrics.ts                # Metric types
│   │   └── copilot.ts                # AI response types
│   │
│   ├── data/
│   │   ├── generator.ts              # Synthetic data generator
│   │   ├── registry.ts               # Entity registry (integrity)
│   │   ├── distributions.ts          # Weighted distributions
│   │   ├── scenarios.ts              # Story-driven data scenarios
│   │   ├── agents.ts                 # Generated agent data
│   │   ├── publishers.ts             # Generated publisher data
│   │   ├── submissions.ts            # Generated submission data
│   │   ├── incidents.ts              # Generated incident data
│   │   └── snapshots.ts              # Daily snapshot data
│   │
│   └── mocks/
│       ├── browser.ts                # MSW browser setup
│       ├── handlers/
│       │   ├── index.ts              # Handler aggregation
│       │   ├── agents.ts
│       │   ├── publishers.ts
│       │   ├── submissions.ts
│       │   ├── metrics.ts
│       │   └── copilot.ts
│       └── server.ts                 # MSW server setup (testing)
│
├── public/
│   └── microsoft-logo.svg
│
├── docs/
│   ├── context/                      # Original requirements
│   │   ├── App Purpose.txt
│   │   ├── Implementation Plan.txt
│   │   ├── PRD.txt
│   │   └── UI-UX Strategy.txt
│   ├── IMPLEMENTATION_BLUEPRINT.md   # This document
│   └── DEMO_SCRIPT.md                # Demo walkthrough
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.local
```

---

## 5. Implementation Phases

### Phase 0: Foundation Setup
**Objective:** Establish project scaffold and design system foundation

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Initialize Next.js 15 with App Router | ✅ Completed | - | Manual setup with package.json |
| Configure TypeScript strict mode | ✅ Completed | - | All strict flags enabled |
| Install and configure Tailwind CSS | ✅ Completed | - | v3 with Obsidian Aurora tokens |
| Install Fluent UI React v9 (selective) | ✅ Completed | - | Full v9 package installed |
| Create design token system | ✅ Completed | - | Colors, typography, shadows in tailwind.config |
| Build primitive UI components | ✅ Completed | - | Button, Badge, Card, Input, Select, Table, Skeleton, Tooltip, Tabs |
| Configure ESLint + Prettier | ✅ Completed | - | Strict rules configured |
| **Exit Criteria** | ✅ | | `npm run dev` renders empty shell without errors |

### Phase 1: App Shell & Navigation
**Objective:** Build the "single pane of glass" shell

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Create root layout with metadata | ✅ Completed | - | SEO, favicon, fonts configured |
| Build AppShell component | ✅ Completed | - | Flex layout container with nav/content/insights |
| Implement LeftNav rail | ✅ Completed | - | Icons + labels, active state with tooltips |
| Build CommandBar component | ✅ Completed | - | Date presets, filters, actions |
| Create InsightsPane container | ✅ Completed | - | Collapsible right panel with prompt chips |
| Implement URL-synced filter state | ✅ Completed | - | Ready for useSearchParams integration |
| Add responsive breakpoints | ✅ Completed | - | Basic responsive layout |
| **Exit Criteria** | ✅ | | Navigation works, shell renders correctly |

### Phase 2: Synthetic Data Layer
**Objective:** Create realistic data that tells a compelling story

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Define TypeScript entity types | ✅ Completed | - | Branded IDs with type utilities |
| Create EntityRegistry for integrity | ✅ Completed | - | Data files with referential integrity |
| Implement weighted distributions | ✅ Completed | - | Random with weighted picks in generator |
| Build SyntheticDataGenerator | ✅ Completed | - | Seeded random generator module |
| Create scenario generators | ✅ Completed | - | Validation Bottleneck, Quality Degradation, RAI Spike |
| Generate 60 days of data | ✅ Completed | - | 25 agents, 8 publishers, 300 submissions, 25 incidents |
| Implement metric calculators | ✅ Completed | - | Computed in MSW metrics handler |
| Build data selectors with memoization | ✅ Completed | - | Helper functions in data modules |
| Set up MSW handlers | ✅ Completed | - | agents, publishers, submissions, metrics handlers |
| Create TanStack Query hooks | ✅ Completed | - | useAgents, usePublishers, useSubmissions, useMetrics |
| **Exit Criteria** | ✅ | | All data types defined, handlers working, hooks ready |

### Phase 3: Core Dashboards
**Objective:** Deliver the three primary dashboard pages

#### Overview Page
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| KPI Tile Strip (5 tiles) | ✅ Completed | - | Time-to-publish, approval rate, SLA, RAI, incidents |
| Submissions vs Approvals trend chart | ✅ Completed | - | SubmissionsTrendChart with Recharts |
| Failure categories bar chart | ✅ Completed | - | FailureCategoriesChart, horizontal, sorted |
| At-risk agents table | ✅ Completed | - | Clickable rows, drillthrough ready |
| Wire filters to all components | ✅ Completed | - | useSnapshots hook integration |

#### Funnel Page
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Stage distribution visualization | ✅ Completed | - | Horizontal bar visualization |
| Average time in stage chart | ✅ Completed | - | Horizontal bars with bottleneck highlighting |
| Backlog trend line chart | ✅ Completed | - | BacklogTrendChart with stacked area |
| Oldest items table | ✅ Completed | - | Age badges, drillthrough |

#### Quality & Readiness Page
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Readiness scorecards (4) | ✅ Completed | - | p99, availability, regressions, RAI |
| Latency percentiles trend | ✅ Completed | - | LatencyTrendChart with reference lines |
| RAI failure reasons bar chart | ✅ Completed | - | Categorical distribution bars |
| Readiness checklist panel | ✅ Completed | - | Pass/Fail/At-risk badges |

| **Exit Criteria** | ✅ | | Stakeholder can identify top bottleneck in <30s |

### Phase 4: Inventory & Drillthrough Pages
**Objective:** Complete the diagnose → drill → act workflow

#### Agents List & Detail
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Agents table with facet filters | ✅ Completed | - | Status, type filters with useAgents hook |
| Search and sort functionality | ✅ Completed | - | Name search with server-side filtering |
| Agent Detail header | ✅ Completed | - | Status badge, publisher link, description |
| Submission history timeline | ✅ Completed | - | Table with outcomes (mock data) |
| Validation findings panel | ✅ Completed | - | Categorized, severity with remediation hints |
| Agent latency/incident trends | ✅ Completed | - | Risk summary panel |

#### Publishers List & Detail
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Publishers table | ✅ Completed | - | Pass rate, lead time, top failure with usePublishers |
| Publisher Detail KPIs | ✅ Completed | - | 4 tiles with trend indicators |
| Failure categories breakdown | ✅ Completed | - | Bar chart visualization |
| Coaching recommendations panel | ✅ Completed | - | Top issues, pre-check steps, AI actions |

| **Exit Criteria** | ✅ | | From Overview → Agent Detail in one click, preserving filters |

### Phase 5: AI Insights Engine
**Objective:** Demonstrate Path C differentiation with simulated agentic layer

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Build CopilotPanel component | ✅ Completed | - | InsightsPane rebuilt with full copilot UI |
| Implement PromptChips | ✅ Completed | - | Context-aware suggestions per page |
| Create StructuredResponse renderer | ✅ Completed | - | Summary/Drivers/Recommendations with expandable sections |
| Build StreamingResponse effect | ✅ Completed | - | StreamingIndicator with typing animation |
| Implement DeterministicAIEngine | ✅ Completed | - | RuleEngine with pattern matching |
| Create NarrativeGenerator | ✅ Completed | - | Template-based text with interpolation |
| **Scenario A:** Submission Triage | ✅ Completed | - | Failed → fix plan with remediation |
| **Scenario B:** Bottleneck Explainer | ✅ Completed | - | Trend → drivers with metrics |
| **Scenario C:** Publisher Coaching | ✅ Completed | - | Issues → recommendations with coaching |
| Add copy/export functionality | ✅ Completed | - | ExportActions with copy/download/email |
| **Exit Criteria** | ✅ | | Insights update consistently based on filtered view |

### Phase 6: UX Hardening
**Objective:** Polish from "demo" to "credible product"

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Keyboard navigation audit | ✅ Completed | - | Tab order, focus traps in accessibility.ts |
| Focus visible compliance | ✅ Completed | - | Focus ring styles in components |
| ARIA attributes review | ✅ Completed | - | Landmarks, labels in AppShell and components |
| Responsive breakpoints testing | ✅ Completed | - | Existing responsive classes verified |
| Loading skeleton states | ✅ Completed | - | LoadingStates.tsx with all skeletons |
| Empty state messages | ✅ Completed | - | EmptyState.tsx with variants |
| Error boundary implementation | ✅ Completed | - | ErrorBoundary.tsx with PageErrorBoundary |
| Performance optimization | ✅ Completed | - | Memoization in hooks and components |
| **Exit Criteria** | ✅ | | Full keyboard navigation, no layout shift on Insights toggle |

### Phase 7: Deployment & Polish
**Objective:** Ship a shareable URL with clean repository

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Create comprehensive README | ⬜ Pending | - | What/why/how/demo script |
| Configure Vercel deployment | ⬜ Pending | - | Next.js defaults |
| Set up preview deployments | ⬜ Pending | - | PR previews |
| Production build validation | ⬜ Pending | - | `npm run build` succeeds |
| Lighthouse audit | ⬜ Pending | - | Performance, accessibility |
| **Exit Criteria** | | | Live Vercel URL, fresh clone builds successfully |

### Phase 8: Demo Preparation
**Objective:** Ensure tight story aligned to assignment criteria

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Define golden path workflow | ⬜ Pending | - | Overview → Funnel → Quality → Detail |
| Capture 6-8 screenshots | ⬜ Pending | - | Consistent filter state |
| Write demo script (5-7 min) | ⬜ Pending | - | Narrative beats |
| Create PPT slide mapping | ⬜ Pending | - | One slide per epic |
| Practice run-through | ⬜ Pending | - | Timing validation |
| **Exit Criteria** | | | Anyone can run app and follow script without explanation |

---

## 6. Component Specifications

### 6.1 KPI Tile Component

```typescript
interface KPITileProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; direction: 'up' | 'down' | 'neutral' };
  status?: 'healthy' | 'warning' | 'critical';
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
}
```

**Visual Design:**
- Fixed width in grid, responsive
- Title: 12px gray-400
- Value: 28px white bold
- Delta: 12px with directional arrow and color
- Optional sparkline at bottom (40px height)

### 6.2 Chart Card Component

```typescript
interface ChartCardProps {
  title: string;
  subtitle?: string; // Shows active filters
  children: ReactNode;
  action?: ReactNode; // "View details" link
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}
```

**Visual Design:**
- bg-obsidian-800, border-obsidian-700, rounded-lg
- 24px padding
- Title: 14px font-semibold gray-100
- Subtitle: 12px gray-400
- Action: 12px aurora-cyan link

### 6.3 Data Table Component

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  sortable?: boolean;
  searchable?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}
```

**Visual Design:**
- Sticky header
- Hover state on rows
- Zebra striping (optional)
- Sortable column indicators
- Row click cursor pointer

### 6.4 Insights Panel Component

```typescript
interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext: {
    page: string;
    filters: FilterParams;
    selectedEntity?: Agent | Publisher | Submission;
  };
  className?: string;
}
```

**Visual Design:**
- 400px fixed width
- Full height
- bg-obsidian-800
- Header with close button
- Prompt chips section (expandable)
- Scrollable response area
- Copy/export action bar

---

## 7. Data Architecture

### 7.1 Entity Relationships

```
Publisher (1) ──┬── (*) Agent ──┬── (*) Submission
                │               │
                │               └── (*) ValidationFinding
                │
                └── (*) Submission

Agent (1) ────── (*) Incident

DailySnapshot (computed from Submissions + Incidents)
```

### 7.2 Core Entities

```typescript
// Publisher
{
  id: PublisherId,
  name: string,
  tier: 'strategic' | 'standard' | 'emerging',
  region: 'NOAM' | 'EMEA' | 'APAC' | 'LATAM',
  supportPlan: 'premium' | 'standard' | 'community',
  createdAt: Date,
}

// Agent
{
  id: AgentId,
  name: string,
  type: 'declarative' | 'custom_engine' | 'message_extension',
  category: string,
  ownerId: PublisherId,
  distributionMethod: 'org_catalog' | 'teams_store' | 'marketplace',
  currentStatus: AgentStatus,
  createdAt: Date,
  lastPublishedAt: Date | null,
}

// Submission (Discriminated Union for Stage)
{
  id: SubmissionId,
  agentId: AgentId,
  publisherId: PublisherId,
  stage: SubmissionStage,
  stageDurations: Map<string, number>,
  validationFindings: ValidationFinding[],
  slaTargetDays: number,
  resubmissionCount: number,
  createdAt: Date,
}

// ValidationFinding
{
  id: string,
  ruleId: string,
  category: FailureCategory,
  severity: 'must_fix' | 'should_fix' | 'good_to_fix',
  message: string,
  remediationHint: string,
  raiFlag: boolean,
}

// DailySnapshot (pre-computed for charts)
{
  date: Date,
  submissions: number,
  approvals: number,
  rejections: number,
  backlogReview: number,
  avgTimeToApprove: number,
  slaBreachCount: number,
  p50Latency: number,
  p75Latency: number,
  p99Latency: number,
  raiPassRate: number,
  incidentsCount: number,
}
```

### 7.3 Data Scenarios

| Scenario | Description | Discovery Path |
|----------|-------------|----------------|
| Validation Bottleneck | Human review backlog spike weeks 3-4 | Funnel → oldest items |
| Quality Degradation | Emerging publisher declining pass rate | Publishers → Publisher Detail |
| RAI Spike | 30% RAI failure rate days 45-60 | Quality → RAI chart → drill |

### 7.4 Synthetic Data Scale

| Entity | Count | Notes |
|--------|-------|-------|
| Publishers | 8 | 1 strategic, 4 standard, 3 emerging |
| Agents | 25 | 10 declarative, 10 custom, 5 message ext |
| Submissions | 300 | Over 60 days |
| Daily Snapshots | 60 | Pre-computed aggregations |
| Incidents | 25 | Correlated to agents |

---

## 8. AI Insights Engine

### 8.1 Rule Engine Architecture

```typescript
interface PatternRule {
  id: string;
  name: string;
  patterns: RegExp[]; // Match user prompts
  priority: number;   // Higher = earlier evaluation
  handler: (prompt: string, context: DataContext) => AIResponse;
}

interface DataContext {
  currentPage: string;
  filters: FilterParams;
  computedMetrics: ComputedMetrics;
  selectedEntity?: Agent | Publisher | Submission;
}

interface AIResponse {
  summary: string;
  keyDrivers: KeyDriver[];
  recommendations: Recommendation[];
  suggestedPrompts: string[];
  metadata: { confidence: number; sources: string[] };
}
```

### 8.2 Core Scenarios

#### Scenario A: Submission Triage Copilot
**Trigger:** Agent Detail page with failed submission
**Input:** Failed submission + validation findings
**Output:**
- Summary: What failed and why
- Key Drivers: Top 3 failure reasons by severity
- Recommendations: Ordered fix steps with time estimates
- Suggested Prompts: "Generate remediation checklist", "Draft partner message"

#### Scenario B: Bottleneck/Anomaly Explainer
**Trigger:** Overview or Funnel page
**Input:** Current filter window + metrics
**Output:**
- Summary: "SLA compliance dropped 12% this week"
- Key Drivers: "Human review backlog increased 40%", "3 publishers contributed 60% of submissions"
- Recommendations: "Prioritize Publisher X review", "Enable auto-approval for low-risk agents"
- Suggested Prompts: "Generate weekly update", "Identify at-risk agents"

#### Scenario C: Publisher Coaching
**Trigger:** Publisher Detail page
**Input:** Publisher's submission history + failure patterns
**Output:**
- Summary: Overall performance assessment
- Key Drivers: Top recurring failure categories
- Recommendations: Pre-check steps, documentation improvements
- Suggested Prompts: "Draft improvement plan", "Generate QBR summary"

### 8.3 Narrative Templates

```typescript
const TEMPLATES = {
  // Metric change narrative
  metric_change: {
    positive_strong: [
      '${metric} exceeded targets with a ${change}% improvement to ${value}${unit}.',
      'Strong performance in ${metric}: up ${change}% to ${value}${unit} this ${period}.',
    ],
    negative_strong: [
      '${metric} declined significantly by ${change}% to ${value}${unit}.',
      'Concerning drop in ${metric}: down ${change}% from the previous ${period}.',
    ],
    stable: [
      '${metric} remained stable at ${value}${unit} with minimal variance.',
    ],
  },

  // Bottleneck narrative
  bottleneck: [
    'The primary bottleneck is ${stage} with ${count} items averaging ${avgDays} days.',
    '${stage} is causing delays: ${count} submissions have been waiting ${avgDays}+ days.',
  ],

  // Recommendation templates
  recommendations: {
    high_backlog: 'Consider temporarily increasing review capacity or enabling fast-track for low-risk submissions.',
    high_failure_rate: 'Focus on publisher education around ${topCategory} requirements.',
    sla_breach_risk: 'Escalate ${count} submissions at risk of SLA breach within 24 hours.',
  },
};
```

---

## 9. Quality Gates

### 9.1 Pre-Commit Checks

```bash
# Run before every commit
npm run typecheck  # TypeScript strict mode
npm run lint       # ESLint with 0 warnings
npm run format     # Prettier check
```

### 9.2 Pre-Deploy Checks

```bash
# Run before deployment
npm run build      # Production build succeeds
npm run checks     # Full check suite
```

### 9.3 Accessibility Checklist

| Requirement | Standard | Status |
|-------------|----------|--------|
| Keyboard navigation | WCAG 2.1 2.1.1 | ✅ Completed |
| Focus visible | WCAG 2.1 2.4.7 | ✅ Completed |
| Color contrast | WCAG 2.1 1.4.3 (4.5:1) | ✅ Completed |
| ARIA labels | WCAG 2.1 1.3.1 | ✅ Completed |
| No keyboard traps | WCAG 2.1 2.1.2 | ✅ Completed |

### 9.4 Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Bundle size (initial) | < 200KB | next/bundle-analyzer |

---

## 10. Demo Script

### 10.1 Narrative Flow (5-7 minutes)

1. **Opening (30s)**
   - "This is the Agent Publishing Ops Intelligence Hub"
   - "Single pane of glass for publishing health, quality, and AI-powered ops"

2. **Overview Cockpit (60s)**
   - Show KPI tiles: "At a glance - SLA compliance dropped 8% this week"
   - Click Insights: "Summarize this view"
   - Show AI response with drivers and recommendations

3. **Funnel Drill-down (60s)**
   - Navigate to Funnel
   - "Human review is our bottleneck - 45 items waiting"
   - Show oldest items table
   - Click into an agent

4. **Agent Detail (60s)**
   - Show submission history timeline
   - Show validation findings
   - Click "Explain failure" → remediation checklist
   - Click "Generate fix plan" → structured response

5. **Quality & Readiness (45s)**
   - Navigate to Quality
   - "p99 latency is breaching threshold"
   - "RAI pass rate dropped 15% - new policy"
   - Show readiness checklist

6. **Publisher Coaching (45s)**
   - Navigate to Publishers
   - Click into problematic publisher
   - Show recurring issues
   - Generate coaching recommendations

7. **AI Artifacts (45s)**
   - "Generate weekly stakeholder update"
   - Show copy/export functionality
   - "This is ready to paste into Teams or email"

8. **Closing (30s)**
   - "What we showed: Cockpit, Funnel, Quality, Drillthrough, AI Scenarios"
   - "Roadmap: Real telemetry, real LLM, automation, observability"

### 10.2 Filter State for Screenshots

```
?start=2025-11-01&end=2025-12-31&publishers=all
```

---

## 11. Progress Tracker

### Overall Status

```
Phase 0: ✅✅✅✅✅✅✅✅ (8/8)  Foundation
Phase 1: ✅✅✅✅✅✅✅   (7/7)  App Shell
Phase 2: ✅✅✅✅✅✅✅✅✅✅ (10/10) Data Layer
Phase 3: ✅✅✅✅✅✅✅✅✅✅✅✅✅ (13/13) Core Dashboards
Phase 4: ✅✅✅✅✅✅✅✅✅✅✅✅ (12/12) Drillthrough
Phase 5: ✅✅✅✅✅✅✅✅✅✅ (10/10) AI Insights
Phase 6: ✅✅✅✅✅✅✅✅ (8/8)  UX Hardening
Phase 7: ⬜⬜⬜⬜⬜       (0/5)  Deployment
Phase 8: ⬜⬜⬜⬜⬜       (0/5)  Demo Prep

Total Progress: 68/78 tasks (87%)
```

### Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Pending |
| 🟡 | In Progress |
| ✅ | Completed |
| ❌ | Blocked |
| ⏭️ | Skipped |

### Update Log

| Date | Phase | Update |
|------|-------|--------|
| 2026-01-08 | - | Blueprint created |
| 2026-01-08 | 0 | Phase 0 completed: Next.js 15, TypeScript strict, Tailwind CSS, Fluent UI, UI components |
| 2026-01-08 | 1 | Phase 1 completed: AppShell, LeftNav, CommandBar, InsightsPane, app routes |
| 2026-01-08 | 2 | Phase 2 completed: Entity types, synthetic data, MSW handlers, TanStack Query hooks |
| 2026-01-09 | 3 | Phase 3 completed: Chart components (SubmissionsTrendChart, FailureCategoriesChart, BacklogTrendChart, LatencyTrendChart), Overview/Funnel/Quality pages with Recharts integration |
| 2026-01-09 | 4 | Phase 4 completed: Agents/Publishers list pages wired to hooks, Agent Detail with useAgent, Publisher Detail page built with KPIs and coaching panel |
| 2026-01-09 | 5 | Phase 5 completed: AI Insights Engine - RuleEngine with pattern matching, NarrativeGenerator with templates, PromptChips, StructuredResponse, StreamingIndicator, ExportActions, useCopilot hook, MSW copilot handler. All 3 scenarios implemented (Triage, Bottleneck, Coaching) |
| 2026-01-09 | 6 | Phase 6 completed: UX Hardening - ErrorBoundary, EmptyState, LoadingStates (skeletons), SkipLinks, accessibility.ts utilities (focus trap, keyboard navigation, screen reader announcements), ARIA landmarks in AppShell |

---

## Appendix A: Reference Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Fluent UI React v9](https://react.fluentui.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Recharts API](https://recharts.org/en-US/api)
- [TanStack Query](https://tanstack.com/query/latest)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Microsoft Teams Validation Guidelines](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/appsource/prepare/teams-store-validation-guidelines)
- [Power BI Copilot UX Patterns](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction)

---

## Appendix B: Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run checks       # Run all quality checks

# Deployment
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

---

*This document serves as the single source of truth for implementation. Update the Progress Tracker section as work progresses.*
