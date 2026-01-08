# Agent Publishing Ops Intelligence Hub

> **A Power BI-style operational dashboard** for agent publishing health, quality gates, and AI-powered insights.

## Quick Start

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run checks     # Run all quality checks (typecheck + lint + build)
```

---

## Project Overview

### What Is This?
A Next.js 15 web application providing near real-time visibility into agent publishing health, quality gates, and maintenance KPIs with AI-powered recommendations.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + Fluent UI v9 (selective) |
| Charts | Recharts |
| Data | TanStack Query + MSW |
| Theme | Obsidian Aurora (dark mode) |

### Key Pages
- `/overview` - Executive cockpit with KPIs
- `/funnel` - Publishing pipeline visualization
- `/quality` - Quality & Readiness metrics
- `/agents` - Agent inventory with drillthrough
- `/publishers` - Publisher inventory with coaching

---

## Claude Code Artifacts

This project includes a comprehensive `.claude/` folder with specialized artifacts for effective task execution.

### Agents (`.claude/agents/`)

Use these agents for specialized tasks:

| Agent | Use For | Key Capabilities |
|-------|---------|------------------|
| `foundation-architect` | Project setup, configuration | Next.js, TypeScript, dependencies |
| `ui-builder` | React components | Accessible, themed components |
| `data-engineer` | Types, mock data, APIs | Branded types, MSW, TanStack Query |
| `chart-specialist` | Data visualizations | Recharts, themed charts |
| `ai-insights-engineer` | Copilot/AI features | Rule engine, narratives |
| `fluent-stylist` | Styling, design tokens | Tailwind, Obsidian Aurora |
| `page-composer` | Page assembly | App Router, layouts |
| `quality-assurance` | Code quality, a11y | TypeScript, ESLint, WCAG |
| `deployment-manager` | Build, deploy | Vercel, Lighthouse |

**How to invoke:**
```
Use Task tool with subagent_type matching agent name
Example: Task(subagent_type="ui-builder", prompt="Create KPITile component")
```

### Commands (`.claude/commands/`)

Available slash commands:

| Command | Purpose |
|---------|---------|
| `/init-project` | Bootstrap complete project |
| `/create-component NAME [type] [feature]` | Create React component |
| `/add-mock-data ENTITY [count]` | Generate mock data |
| `/add-api-handler RESOURCE [operations]` | Create MSW handlers |
| `/build-page PAGE_NAME` | Build complete page |
| `/run-checks [type]` | Run quality checks |
| `/deploy [environment]` | Deploy to Vercel |

### Skills (`.claude/skills/`)

Reference documents - consult these for patterns:

| Skill | When to Read |
|-------|--------------|
| `obsidian-aurora-design.md` | Styling components, colors, typography |
| `data-architecture.md` | Entity types, relationships, data shapes |
| `component-patterns.md` | Component structure, hooks, patterns |
| `api-patterns.md` | MSW handlers, TanStack Query hooks |
| `ai-insights-patterns.md` | Copilot rules, templates, scenarios |

### Orchestration (`.claude/orchestration/`)

Multi-agent coordination patterns:

| File | Purpose |
|------|---------|
| `phase-workflows.md` | Implementation phase sequences |
| `parallel-patterns.md` | When/how to run agents in parallel |
| `agent-routing.md` | Which agent for which task |

---

## Coding Standards

### TypeScript
- **Strict mode** enabled - no implicit any
- Use **branded types** for entity IDs (`AgentId`, `PublisherId`)
- Explicit return types for all functions
- Use `FC` type for React components

### Components
```typescript
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  requiredProp: string;
  className?: string;  // Always include
}

export const ComponentName: FC<ComponentNameProps> = ({
  requiredProp,
  className,
}) => {
  return (
    <div className={cn('tw-base-classes', className)}>
      {/* Content */}
    </div>
  );
};
```

### Styling
- Use `tw-` prefix for all Tailwind classes
- Use semantic color tokens (never `blue-500`, always `aurora-cyan`)
- Include focus states: `focus:tw-ring-2 focus:tw-ring-aurora-cyan`
- Apply Obsidian Aurora theme (see `.claude/skills/obsidian-aurora-design.md`)

### File Organization
```
src/
├── components/
│   ├── ui/          # Primitives (Button, Card, etc.)
│   ├── layout/      # Shell, Nav, etc.
│   ├── charts/      # Chart components
│   └── features/    # Feature-specific
├── lib/             # Utilities, constants
├── hooks/           # Custom hooks
├── types/           # TypeScript types
├── data/            # Mock data
└── mocks/           # MSW handlers
```

---

## Quality Gates

### Pre-Commit
```bash
npm run typecheck  # Must pass with 0 errors
npm run lint       # Must pass with 0 warnings
npm run format     # Must be compliant
```

### Pre-Deploy
```bash
npm run build      # Must succeed
npm run checks     # All checks must pass
```

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation on all interactive elements
- Focus visible indicators
- Color contrast 4.5:1 minimum

---

## Task Execution Guidelines

### For Complex Tasks

1. **Check orchestration patterns** in `.claude/orchestration/`
2. **Use agent routing** to select the right agent
3. **Run agents in parallel** when components are independent
4. **Follow phase workflows** for multi-step implementations

### For Component Creation

1. Read `.claude/skills/component-patterns.md`
2. Use `ui-builder` agent
3. Follow Obsidian Aurora theme from `.claude/skills/obsidian-aurora-design.md`
4. Include loading/error/empty states
5. Run `quality-assurance` after creation

### For Data Tasks

1. Read `.claude/skills/data-architecture.md`
2. Use `data-engineer` agent
3. Maintain referential integrity
4. Use branded types for IDs
5. Include realistic distributions

### For Charts

1. Read `.claude/skills/component-patterns.md` (chart section)
2. Use `chart-specialist` agent
3. Apply theme from `lib/chartTheme.ts`
4. Always use `ResponsiveContainer`
5. Include custom tooltip with Obsidian styling

---

## Safety Rules

### NEVER
- Deploy without running `npm run checks`
- Use hardcoded colors (use theme tokens)
- Skip TypeScript types
- Leave console.log in production code
- Create orphaned entities (broken references)

### ALWAYS
- Run quality checks before commits
- Use existing components when available
- Include loading/error states for async components
- Add focus indicators on interactive elements
- Verify data integrity after generation

---

## Implementation Progress

Track progress in `docs/IMPLEMENTATION_BLUEPRINT.md`

Current Phase: **0 - Foundation Setup**

### Phase Summary
| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Pending | Foundation Setup |
| 1 | Pending | App Shell & Navigation |
| 2 | Pending | Synthetic Data Layer |
| 3 | Pending | Core Dashboards |
| 4 | Pending | Drillthrough Pages |
| 5 | Pending | AI Insights Engine |
| 6 | Pending | UX Hardening |
| 7 | Pending | Deployment |
| 8 | Pending | Demo Prep |

---

## Reference Documentation

- **Implementation Blueprint**: `docs/IMPLEMENTATION_BLUEPRINT.md` - Full spec and task list
- **Context Documents**: `docs/context/` - PRD, UI-UX Strategy, etc.
- **Claude Artifacts**: `.claude/` - Agents, commands, skills, orchestration

---

## Quick Agent Selection

```
Project setup?           → foundation-architect
Styling/theming?        → fluent-stylist
React component?        → ui-builder
Chart/visualization?    → chart-specialist
Data/types/API?         → data-engineer
AI/Copilot feature?     → ai-insights-engineer
Page composition?       → page-composer
Code quality/a11y?      → quality-assurance
Build/deploy?           → deployment-manager
```

For detailed routing: `.claude/orchestration/agent-routing.md`
