# Phase 2: Cloud Agent Runtime

> Fly Sprites, bridge server, Pi agent, bootstrap. First real cloud agent round-trip.

---

## What Phase 2 Delivers

Create a project → a real Sprite is created on Fly. Send a message → it reaches the agent via the bridge server over HTTPS. Get a streaming response back via SSE. The agent has full autonomy inside its Sprite (YOLO mode). This is the first real cloud round-trip, and the dashboard (from Phase 1) connects to real cloud infrastructure.

---

## 2.1 Bridge Server

### Scope

A Bun HTTP server (~200-300 lines) that wraps Pi's SDK and exposes it to the dashboard. Runs on port 8080 inside each Sprite, reachable through the Sprite URL.

- Creates a Pi `AgentSession` via `createAgentSession()`
- `/starter/*` routes — agent API (SSE events, prompt, steer, abort, sessions, config, inspect)
- All other routes — reverse proxy to agent's app port (default 3000)
- CORS headers for dashboard origin

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

Subscribe to Pi's `session.subscribe()`, translate events to SSE with sequential IDs:

```text
event: message_update
id: 1
data: {"type":"text_delta","delta":"Here's the code..."}

event: tool_start
id: 2
data: {"type":"tool_execution_start","toolName":"bash","input":{"command":"npm create vite@latest"}}

event: agent_end
id: 3
data: {"type":"agent_end"}
```

Ring buffer of last 1000 events for durable reconnection via `Last-Event-ID`.

### Inspect Endpoint

The `/starter/inspect` endpoint reads the project's inspect SQLite database and returns the current state:

```json
{
  "integrations": [
    {
      "id": "...",
      "name": "Salesforce",
      "status": "connected",
      "secrets": ["SF_CLIENT_ID", "SF_SECRET"]
    }
  ],
  "services": [
    { "id": "...", "name": "Sales Dashboard", "type": "app", "port": 3000, "status": "running" }
  ],
  "assets": [{ "id": "...", "name": "Q4 Report", "type": "document", "path": "/reports/q4.pdf" }]
}
```

### Key Implementation Details

```typescript
import {
  createAgentSession,
  SessionManager,
  SettingsManager,
  AuthStorage,
} from "@mariozechner/pi-coding-agent";

const state = JSON.parse(readFileSync("/home/starter/state.json"));
const authStorage = AuthStorage.create("/home/starter/auth.json");

for (const [provider, key] of Object.entries(state.apiKeys)) {
  authStorage.setRuntimeApiKey(provider, key);
}

const { session } = await createAgentSession({
  cwd: "/home",
  sessionManager: SessionManager.continueRecent("/home/starter/sessions"),
});

session.subscribe((event) => {
  // Translate to SSE and push to connected clients
});
```

### Reverse Proxy

When no app server is running, return placeholder HTML. When running, proxy all non-`/starter/` requests to `localhost:<appPort>` inside the Sprite.

### Done When

- [ ] Bridge server starts on port 8080 inside a Sprite
- [ ] Pi `AgentSession` created via SDK
- [ ] SSE endpoint streams all Pi events with sequential IDs
- [ ] `POST /starter/prompt` sends message to agent
- [ ] `POST /starter/steer` interrupts agent mid-run
- [ ] `POST /starter/abort` cancels operation
- [ ] `GET /starter/state` returns current model, status, app port
- [ ] `POST /starter/config` updates model/thinking/appPort at runtime
- [ ] Session management endpoints (list, new, switch, compact)
- [ ] `GET /starter/inspect` reads inspect DB and returns JSON
- [ ] Reverse proxy to app port (with placeholder when nothing runs)
- [ ] Durable stream reconnection via `Last-Event-ID`
- [ ] Session resumes on Sprite wake (`SessionManager.continueRecent()`)

### References

- [Pi SDK (createAgentSession)](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#programmatic-usage)
- [Pi SDK Detailed Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Bun.serve() HTTP Server](https://bun.sh/docs/api/http)
- [SSE Spec (Last-Event-ID)](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---

## 2.2 Starter Pi Extension

### Scope

A Pi extension (`starter-extension.ts`) that customizes the agent for the Starter environment. Loaded at session creation via Pi's extension system.

### Capabilities

**App Port Auto-Detection:**

Monitors `tool_execution_end` events for bash commands that start dev servers. Parses common patterns (`Listening on port 3000`, `Local: http://localhost:5173`, etc.) and updates the bridge reverse-proxy target.

```typescript
pi.on("tool_execution_end", async (event, ctx) => {
  if (event.toolName === "bash") {
    const port = detectPort(extractOutput(event));
    if (port) updateAppPort(port);
  }
});
```

**Dashboard Notification Tool:**

```typescript
pi.registerTool({
  name: "notify_dashboard",
  description: "Notify the Starter dashboard. Use when you've completed significant work.",
  parameters: Type.Object({
    message: Type.String({ description: "Notification message" }),
    type: Type.Optional(Type.String({ enum: ["info", "success", "warning", "error"] })),
    refreshIframe: Type.Optional(Type.Boolean({ description: "Refresh the iframe" })),
  }),
  async execute(toolCallId, params, signal, onUpdate) {
    writeNotification(params);
    return { content: [{ type: "text", text: "Dashboard notified." }], details: {} };
  },
});
```

**Context Enhancement:**

Injects Starter-specific instructions via `before_agent_start` hook:

```typescript
pi.on("before_agent_start", async (event, ctx) => {
  return {
    systemPrompt:
      event.systemPrompt +
      `\n\n## Starter Environment
You are running inside an Starter project Sprite on Fly.
- You have full autonomy over this Linux machine.
- Serve web apps on any port. The bridge will auto-detect the port.
- Use notify_dashboard when you complete significant work.
- Machine secrets are available as environment variables.
- Write to /home/starter/inspect.db to surface integrations, services, and assets to the dashboard.
- Your files persist across sessions. The user sees your work through the dashboard.`,
  };
});
```

### Done When

- [ ] Extension loads via Pi's extension system
- [ ] App port auto-detection works for common dev servers (Vite, Next.js, Flask, etc.)
- [ ] `notify_dashboard` tool registered and callable by the agent
- [ ] Context enhancement adds Starter-specific instructions to system prompt
- [ ] Notifications reach the bridge as SSE events

### References

- [Pi Extensions Overview](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#extensions)
- [Pi Extensions Detailed API](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi Tools Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/tools.md)

---

## 2.3 Fly Sprites Integration

### Scope

Sprites SDK client in the dashboard. Project lifecycle: create, get, list, run commands, configure services, manage secrets, delete. Replace Phase 1 mock data with real cloud Sprites.

### Key Primitives

```typescript
import { SpritesClient } from "@fly/sprites";

const client = new SpritesClient(settings.spriteToken);

const sprite = await client.createSprite(projectSlug);
await sprite.execFile("bash", ["-lc", "echo bootstrap"]);

const createBridge = await sprite.createService("bridge", {
  cmd: "bun",
  args: ["run", "/home/starter/bridge.ts"],
  http_port: 8080,
});
for await (const event of createBridge) {
  // Optional stream logging
}

const startBridge = await sprite.startService("bridge");
for await (const event of startBridge) {
  // startup events (stdout/stderr/exit/complete)
}

const spriteInfo = await client.getSprite(projectSlug); // includes sprite URL
const allSprites = await client.listAllSprites();
await client.deleteSprite(projectSlug);
```

### Core REST Endpoints

| Method   | Path                                          | Purpose                            |
| -------- | --------------------------------------------- | ---------------------------------- |
| `POST`   | `/v1/sprites`                                 | Create a Sprite                    |
| `GET`    | `/v1/sprites`                                 | List Sprites                       |
| `GET`    | `/v1/sprites/{name}`                          | Get Sprite details (`url`, status) |
| `DELETE` | `/v1/sprites/{name}`                          | Delete Sprite                      |
| `POST`   | `/v1/sprites/{name}/exec`                     | Run command in Sprite              |
| `POST`   | `/v1/sprites/{name}/exec-stream`              | Stream command execution           |
| `GET`    | `/v1/sprites/{name}/services`                 | List services for Sprite           |
| `POST`   | `/v1/sprites/{name}/services`                 | Create service                     |
| `POST`   | `/v1/sprites/{name}/services/{service}/start` | Start service                      |

### Secrets Management

Machine secrets are managed through the Sprites API and become environment variables inside the Sprite:

```typescript
// Set a secret (from dashboard when user adds integration credentials)
await sprite.setSecrets({ SALESFORCE_CLIENT_ID: "...", SALESFORCE_SECRET: "..." });

// Agent accesses them as normal env vars:
// Node: process.env.SALESFORCE_CLIENT_ID
// Python: os.environ["SALESFORCE_CLIENT_ID"]
// Bash: $SALESFORCE_CLIENT_ID
```

### URL Assignment

Each Sprite has a generated HTTPS URL from the Sprites API:

```text
https://<sprite-name>-<suffix>.sprites.app
```

The dashboard stores the Sprite name and URL in PostgreSQL.

### Status Model

Sprite runtime status from the Sprites API: `cold`, `warm`, or `running`.

### Done When

- [ ] `@fly/sprites` integrated
- [ ] Create project → `createSprite()` succeeds and metadata saved to PostgreSQL
- [ ] Bootstrap command runs via `exec()` / `execFile()`
- [ ] Bridge service configured via `createService()` and started via `startService()`
- [ ] Secrets management via `setSecrets()` works
- [ ] Delete project → `deleteSprite()` removes cloud runtime + metadata
- [ ] Dashboard project list shows Sprite URL + status

### References

- [Sprites API](https://sprites.dev/api)
- [Sprites API — Sprites](https://sprites.dev/api/sprites)
- [Sprites API — Services](https://docs.sprites.dev/api/dev-latest/services/)
- [Sprites JavaScript SDK (`@fly/sprites`)](https://docs.sprites.dev/sdks/javascript/)

---

## 2.4 Bootstrap Script

### Scope

Runs inside a fresh Sprite on project creation. Sets up Pi + bridge server + inspect DB and launches required services.

### Steps

1. Create `/home/starter/` directory
2. Write `package.json` with pinned `@mariozechner/pi-coding-agent` dependency
3. `bun install`
4. Write `bridge.ts`
5. Write `starter-extension.ts`
6. Write `state.json` (provider, model, API keys, app port — from dashboard settings)
7. Write default `AGENTS.md`
8. Initialize inspect DB (`/home/starter/inspect.db`) with schema
9. Configure bridge service and start it

### File Structure After Bootstrap

```text
/home/
  starter/
    bridge.ts              # Bridge server
    starter-extension.ts    # Pi extension
    state.json             # Runtime config
    inspect.db             # SQLite inspect database
    sessions/              # Pi JSONL session files
    package.json
    node_modules/
  AGENTS.md                # Agent behavior instructions
```

### Inspect DB Schema (created at bootstrap)

```sql
CREATE TABLE IF NOT EXISTS integrations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL,
  secrets     TEXT,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  port        INTEGER,
  schedule    TEXT,
  status      TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  path        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Done When

- [ ] Bootstrap command runs after Sprite creation
- [ ] Pi installed and importable
- [ ] Bridge service runs and serves on Sprite URL
- [ ] Extension loaded
- [ ] Default AGENTS.md in place
- [ ] Inspect DB initialized with schema
- [ ] Agent responds to first message via bridge API
- [ ] First round-trip: dashboard → Sprite bridge → Pi → SSE response

### References

- [Sprites JavaScript SDK (`exec`, `execFile`, `spawn`)](https://docs.sprites.dev/sdks/javascript/)
- [Sprites Services API](https://docs.sprites.dev/api/dev-latest/services/)
- [Pi SDK (createAgentSession)](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)

---

## Implementation Order

```text
2.1 Bridge Server ──→ 2.2 Starter Extension ──→ 2.4 Bootstrap Script
                                                      │
2.3 Fly Sprites Integration ─────────────────────────┘
```

Bridge server first (can test against a single dev Sprite). Extension builds on it. Sprites integration in parallel. Bootstrap ties everything together.

---

## Packages

### Dashboard (new in Phase 2)

```text
@fly/sprites            # Sprites SDK (cloud lifecycle)
@tanstack/react-query   # Server state (project status, etc.)
```

### Agent (inside Sprite, installed by bootstrap)

```text
@mariozechner/pi-coding-agent   # Agent runtime
@mariozechner/pi-ai             # LLM provider abstraction
```

### Settings (new in Phase 2)

```text
Sprites API token       # Required for cloud projects
Default Fly region      # Optional default region for Sprite creation
```
