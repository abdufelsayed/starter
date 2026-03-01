# Phase 3: Interaction Layer

> Chat panels, service/app panels, sidebar inspect, general agent. The full interactive experience.

---

## What Phase 3 Delivers

Talk to the agent through chat panels. See what it builds by opening services, apps, and assets as panels. The sidebar shows integrations, services, and assets from the inspect database — click anything to open it. Multiple chat sessions, multiple app views, all resizable and arrangeable. A general agent can reach across all projects. After this phase, Starter is fully usable.

---

## 3.1 Chat Panels

### Scope

Chat sessions open as panels in the project workspace. Users can have multiple chat sessions open simultaneously, each in its own panel. Each chat session connects to the project's bridge SSE endpoint on the Sprite URL.

### Flow

```text
User types message in a chat panel
  → POST https://<sprite-url>/starter/prompt
  → Bridge server → Pi AgentSession.prompt()
  → Pi processes (LLM + tool calls)
  → Bridge streams events via SSE
  → Chat panel renders streaming text + tool calls
```

### UI

- Opens as a panel (resizable, draggable, can be split/stacked)
- Multiple chat sessions side by side (different Pi sessions)
- Streaming text rendering (markdown)
- Tool call display (collapsible — tool name, input, output)
- Cmd+Enter to send
- Model indicator (shows current provider/model)
- Steer button (interrupt agent mid-run)
- Session selector (switch between Pi sessions within a chat panel, or open new session)

### Done When

- [ ] Chat opens as a panel in the project workspace
- [ ] Multiple chat panels can be open simultaneously
- [ ] Each chat panel can target a different Pi session
- [ ] Messages send via `POST /starter/prompt` on Sprite URL
- [ ] Agent responses stream via `GET /starter/events` (SSE EventSource)
- [ ] Markdown rendering
- [ ] Tool calls shown (collapsible)
- [ ] Streaming indicator
- [ ] Durable stream reconnection (`Last-Event-ID`)
- [ ] Steer / abort buttons functional
- [ ] Model indicator showing current provider/model
- [ ] New session / switch session from within chat panel

### References

- [MDN: EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [TanStack Query](https://tanstack.com/query/latest)
- [Pi SDK Event Types](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- Bridge API endpoints defined in [Phase 2.1](./PHASE-2.md#21-bridge-server)

---

## 3.2 Service & App Panels

### Scope

Services, apps, and assets from the inspect DB can be opened as panels. Click a service in the sidebar → it opens as a panel (iframe for apps, log viewer for crons, etc.). Multiple services can be open simultaneously in separate panels.

### Panel Types

- **App/API panel** — iframe pointing to the service's port on the Sprite URL. The bridge reverse-proxies to the correct port.
- **Cron/worker panel** — log viewer showing recent output, schedule info, status.
- **Asset panel** — document viewer (PDF, markdown), spreadsheet viewer, image viewer, or download link.
- **Terminal panel** — shell access into the Sprite (future, nice-to-have).

### Implementation

Each service panel loads an iframe targeting the specific port:

```tsx
// For a service on port 3000
<iframe
  src={`${project.spriteUrl}`} // bridge proxies to :3000 by default
  className="h-full w-full border-0"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
/>

// For a service on port 4000 (alternate port)
// Bridge needs port routing support or service-specific paths
```

When the agent calls `notify_dashboard({ refreshIframe: true })`, the dashboard receives this as an SSE event and refreshes relevant panels.

### Done When

- [ ] Services in sidebar open as panels when clicked
- [ ] App/API panels render iframes to the correct port
- [ ] Placeholder when service is stopped or not serving
- [ ] Panels refresh on `notify_dashboard` SSE events
- [ ] Loading state while project wakes from cold/warm to running
- [ ] Asset panels render viewers (PDF, markdown, images)
- [ ] Multiple service panels open simultaneously

### References

- Bridge reverse proxy defined in [Phase 2.1](./PHASE-2.md#21-bridge-server)
- `notify_dashboard` tool defined in [Phase 2.2](./PHASE-2.md#22-starter-pi-extension)

---

## 3.3 Sidebar Inspect

### Scope

The sidebar shows what the agent has created: integrations, services, and assets. Reads from the project's inspect database via `GET /starter/inspect`. Clicking items opens them as panels.

### UI

```
┌─────────────────────┐
│ Services             │
│   ▶ Sales Dashboard  │  ← click → opens iframe panel
│   ▶ Email Sync       │  ← click → opens log panel
│   ■ Data Pipeline    │
│                      │
│ Integrations         │
│   ● Salesforce       │  ← click → opens detail panel
│   ● Gmail            │
│   ○ Stripe           │
│                      │
│ Assets               │
│   📄 Q4 Report       │  ← click → opens viewer panel
│   📊 Customer Data   │
└─────────────────────┘
```

### Interactions

- Click a service → opens a new panel (iframe for apps, log viewer for crons/workers)
- Click an integration → opens detail panel (name, status, secrets, description)
- Click an asset → opens viewer panel (PDF, markdown, image) or downloads
- Right-click context menu for secondary actions (stop service, delete asset, etc.)
- Auto-refresh on relevant SSE events

### Done When

- [ ] Sidebar renders in project workspace
- [ ] Reads integrations, services, assets from `GET /starter/inspect`
- [ ] Click service → opens as panel
- [ ] Click integration → opens detail panel
- [ ] Click asset → opens viewer panel
- [ ] Status indicators (running/stopped/connected/disconnected)
- [ ] Auto-refresh on SSE events
- [ ] Empty states when no items exist
- [ ] Collapsible sections

### References

- Inspect DB schema defined in [Architecture](../ARCHITECTURE.md#5-inspect-database--project-metadata)
- Inspect endpoint defined in [Phase 2.1](./PHASE-2.md#21-bridge-server)

---

## 3.4 General Agent

### Scope

Dashboard-integrated agent that can reach into any project's Sprite. Accessible from the home screen or Cmd+K. Uses Pi SDK locally with custom Sprite tools.

### Implementation

```typescript
import { createAgentSession, SessionManager } from "@mariozechner/pi-coding-agent";

const { session } = await createAgentSession({
  model: getModel(settings.defaultProvider, settings.defaultModel),
  sessionManager: SessionManager.create("~/.starter/general-agent/sessions"),
  customTools: [spriteExecTool, spriteReadTool, spriteWriteTool, listProjectsTool],
});
```

### Tools

```text
sprite_exec(project, command)         — Run command via Sprite `execFile()`
sprite_read(project, path)            — Read file from project Sprite
sprite_write(project, path, content)  — Write file to project Sprite
list_projects()                       — List all projects with URL and status
```

### UI

Same chat panel UI as project chat, but at the dashboard level (not project-scoped). Opens as a panel on the home screen or via Cmd+K "Open general agent."

### Done When

- [ ] General agent accessible from home screen
- [ ] Accessible via Cmd+K "Open general agent"
- [ ] Pi SDK creates AgentSession with custom Sprite tools
- [ ] Can list all projects (including Sprite URL + status)
- [ ] Can exec commands in any project Sprite
- [ ] Can read/write files in any project Sprite
- [ ] Chat UI reuses same components as project chat
- [ ] Multi-provider support (same provider config as project agents)
- [ ] Session persistence in `~/.starter/general-agent/sessions/`

### References

- [Pi SDK (createAgentSession)](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Sprites JavaScript SDK (`@fly/sprites`)](https://docs.sprites.dev/sdks/javascript/)
- [Sprites API](https://sprites.dev/api)

---

## Implementation Order

```text
3.1 Chat Panels ──→ 3.4 General Agent (reuses chat panel + Pi SDK)
3.2 Service & App Panels ──→ 3.3 Sidebar Inspect (reads inspect DB, opens panels)
```

Chat panels and service panels can be built in parallel. General agent reuses chat panel from 3.1. Sidebar inspect builds on service panels from 3.2.

---

## Dependencies

- **Phase 1** — dashboard shell, routes, project registry, settings
- **Phase 2** — bridge server (SSE + API + inspect endpoint), Fly Sprites integration, bootstrap
