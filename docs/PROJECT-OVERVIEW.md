# Starter — Agent OS

> An agent runtime platform. Each project is a sandboxed workspace with a general-purpose AI agent that has full autonomy over a real Linux machine. The agent writes code, builds apps, creates databases, connects to third-party services, generates documents — whatever the project needs. The dashboard is an inspection and control view. Use any LLM provider.

**Status:** Architecture finalized. Revising Phase 1 (Dashboard Shell) for panel-based workspace — see [ROADMAP.md](./ROADMAP.md).

## Why This Exists

You have a project. Maybe it starts as research — pulling data from Salesforce, analyzing spreadsheets, comparing options. Then it evolves — you need a dashboard, automated reports, integrations with three more services, a web app for your team, and a cron job that syncs data every hour.

Every project is different. Every project needs different tools, data, integrations, and workflows. No platform can anticipate what you'll need.

Starter gives each project its own machine with a general-purpose agent. The agent creates whatever the project needs — apps, services, documents, integrations, data pipelines, scripts. You direct. It builds. The dashboard lets you see what's happening and steer.

## How It Works

**Create a project** — Starter provisions a Sprite (cloud VM on [Fly](https://fly.io/)) and launches a [Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) agent inside it via a bridge server.

**Talk to the agent** — Open a chat panel. Tell it what you need. It writes code, installs packages, creates databases, builds UIs, sets up integrations, generates documents — whatever the project requires. Open multiple chat sessions side by side.

**Inspect its work** — A sidebar shows integrations, services, and assets. Click anything to open it in a panel — a running app, a cron job's logs, a generated document. The agent maintains an inspect database that the dashboard reads.

**Integrations are code** — Say "connect to Salesforce." The agent researches the API, prompts you to add the required credentials as machine secrets, then writes the integration code. The agent builds integrations in code, and they're usable from any app or script in the project.

**Pick your LLM** — Use any of Pi's 17+ supported providers — Anthropic, OpenAI, Google, Mistral, Groq, xAI, OpenRouter, and more. Switch models mid-session.

**Everything persists** — Sprites have durable NVMe storage with copy-on-write checkpoints. Stop a project, come back later. Everything is exactly where you left it.

## What a Project Is

A project is a sandboxed workspace — not just an app. A project can contain:

- Multiple web apps, APIs, and backend services
- Documents, spreadsheets, markdown files
- Databases (SQLite, Postgres, whatever the agent installs)
- Integrations with third-party services (Salesforce, Gmail, Stripe, anything with an API)
- Cron jobs, data pipelines, automation scripts
- Generated reports, charts, analysis

A project is a **name**, a **sandbox** (the machine), and a **conversation** (how you steer the agent). Everything else is emergent — the agent creates whatever the project needs.

## What the Agent Can Do

Everything. It's a general-purpose agent with full autonomy over a Linux machine:

- Write and run code in any language
- Build and serve web apps, APIs, dashboards
- Create and manage databases
- Install any packages or tools
- Set up integrations with third-party services via their APIs
- Generate documents, spreadsheets, reports
- Schedule cron jobs and background tasks
- Scrape websites, call APIs, process data
- Manage its own memory and context across sessions

The agent decides the tech stack, data model, file structure, and workflows. The platform provides the machine, the secrets, and the chat channel.

## Integrations

Integrations are agent-built code.

1. You ask: "Connect to my Salesforce"
2. The agent researches the Salesforce API (or you paste docs)
3. The agent prompts you to add the required secrets (e.g., `SALESFORCE_CLIENT_ID`, `SALESFORCE_SECRET`)
4. You add them as machine secrets — they become environment variables accessible from any process
5. The agent writes the integration code and records it in the inspect database
6. Now any app, script, or service in the project can use `process.env.SALESFORCE_CLIENT_ID` or `$SALESFORCE_CLIENT_ID`

If it has an API, the agent can connect to it.

## The Dashboard

The dashboard is an inspection and control view — a panel-based workspace like VSCode. It is not the execution engine — the agent and its sandbox are.

- **Home screen** — command-palette-first navigation. See your projects, create new ones.
- **Project workspace** — panel-based layout. Everything opens as a resizable, draggable panel: chat sessions, running apps (iframes), service logs, documents, terminals. The top bar is per-project context.
- **Sidebar** — services, integrations, and assets. Click anything to open it in a new panel.
- **Multiple chat sessions** — open as many conversations with the agent as you need, each in its own panel.
- **Cmd+K** — command palette for navigation, project switching, quick actions.
- **General agent** — a dashboard-level agent that can reach into any project for cross-project work.

The dashboard reads the agent's inspect database to know what to show in the sidebar. The agent writes to it. The dashboard never dictates project structure.

## Architecture

```
Control Plane (PostgreSQL + better-auth)
├── Auth (better-auth: user, session, account, verification)
├── Projects (ownership, Sprite routing — bigint PK + nanoid public ID)
├── Settings (API keys, provider defaults)
└── Sprites API token

Fly Sprites (per-project cloud VMs)
├── Sprite: "my-business" (https://<name>.sprites.app)
│   ├── Bridge server (Bun HTTP, wraps Pi SDK)
│   ├── Pi agent (any LLM provider, YOLO mode)
│   ├── Durable NVMe filesystem (ext4, auto-grows)
│   ├── Machine secrets (env vars)
│   ├── Inspect DB (SQLite — integrations, assets, services)
│   ├── Pi session data (JSONL — immutable trace)
│   └── Whatever the agent builds
├── Sprite: "side-project"
│   └── ...

Dashboard (Tauri desktop app — panel-based workspace)
├── Home screen (command palette first)
├── Project workspace
│   ├── Top bar (per-project context)
│   ├── Sidebar (services, integrations, assets)
│   └── Panels (chat sessions, iframes, logs, docs, terminals)
├── Cmd+K navigation
├── General agent (cross-project)
└── Connects to control plane (PostgreSQL)
```

## Design Philosophy

1. **The agent is general-purpose.** It doesn't just write code. It builds whatever the project needs — apps, integrations, documents, data pipelines.
2. **Each project is a workspace.** A full Linux machine. Can contain anything. The agent owns the entire environment.
3. **The dashboard is an inspector.** It shows what the agent built, lets you chat, and provides control. It doesn't do the work.
4. **Integrations are code.** The agent builds integrations by writing code that uses APIs. Credentials are machine secrets.
5. **Source of truth is in the sandbox.** Files, databases, Pi sessions, inspect metadata — all inside the Sprite. The control plane stores ownership, auth, and routing.
6. **Cloud-first.** Fly Sprites with durable storage, checkpoints, and scale-to-zero. Local runtime is future convenience work.
7. **Multi-provider.** Use any LLM. Switch mid-session.
8. **Auditable.** Immutable Pi event trace. Inspect database. Full visibility into what the agent did.
9. **Centralized control plane.** PostgreSQL with better-auth. Stores users, project ownership, settings, and Sprite routing.

## Quick Links

- [Architecture](./ARCHITECTURE.md) — Sprites, Pi agent, bridge server, inspect DB, integrations, secrets
- [Roadmap](./ROADMAP.md) — phases and dependencies
- [Phase 1](./phases/PHASE-1.md) — Dashboard shell (local-only, mock data)
- [Phase 2](./phases/PHASE-2.md) — Cloud agent runtime (Sprites + bridge + bootstrap)
- [Phase 3](./phases/PHASE-3.md) — Interaction layer (chat, surfaces, inspect, general agent)
- [Phase 4](./phases/PHASE-4.md) — Polish, scheduler, cross-project intelligence
- [Phase 5](./phases/PHASE-5.md) — Local runtime (future work — Docker, offline, hybrid)
