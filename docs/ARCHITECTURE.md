# Starter — Architecture

> Cloud-first agent runtime on Fly Sprites. Per-project sandboxed workspaces running Pi agents via a bridge server. Dashboard inspects and controls.

---

## System Overview

Three layers. A **minimal control plane**, **per-project Sprites** (cloud VMs), and a **Tauri dashboard** for inspection and control.

The control plane stores user accounts (via better-auth), project ownership, and routing. Each Sprite is the source of truth for its project — files, agent sessions, inspect metadata, secrets. The dashboard reads from Sprites and the control plane.

```
┌──────────────────────────────────────────────────┐
│ Dashboard (Tauri Desktop App — Panel Workspace)  │
│                                                  │
│ ┌─────────┐ ┌──────────────────┬───────────────┐ │
│ │ Sidebar │ │ Panel: Chat #1   │ Panel: App    │ │
│ │         │ │                  │ (iframe)      │ │
│ │ Services│ │ Talk to the      │               │ │
│ │ ▶ App   │ │ agent here       │ Whatever the  │ │
│ │ ▶ Cron  │ │                  │ agent built   │ │
│ │         │ ├──────────────────┤               │ │
│ │ Integr. │ │ Panel: Chat #2   │               │ │
│ │ ● Sales │ │                  │               │ │
│ │ ● Gmail │ │ Another session  │               │ │
│ │         │ │                  │               │ │
│ │ Assets  │ │                  │               │ │
│ │ 📄 Docs │ │                  │               │ │
│ └─────────┘ └──────────────────┴───────────────┘ │
│ [Top bar: per-project context + Cmd+K]           │
└──────────────┬───────────────────────────────────┘
               │ HTTPS (Sprite URL)
┌──────────────▼───────────────────────────────┐
│ Fly Sprites (per-project cloud VMs)          │
│                                              │
│  ┌──────────────┐  ┌──────────────┐         │
│  │ Sprite: A    │  │ Sprite: B    │  ...    │
│  │              │  │              │         │
│  │ Bridge Server│  │ Bridge Server│         │
│  │ Pi Agent     │  │ Pi Agent     │         │
│  │ Full Linux   │  │ Full Linux   │         │
│  │ Inspect DB   │  │ Inspect DB   │         │
│  │ Secrets      │  │ Secrets      │         │
│  │ :8080 → proxy│  │ :8080 → proxy│         │
│  └──────────────┘  └──────────────┘         │
│                                              │
│  Durable NVMe + object storage               │
│  Copy-on-write checkpoints                   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Control Plane (PostgreSQL + better-auth)     │
│  Auth (better-auth: user, session, etc.)     │
│  Projects (ownership, Sprite routing)        │
│  Settings (API keys, provider defaults)      │
│  Sprites API token                           │
└──────────────────────────────────────────────┘
```

---

## 1. Fly Sprites — Per-Project Compute

Each project is a **Sprite** — an isolated cloud VM on [Fly](https://fly.io/) with durable storage.

- **Durable NVMe filesystem** — ext4, directly attached, tiered to object storage. Data persists across compute cycles.
- **Copy-on-write checkpoints** — millisecond snapshots with no interruption. Only changed blocks stored. Instant rollback.
- **Auto-growing storage** — starts at 100GB, scales as needed. Pay only for written blocks.
- **Scale-to-zero** — compute removed when idle (no charge). Same filesystem on wake.
- **Full Linux** — real ext4, shared memory, SQLite in all modes, install anything.
- **HTTPS URL** — each Sprite gets `https://<name>.sprites.app`.
- **Machine secrets** — environment variables accessible from any process in the Sprite.

### Sprite Lifecycle

```
Create (Sprites API) → Bootstrap (install Pi + bridge server)
     ↓
  Running (agent active, serving content)
     ↓
  Cold (compute removed — storage persists, no charge)
     ↓
  Wake (compute reassigned — same filesystem, same data)
     ↓
  Destroy (Sprites API — removes everything)
```

### References

- [Sprites API](https://sprites.dev/api)
- [Sprites API — Sprites](https://sprites.dev/api/sprites)
- [Sprites API — Services](https://docs.sprites.dev/api/dev-latest/services/)
- [Sprites JavaScript SDK (`@fly/sprites`)](https://docs.sprites.dev/sdks/javascript/)

---

## 2. Pi Agent Runtime

[Pi](https://github.com/badlogic/pi-mono) is a minimal, extensible coding agent by Mario Zechner. Runs inside each Sprite via the bridge server.

### Why Pi

- **17+ providers** — Anthropic, OpenAI, Google, Mistral, Groq, xAI, OpenRouter, Amazon Bedrock, Azure, and more via [pi-ai](https://github.com/badlogic/pi-mono/tree/main/packages/ai)
- **Built-in coding tools** — read, write, edit, bash, grep, find, ls
- **SDK** — `createAgentSession()` for full programmatic control
- **Extensions** — register tools, modify system prompts, intercept tool calls, inject messages
- **JSONL session persistence** — branching, compaction, replay. No database needed.
- **Mid-session model switching** — change provider/model at any time
- **Agentic search** — Pi can search the sandbox filesystem. No separate indexing system needed.

### What We Use

| Pi Package                      | Purpose                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| `@mariozechner/pi-coding-agent` | Full coding agent: tools, sessions, extensions, compaction |
| `@mariozechner/pi-ai`           | Provider abstraction: unified LLM API across 17+ providers |

### Agent Autonomy (YOLO Mode)

The agent runs with full permissions inside its Sprite. It can:

- Write and run any code (any language installed or installable)
- Create databases, install packages, start servers
- Build and serve web apps, APIs, dashboards
- Set up integrations with third-party services
- Generate documents, spreadsheets, reports
- Schedule cron jobs and background tasks
- Manage its own memory, skills, and configuration
- Do literally anything a developer + sysadmin can do on a Linux machine

The agent decides what the project needs. The platform provides the machine and stays out of the way.

### Immutable Trace

Pi's JSONL session files form an immutable trace of everything the agent did:

- Every message (user and agent)
- Every tool call (name, input, output, success/error)
- Every session (creation, compaction, branching)

This is the raw audit trail. The dashboard can read it for trust and debugging. It is never modified after writing.

### References

- [Pi Monorepo](https://github.com/badlogic/pi-mono)
- [Pi Coding Agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [Pi SDK (Programmatic Usage)](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#programmatic-usage)
- [Pi SDK Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Pi SDK Source](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/sdk.ts)
- [Pi Extensions](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#extensions)
- [Pi Extensions Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi Extensions Source](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/src/core/extensions)
- [Pi Tools Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/tools.md)
- [Pi Models Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/models.md)
- [Pi Settings Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)
- [Pi Skills Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md)
- [Pi AI Package](https://github.com/badlogic/pi-mono/tree/main/packages/ai)
- [Pi Agent Core](https://github.com/badlogic/pi-mono/tree/main/packages/agent)
- [Pi Provider Implementations](https://github.com/badlogic/pi-mono/tree/main/packages/ai/src/providers)

---

## 3. Bridge Server — Communication Layer

A thin Bun HTTP server (~200-300 lines) that wraps Pi's SDK and exposes it to the dashboard. Runs on port 8080 inside each Sprite, reachable via the Sprite's HTTPS URL.

### Route-Based Splitting

The bridge owns the Sprite's exposed port and does path-based routing:

- `/starter/*` — handled directly (agent API)
- Everything else — reverse-proxied to the agent's app port (default: 3000)

```
https://<sprite-name>.sprites.app
         |
    Bridge Server (:8080 inside Sprite)
         |
    ┌────┴──────────────┐
    |                   |
  /starter/*          everything else
  (agent API)        (reverse proxy → :3000)
```

The `/starter/` namespace is used instead of `/api/` because the agent might build apps that use `/api/` routes.

### API Endpoints

| Method | Path                        | Purpose                                          |
| ------ | --------------------------- | ------------------------------------------------ |
| `GET`  | `/starter/events`           | SSE event stream (durable, sequential IDs)       |
| `POST` | `/starter/prompt`           | Send user message                                |
| `POST` | `/starter/steer`            | Interrupt with steering message                  |
| `POST` | `/starter/follow-up`        | Queue follow-up message                          |
| `POST` | `/starter/abort`            | Cancel current operation                         |
| `GET`  | `/starter/state`            | Current agent state (model, status, app port)    |
| `POST` | `/starter/config`           | Update model, thinking level, app port           |
| `GET`  | `/starter/sessions`         | List available sessions                          |
| `POST` | `/starter/sessions/new`     | Create new session                               |
| `POST` | `/starter/sessions/switch`  | Switch to existing session                       |
| `POST` | `/starter/sessions/compact` | Compact current session                          |
| `GET`  | `/starter/messages`         | Get conversation history                         |
| `GET`  | `/starter/inspect`          | Read inspect DB (integrations, assets, services) |
| `*`    | `/*` (everything else)      | Reverse proxy to app port                        |

### SSE Event Protocol

The bridge subscribes to Pi's `session.subscribe()` and translates events into SSE:

```
event: message_update
id: 1
data: {"type":"text_delta","delta":"Here's the code..."}

event: tool_start
id: 2
data: {"type":"tool_execution_start","toolName":"bash","input":{"command":"npm create vite@latest"}}

event: tool_end
id: 3
data: {"type":"tool_execution_end","toolName":"bash","isError":false}

event: agent_end
id: 4
data: {"type":"agent_end"}
```

Each event gets a sequential ID for durable stream reconnection via `Last-Event-ID`. The bridge maintains an in-memory ring buffer of recent events (last 1000) for reconnection.

### Reverse Proxy

When the app port has no server running, the bridge returns a placeholder page. Once the agent starts a server, the proxy routes traffic automatically.

### References

- [Bun.serve() HTTP Server](https://bun.sh/docs/api/http)
- [Bun APIs](https://bun.sh/docs/runtime/bun-apis)
- [SSE Spec (Last-Event-ID, reconnection)](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---

## 4. Starter Extension — Pi Customization

A Pi extension (`starter-extension.ts`) provides Starter-specific behavior inside each Sprite. Loaded via Pi's extension system at session creation.

### App Port Auto-Detection

Monitors bash tool output for common dev server patterns (`Listening on port 3000`, `Local: http://localhost:5173`, etc.) and updates the bridge's reverse proxy target.

### Dashboard Notification Tool

Registers a `notify_dashboard` tool the agent can call to signal the dashboard:

```typescript
pi.registerTool({
  name: "notify_dashboard",
  description: "Notify the Starter dashboard. Use when you've completed significant work.",
  parameters: Type.Object({
    message: Type.String(),
    type: Type.Optional(Type.String({ enum: ["info", "success", "warning", "error"] })),
    refreshIframe: Type.Optional(Type.Boolean()),
  }),
});
```

### Context Enhancement

Injects Starter-specific instructions into the system prompt via `before_agent_start` hook — telling the agent it's in a Sprite, how to serve apps, how to use the notification tool, and how to write to the inspect database.

### References

- [Pi Extensions Overview](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#extensions)
- [Pi Extensions Detailed API](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi Extensions Source](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/src/core/extensions)

---

## 5. Inspect Database — Project Metadata

A small SQLite database inside each Sprite (`/home/starter/inspect.db`) that the agent writes to directly. The dashboard reads it to know what to show.

Each project has its own. The agent maintains it as part of its normal workflow.

### Schema

```sql
-- Third-party integrations the agent has set up
integrations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,           -- "Salesforce", "Gmail", "Stripe"
  status      TEXT NOT NULL,           -- "connected", "error", "disconnected"
  secrets     TEXT,                    -- JSON array of secret names ["SF_CLIENT_ID", "SF_SECRET"]
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
)

-- Running apps, APIs, and background services
services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,           -- "Sales Dashboard", "Email Sync"
  type        TEXT NOT NULL,           -- "app", "api", "cron", "worker"
  port        INTEGER,                 -- for apps/APIs
  schedule    TEXT,                    -- for crons (e.g., "every 1h")
  status      TEXT NOT NULL,           -- "running", "stopped", "error"
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
)

-- Notable files, documents, reports the agent wants to surface
assets (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,           -- "Q4 Report", "Customer Analysis"
  type        TEXT NOT NULL,           -- "document", "spreadsheet", "image", "data"
  path        TEXT NOT NULL,           -- filesystem path inside the Sprite
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### How It Works

1. The agent sets up a Salesforce integration → writes a row to `integrations`
2. The agent builds a web dashboard → writes a row to `services`
3. The agent generates a report → writes a row to `assets`
4. The dashboard reads the inspect DB via the bridge (`GET /starter/inspect`) and renders surfaces accordingly

The agent writes SQL directly. No abstraction tools, no wrappers. The schema is part of the Starter convention, documented in the agent's system prompt.

---

## 6. Integrations Model

Integrations are **metadata + secrets + agent-written code**.

### The Flow

```
User: "Connect to Salesforce"
  ↓
Agent: researches Salesforce API (or user pastes docs)
  ↓
Agent: prompts user to add secrets (e.g., SALESFORCE_CLIENT_ID, SALESFORCE_SECRET)
  ↓
User: adds secrets as machine-level env vars (Sprites secrets)
  ↓
Agent: writes integration code (OAuth, data sync, etc.)
  ↓
Agent: records integration in inspect DB
  ↓
Any app/script/service in the project can now use $SALESFORCE_CLIENT_ID
```

### Secrets

Secrets are machine-level environment variables managed through the Sprites API. They are:

- Accessible from **any process** — Node.js (`process.env.KEY`), Python (`os.environ["KEY"]`), bash (`$KEY`), Go, Rust, anything
- Not stored in files inside the sandbox
- Managed by the platform, not the agent (the agent knows the names, the platform stores the values)
- Revocable by removing the secret from the Sprite

### Why This Works

- Any API is connectable — the agent writes the code
- Integrations are inspectable, modifiable, owned by the user
- The agent can fix integrations when APIs change
- Secrets are environment variables — the way computers already work

---

## 7. Control Plane — PostgreSQL + Auth

A centralized PostgreSQL database with user authentication. Stores project ownership, settings, and Sprite routing.

### Authentication

[better-auth](https://www.better-auth.com/) manages all auth tables (`user`, `session`, `account`, `verification`). Users sign up, log in, and own projects.

### ID Strategy

Tables use `BIGINT GENERATED ALWAYS AS IDENTITY` as the primary key (internal, never exposed) and a `nanoid` public ID for external use (URLs, APIs). This gives sequential B-tree-friendly inserts internally and opaque, non-enumerable IDs externally.

```sql
-- Indexes per table:
-- UNIQUE(public_id)   — for API lookups
-- INDEX(created_at)   — for time-range queries
```

### Schema

Auth tables managed by better-auth. Application tables:

```sql
projects (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id   TEXT NOT NULL DEFAULT nanoid(),
  name        TEXT NOT NULL,
  owner_id    TEXT NOT NULL REFERENCES "user"(id),
  sprite_name TEXT,
  sprite_url  TEXT,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)
-- UNIQUE(public_id)
-- INDEX(created_at)

settings (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES "user"(id),
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  UNIQUE(user_id, key)
)
-- Keys: default_provider, default_model, default_thinking_level, api_keys (JSON), sprites_token
```

Discovery of project contents happens through the agent (Pi's agentic search) or through the inspect DB inside each Sprite.

---

## 8. Dashboard — Tauri Desktop App

Tauri desktop app with a TanStack Start frontend. A panel-based workspace (like VSCode) for inspection and control — not the execution engine.

### Screens

**Home screen** (command-palette-first):

- Clean, minimal
- Cmd+K content visible by default (projects + actions)
- Create project, open general agent, settings

**Project workspace** (panel-based):

- **Top bar** — per-project context (project name, status, Cmd+K trigger). Not global dashboard state — scoped to the active project.
- **Sidebar** — services, integrations, and assets from the inspect DB. Click anything to open it in a new panel.
- **Panels** — resizable, draggable panels for everything:
  - Chat sessions (multiple simultaneous conversations with the agent)
  - Running apps (iframes to services on different ports)
  - Service logs and cron job output
  - Document/asset viewers (PDF, markdown, spreadsheet)
  - Terminals
- Users arrange panels however they want. Split horizontally, vertically, stack tabs within a panel group.

**Settings:**

- Provider/model defaults
- API keys
- Sprites API token

### Data

All data comes from the centralized PostgreSQL control plane (users, projects, settings) or from each Sprite's inspect DB (integrations, services, assets). The dashboard is a client — it doesn't have its own database.

### Communication with Sprites

The dashboard connects to each project's Sprite via HTTPS:

```typescript
// SSE event stream
const eventSource = new EventSource(`${project.spriteUrl}/starter/events`);

// Send a prompt
await fetch(`${project.spriteUrl}/starter/prompt`, {
  method: "POST",
  body: JSON.stringify({ message: "Build a sales dashboard" }),
});

// Read inspect DB
const inspect = await fetch(`${project.spriteUrl}/starter/inspect`);
```

### References

- [Tauri](https://tauri.app/)
- [@tauri-apps/api](https://www.npmjs.com/package/@tauri-apps/api)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Store](https://tanstack.com/store/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [MDN: EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---

## 9. General Agent

Dashboard-integrated agent that can reach into any project's Sprite. Not scoped to a single project.

**Use cases:**

- "Compare data across my business and analytics projects"
- "What's the status of all my projects?"
- "Search all projects for anything related to supplier contracts"
- "Create a new project for tracking expenses"

**Tools:**

```
sprite_exec(project, command)         — Run command in a project's Sprite
sprite_read(project, path)            — Read file from a project
sprite_write(project, path, content)  — Write file to a project
list_projects()                       — List all projects with URL and status
```

Uses Pi's SDK (`createAgentSession()`) with these custom tools wrapping Sprites API calls. Gets the same multi-provider support, session persistence, and compaction as project agents.

### References

- [Pi SDK (createAgentSession)](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Sprites JavaScript SDK (`@fly/sprites`)](https://docs.sprites.dev/sdks/javascript/)

---

## 10. Memory & Sessions

Memory is whatever the agent creates. Pi provides the infrastructure:

- **AGENTS.md** — agent behavior and system prompt (Pi convention)
- **JSONL sessions** — append-only tree with branching, compaction, and replay
- **Automatic compaction** — summarizes old context when nearing the context window limit
- **Session resumption** — `SessionManager.continueRecent()` picks up where it left off on Sprite wake

Beyond that, the agent manages its own memory. It might create markdown notes, a SQLite knowledge base, structured JSON files — whatever it decides is appropriate for the project.

### References

- [Pi Settings Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)
- [Pi Skills Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md)

---

## 11. Tech Stack

### Dashboard (Tauri App)

| Package                           | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| **Bun**                           | Runtime, package manager                              |
| **Tauri + @tauri-apps/api**       | Desktop shell, native window, system access           |
| **TanStack Start + Router**       | Framework, routing                                    |
| **TanStack Query**                | Server state                                          |
| **TanStack Store**                | Client UI state (panel layout, local UI state)        |
| **React 19**                      | UI                                                    |
| **PostgreSQL**                    | Centralized database (users, projects, settings)      |
| **better-auth**                   | Authentication (user, session, account, verification) |
| **@fly/sprites**                  | Sprites SDK (cloud lifecycle)                         |
| **shadcn/ui + Tailwind v4**       | UI components + styling                               |
| **Zod**                           | Validation                                            |
| **@mariozechner/pi-coding-agent** | General agent runtime (local)                         |
| **@mariozechner/pi-ai**           | LLM provider abstraction (general agent)              |

### Agent (Inside Sprite, installed by bootstrap)

| Package                           | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| **@mariozechner/pi-coding-agent** | Agent runtime (SDK mode)                 |
| **@mariozechner/pi-ai**           | LLM provider abstraction (17+ providers) |

### Dev Tools

| Tool       | Purpose    |
| ---------- | ---------- |
| **oxlint** | Linting    |
| **oxfmt**  | Formatting |
| **Vitest** | Tests      |

The agent builds whatever it wants inside its Sprite using whatever tech it chooses.

---

## 12. Key Principles

1. **The agent is general-purpose.** It builds whatever the project needs — apps, integrations, documents, data pipelines, automation.
2. **Each project is a workspace.** A full Linux machine. Can contain anything. The agent owns it completely.
3. **The dashboard is an inspector.** It reads what the agent created and provides control. It doesn't do the work.
4. **Integrations are code.** The agent writes them. Credentials are machine secrets (env vars).
5. **Source of truth is in the sandbox.** Files, sessions, inspect DB, secrets — all inside the Sprite.
6. **Centralized control plane.** PostgreSQL with better-auth. Users, projects, settings, Sprite routing.
7. **Cloud-first.** Fly Sprites with durable storage and checkpoints. Local runtime is future work.
8. **Multi-provider.** Any LLM, switch mid-session, no lock-in.
9. **Auditable.** Immutable Pi trace + inspect DB. Full visibility.
