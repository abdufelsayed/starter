# Phase 4: Polish & Intelligence

> Scheduler, cross-project intelligence, multi-provider UX, templates, checkpoints UI, and polish.

---

## Overview

Phases 1-3 deliver the core agent OS. Phase 4 makes it smoother and smarter.

**Depends on:** Phase 3 complete (except 4.1 Scheduler which only needs Phase 2).

---

## 4.1 Scheduler

### Scope

Lightweight scheduler for recurring agent tasks. Runs as a service inside the Sprite alongside the bridge. When a task fires, it sends a `POST /starter/prompt` to the bridge.

### Implementation

A small Bun script (`/home/starter/scheduler.ts`) reads schedule definitions from `/home/starter/schedules.json`.

```json
[
  {
    "id": "daily-report",
    "type": "cron",
    "cron": "0 9 * * *",
    "prompt": "Generate today's daily report.",
    "enabled": true
  },
  {
    "id": "email-sync",
    "type": "interval",
    "interval": "1h",
    "prompt": "Sync new emails from Gmail and update the inbox summary.",
    "enabled": true
  }
]
```

Register and start the service with Sprites primitives:

```typescript
const createScheduler = await sprite.createService("scheduler", {
  cmd: "bun",
  args: ["run", "/home/starter/scheduler.ts"],
});
for await (const event of createScheduler) {
}

const startScheduler = await sprite.startService("scheduler");
for await (const event of startScheduler) {
}
```

### Done When

- [ ] Scheduler script reads from schedules.json
- [ ] Cron/interval/once schedule types supported
- [ ] Sends prompts to bridge API on trigger
- [ ] Registered as Sprite service and started automatically
- [ ] Dashboard UI for managing schedules
- [ ] Schedules survive Sprite sleep/wake cycles

### References

- [Sprites API — Services](https://docs.sprites.dev/api/dev-latest/services/)
- [Sprites JavaScript SDK](https://docs.sprites.dev/sdks/javascript/)
- Bridge prompt endpoint defined in [Phase 2.1](./PHASE-2.md#21-bridge-server)

---

## 4.2 Cross-Project Intelligence

### Scope

Enhance the general agent to be genuinely useful across projects. Not just "exec into Sprites" but smarter: summarization, pattern extraction, knowledge transfer.

### Ideas

- General agent periodically scans project Sprites and maintains a summary
- "What's happening across all my projects?" → synthesized overview
- "Find everything related to supplier X" → searches all project filesystems
- "What patterns am I seeing?" → cross-project analysis
- Transfer learnings: "Apply the pricing model from project A to project B"

### Done When

- [ ] General agent has persistent context about all projects
- [ ] Cross-project search works reliably
- [ ] Summarization of project status across all projects
- [ ] Can transfer knowledge between projects

### References

- [Pi Extensions (persistent state)](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Sprites JavaScript SDK](https://docs.sprites.dev/sdks/javascript/)

---

## 4.3 Multi-Provider UX

### Scope

Make Pi's multi-provider support visible and usable in the dashboard. Model selector, per-project overrides, cost tracking.

### Features

- Model selector in chat header (switch provider/model mid-session)
- Per-project model overrides (project settings)
- Thinking level toggle (off/low/medium/high)
- Token usage display per message
- Cost tracking per project (using Pi token counting)

### Done When

- [ ] Model selector dropdown in chat
- [ ] Switch model at runtime via `POST /starter/config`
- [ ] Per-project model override saved to PostgreSQL
- [ ] Thinking level toggle
- [ ] Token usage shown per message
- [ ] Cost tracking per project

### References

- [Pi Models Configuration](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/models.md)
- [Pi AI Providers](https://github.com/badlogic/pi-mono/tree/main/packages/ai/src/providers)
- Bridge config endpoint defined in [Phase 2.1](./PHASE-2.md#21-bridge-server)

---

## 4.4 Project Templates

### Scope

Pre-configured project starters. When you create a project, optionally apply a template that bootstraps a Sprite with specific tools, code, and agent configuration.

A template is a bootstrap script + AGENTS.md + optional starter files. Applied after the base bootstrap on Sprite creation.

### Examples

- **Data Analysis** — Python, pandas, Jupyter, Streamlit pre-installed. AGENTS.md tuned for data work.
- **Web App** — Node.js project scaffolded, dev server running. AGENTS.md tuned for web development.
- **Research** — Markdown notes structure, search/scraping tools configured.
- **Business Operations** — Database, reporting tools, integration-ready.
- **Blank** — just the base Pi setup, no extras.

### Done When

- [ ] Template selection in create project flow
- [ ] Bundled templates: Blank, Data Analysis, Web App, Research, Business Operations
- [ ] Templates are scripts + files (no special format)
- [ ] User can create templates from existing projects (checkpoint → template)

### References

- [Pi Skills System](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md)

---

## 4.5 Checkpoints UI

### Scope

UI for Sprites copy-on-write checkpoints. Create, list, restore, and manage checkpoints per project. Checkpoints capture the complete filesystem state — milliseconds to create, instant to restore.

### Features

- **Checkpoint management** — UI for creating, listing, restoring, deleting checkpoints
- **Labels** — name/describe checkpoints
- **Auto-checkpoints** — optionally checkpoint before destructive operations
- **Rollback confirmation** — preview what will change before restoring
- **Pi session history** — browse the immutable trace (events, tool calls, sessions)

### Done When

- [ ] Checkpoint UI: create, list, restore, delete
- [ ] Label checkpoints with descriptions
- [ ] Auto-checkpoint option (configurable per project)
- [ ] Rollback preview
- [ ] Pi session/event history browser

### References

- [Sprites Checkpoints](https://sprites.dev/api)
- [Sprites JavaScript SDK](https://docs.sprites.dev/sdks/javascript/)

---

## 4.6 UX Polish

### Scope

Final UX pass. Keyboard shortcuts, transitions, notifications, onboarding.

### Features

- Keyboard shortcuts beyond Cmd+K (Cmd+N new project, Cmd+1/2/3 switch projects, etc.)
- Smooth transitions between projects
- Notifications when background agents complete tasks (via `notify_dashboard` SSE events)
- Onboarding flow for first-time users (set API keys, configure Sprites token, create first project)
- Chat polish (resize, position memory, scroll behavior)
- Project status indicators (`cold`/`warm`/`running`) throughout UI

### Done When

- [ ] Keyboard shortcuts documented and working
- [ ] Smooth project switching
- [ ] Background task notifications
- [ ] First-time onboarding
- [ ] Overall feel is polished and responsive
