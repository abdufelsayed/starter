# Starter — Implementation Roadmap

> From empty scaffold to agent OS.

---

## Current State

Tauri + TanStack Start scaffolding in place — file-based routing, shadcn/ui, Tailwind v4, TypeScript, oxlint/oxfmt. Tauri desktop shell configured. Previous Phase 1 implementation exists but needs revision for the panel-based workspace model. **No agent runtime, no Sprites integration, no chat.**

Next step: [Phase 1 — Dashboard Shell (revision)](./phases/PHASE-1.md)

---

## Strategy

Build incrementally. Each phase delivers something tangible and testable before moving to the next.

1. **Dashboard shell first** — validate the UI locally with mock data, no external dependencies.
2. **Cloud agent runtime** — Fly Sprites, bridge server, bootstrap. First real message round-trip.
3. **Interaction layer** — chat, surfaces, inspect panel, general agent. Full interactive experience.
4. **Polish** — scheduler, cross-project intelligence, multi-provider UX, templates.
5. **Local runtime (future)** — Docker backend, offline mode, hybrid sync.

---

## Phase 1: Dashboard Shell (Needs Revision)

Local-only. No Sprites, no agents. Mock data. Validates the UI independently. Existing implementation needs revision for the panel-based workspace model.

| Sub-Phase | Name                                  | Status         | Depends On |
| --------- | ------------------------------------- | -------------- | ---------- |
| 1.1       | Database + Auth + Project Registry    | Needs revision | --         |
| 1.2       | Home Screen (Command Palette First)   | Needs revision | 1.1        |
| 1.3       | Project View Layout (Panel Workspace) | Needs revision | 1.1        |
| 1.4       | Cmd+K Command Palette                 | Needs revision | 1.2        |
| 1.5       | Settings Page                         | Needs revision | 1.2        |
| 1.6       | Create Project Flow                   | Needs revision | 1.1        |
| 1.7       | Panel Layout Foundation               | Needs revision | 1.3        |

[Phase 1 Details →](./phases/PHASE-1.md)

---

## Phase 2: Cloud Agent Runtime

Fly Sprites integration, bridge server (wraps Pi SDK), bootstrap script. First real agent round-trip over the cloud.

| Sub-Phase | Name                                                  | Status      | Depends On    |
| --------- | ----------------------------------------------------- | ----------- | ------------- |
| 2.1       | Bridge Server (Bun HTTP, Pi SDK, SSE + reverse proxy) | Not started | --            |
| 2.2       | Starter Pi Extension (port detection, notifications)  | Not started | 2.1           |
| 2.3       | Fly Sprites Integration                               | Not started | Phase 1       |
| 2.4       | Bootstrap Script                                      | Not started | 2.1, 2.2, 2.3 |

[Phase 2 Details →](./phases/PHASE-2.md)

---

## Phase 3: Interaction Layer

Chat, surfaces (iframes + viewers), inspect panel, general agent. The full interactive experience.

| Sub-Phase | Name                 | Status      | Depends On       |
| --------- | -------------------- | ----------- | ---------------- |
| 3.1       | Chat Panels          | Not started | Phase 1, Phase 2 |
| 3.2       | Service & App Panels | Not started | Phase 1, Phase 2 |
| 3.3       | Sidebar Inspect      | Not started | 3.2, Phase 2     |
| 3.4       | General Agent        | Not started | 3.1, Phase 2     |

[Phase 3 Details →](./phases/PHASE-3.md)

---

## Phase 4: Polish & Intelligence

Scheduler, cross-project intelligence, multi-provider UX, templates, checkpoints UI, polish.

| Sub-Phase | Name                       | Status      | Depends On |
| --------- | -------------------------- | ----------- | ---------- |
| 4.1       | Scheduler                  | Not started | Phase 2    |
| 4.2       | Cross-Project Intelligence | Not started | Phase 3    |
| 4.3       | Multi-Provider UX          | Not started | Phase 3    |
| 4.4       | Project Templates          | Not started | Phase 3    |
| 4.5       | Checkpoints UI             | Not started | Phase 3    |
| 4.6       | UX Polish                  | Not started | Phase 3    |

[Phase 4 Details →](./phases/PHASE-4.md)

---

## Dependency Graph

```
Phase 1: Dashboard Shell (Needs Revision)
  1.1 Database ──→ 1.2 Home Screen ──→ 1.4 Cmd+K
                         │                 1.5 Settings
                         └──→ 1.3 Project View ──→ 1.7 Panel Layout
                         └──→ 1.6 Create Project

Phase 2: Cloud Agent Runtime
  2.1 Bridge Server ──→ 2.2 Starter Extension ──→ 2.4 Bootstrap
  2.3 Fly Sprites ────────────────────────────────┘

Phase 3: Interaction Layer
  3.1 Chat Panels ──→ 3.4 General Agent
  3.2 Service Panels ──→ 3.3 Sidebar Inspect

Phase 4: Polish & Intelligence
  4.1 Scheduler        (needs Phase 2 only)
  4.2 Cross-Project    (needs Phase 3)
  4.3 Multi-Provider   (needs Phase 3)
  4.4 Templates        (needs Phase 3)
  4.5 Checkpoints UI   (needs Phase 3)
  4.6 UX Polish        (after all above)
```

---

## Dashboard Packages

| Phase                 | Packages                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Phase 1**           | PostgreSQL (+ client), better-auth, zod                                                                                  |
| **Phase 2**           | @fly/sprites, @tanstack/react-query                                                                                      |
| **Phase 3**           | @mariozechner/pi-coding-agent, @mariozechner/pi-ai (for general agent), @tanstack/store + @tanstack/react-store (panels) |
| **Phase 5 (future)**  | dockerode                                                                                                                |
| **Already installed** | @tanstack/react-start, @tanstack/react-router, @tauri-apps/api, react, tailwindcss, shadcn/ui                            |

Pi packages run inside Sprites (installed by bootstrap) — and also in the dashboard for the general agent.

---

## Routes

```
/                    → Home screen (command palette first, project/actions list)
/projects/:id        → Project view (surfaces + chat + inspect)
/settings            → Dashboard settings (API keys, default provider/model, Sprites token)
```
