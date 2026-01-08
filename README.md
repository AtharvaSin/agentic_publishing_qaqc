# Agent Publishing Ops Intelligence Hub

A **Power BI-style operational dashboard** providing near real-time visibility into agent publishing health, quality gates, and maintenance KPIs with AI-powered recommendations.

## Overview

This application helps Store Ops, engineering, and ecosystem stakeholders quickly answer:

- How many agents are stuck in validation, and why?
- Are we meeting publishing SLAs and quality bars?
- Which publishers or agent types drive the most failures?
- Did a platform change increase regressions, latency, or RAI failures?

## Features

- **Executive Dashboard** - KPI tiles with trend indicators and health scores
- **Publishing Funnel** - Visual pipeline from draft to published with conversion rates
- **Quality Metrics** - RAI compliance, validation pass rates, defect tracking
- **Agent Inventory** - Searchable, filterable agent list with drillthrough details
- **Publisher Analytics** - Publisher performance metrics and coaching insights
- **AI Copilot** - Intelligent recommendations for triage, bottlenecks, and coaching

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + Fluent UI v9 |
| Charts | Recharts |
| Data | TanStack Query + MSW |
| Theme | Obsidian Aurora (dark mode) |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/agent-publishing-ops-hub.git

# Navigate to project directory
cd agent-publishing-ops-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Check code formatting |
| `npm run format:write` | Auto-format code |
| `npm run checks` | Run all quality checks (typecheck + lint + build) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   └── (app)/             # Main application routes
│       ├── overview/      # Executive dashboard
│       ├── funnel/        # Publishing pipeline
│       ├── quality/       # Quality metrics
│       ├── agents/        # Agent inventory + detail
│       └── publishers/    # Publisher analytics
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Shell, Navigation
│   ├── charts/            # Data visualizations
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── lib/                   # Utilities and constants
├── data/                  # Synthetic mock data
└── mocks/                 # MSW API handlers
```

## Design System

The application uses the **Obsidian Aurora** theme - a dark mode interface designed for operational dashboards:

- **Background**: Obsidian shades (#0F1419 to #252A3B)
- **Accents**: Aurora colors (Cyan, Purple, Pink, Teal)
- **Status**: Semantic colors for Critical, High, Medium, Low, Success

## Data

This is a demo application using synthetic data via Mock Service Worker (MSW). No real backend is required - all API calls are intercepted and handled client-side.

## Contributing

This is currently a demo/prototype application. For questions or feedback, please open an issue.

---

Built with Next.js and TypeScript
