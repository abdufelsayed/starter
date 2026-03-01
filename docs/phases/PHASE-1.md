# Phase 1: Dashboard Shell (Needs Revision)

> Build the local dashboard UI with mock data. No Sprites, no agents — just the window.

**Note:** The Tauri desktop shell is already set up in the codebase. Phase 1 focuses on the TanStack Start frontend inside it.

**Status: Needs revision.** Previous implementation used a global tab bar and iframe+chat bubble model. New architecture requires a panel-based workspace with sidebar, resizable/draggable panels, per-project top bar, and no global tab bar.

---

## What Phase 1 Delivers

A working local dashboard: command-palette-first home screen, panel-based project workspace with sidebar, Cmd+K palette, settings page, PostgreSQL project registry, routing. Everything uses mock/placeholder data — no real Sprites or agents yet.

---

## 1.1 Database + Auth + Project Registry

### Scope

PostgreSQL database with users, projects, and settings tables. User authentication. CRUD operations for project metadata. This is the data layer everything else reads from.

### Auth

[better-auth](https://www.better-auth.com/) manages all auth tables (`user`, `session`, `account`, `verification`). Sign up, sign in, session management — all handled by better-auth.

### ID Strategy

Bigint auto-increment as the internal PK (never exposed). Nanoid as the public ID for URLs and APIs. Unique index on `public_id`, separate index on `created_at`.

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

### Server Functions

```typescript
// Projects
getProjects(userId)              // List user's projects
getProject(publicId)             // Get single project by public ID
createProject({ name, ... })     // Insert project
updateProject(publicId, updates) // Update metadata
deleteProject(publicId)          // Remove from registry

// Settings
getSetting(userId, key)          // Get user setting
setSetting(userId, key, value)   // Set user setting
```

### Done When

- [ ] PostgreSQL database set up and connected
- [ ] better-auth configured (sign up, sign in, session management)
- [ ] Projects table with owner relationship and bigint + nanoid IDs
- [ ] Settings table (per-user)
- [ ] All CRUD server functions working
- [ ] Auth middleware protecting routes
- [ ] Zod validation on inputs

---

## 1.2 Home Screen (Command Palette First)

### Scope

The landing page. Clean, minimal. Command-palette-first navigation.

### Behavior

- No selected project (`/`): show the Cmd+K content by default (pinned/open state). This is the only navigation method in the dashboard home.
- Selected project (`/projects/:id`): command palette is inactive by default, but users can trigger it with Cmd+K.
- No separate nav list/buttons on home; navigation actions are palette commands.

### Layout

```
                    starter

        ┌──────────────────────────────────────┐
        │ > Search projects and actions        │
        ├──────────────────────────────────────┤
        │ Projects                             │
        │   🟢 my-business             2h ago  │
        │   ⏹ side-project            3d ago  │
        │   🟢 data-analysis           yesterday│
        │                                      │
        │ Actions                              │
        │   + New Project                      │
        │   ⚙ Settings                         │
        └──────────────────────────────────────┘
```

### Done When

- [ ] Home screen renders at `/`
- [ ] On `/` with no selected project, command palette content is visible by default
- [ ] Recent projects listed from PostgreSQL (with mock seed data)
- [ ] Project status indicators (active/stopped)
- [ ] Relative timestamps
- [ ] Fuzzy search across project names and actions
- [ ] Select project → navigate to `/projects/:id`
- [ ] New project and settings reachable from palette actions

### References

- [TanStack Router (file-based routing)](https://tanstack.com/router/latest/docs/framework/react/overview)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## 1.3 Project View Layout

### Scope

The project view shell — the panel-based workspace that will eventually hold chat sessions, iframes, logs, and more. For now, placeholder areas demonstrating the layout structure.

### Layout

```
┌──────────────────────────────────────────┐
│ project-name              status   Cmd+K │  ← top bar (per-project)
├────────┬─────────────────────────────────┤
│Sidebar │                                 │
│        │  [Panel placeholder]            │
│Services│  "Open a chat session or        │
│ (none) │   explore the sidebar to        │
│        │   get started."                 │
│Integr. │                                 │
│ (none) │                                 │
│        │                                 │
│Assets  │                                 │
│ (none) │                                 │
│        │                                 │
└────────┴─────────────────────────────────┘
```

### Done When

- [ ] Project view renders at `/projects/:id`
- [ ] Top bar with project name, status, Cmd+K trigger
- [ ] Sidebar with placeholder sections (services, integrations, assets)
- [ ] Main panel area with placeholder message
- [ ] Responsive layout

---

## 1.4 Cmd+K Command Palette

### Scope

Command palette is the primary navigation system for the dashboard.

- Home mode (`/`, no selected project): palette content is shown by default.
- Overlay mode (`/projects/:id`, `/settings`): palette starts inactive and opens via Cmd+K.

### Actions

- Switch between projects
- Create new project
- Navigate to settings
- (Later phases add: open general agent, manage integrations)

### Done When

- [ ] Home mode: palette content is visible by default on `/`
- [ ] Overlay mode: Cmd+K opens palette from project and settings pages
- [ ] Fuzzy search across project names
- [ ] Switch to project
- [ ] Create new project action
- [ ] Navigate to settings
- [ ] Overlay closes on Escape / click outside

### References

- [shadcn/ui Command (cmdk)](https://ui.shadcn.com/docs/components/command)

---

## 1.5 Settings Page

### Scope

Settings page for configuring LLM providers and Sprites. Stores default provider/model, API keys, and Sprites API token. Per-user settings stored in PostgreSQL. All used in Phase 2 when connecting to real Sprites and agents.

### Done When

- [ ] Settings page at `/settings`
- [ ] Default provider selector (Anthropic, OpenAI, Google, etc.)
- [ ] Default model input
- [ ] API keys section (key-value pairs per provider, stored in settings table)
- [ ] Sprites API token field
- [ ] All values persisted to PostgreSQL settings table (per-user)
- [ ] Back to home screen (`/`)

---

## 1.6 Create Project Flow

### Scope

Create a new project. In Phase 1 this just inserts into PostgreSQL with a placeholder sprite_name and no URL. Phase 2 will wire it to real Sprite creation.

### Done When

- [ ] Create project dialog/form (name, optional description)
- [ ] Inserts into PostgreSQL with placeholder sprite_name (owned by current user)
- [ ] Navigates to the new project view after creation
- [ ] Accessible from home palette content and Cmd+K overlay

---

## 1.7 Panel Layout Foundation

### Scope

The resizable, draggable panel system that forms the project workspace. Panels can be split horizontally/vertically, resized by dragging edges, and rearranged. This is the foundation that Phase 3 builds on with real content (chat sessions, iframes, logs).

### Implementation

- Panel container with split/resize/drag support
- Panel groups that can hold tabbed content (multiple items stacked in one panel area)
- Sidebar is a fixed panel on the left (collapsible)
- Top bar is per-project, not a global tab bar
- Project switching happens via Cmd+K or home screen, not tabs in the top bar

### Done When

- [ ] Panel layout renders in project view
- [ ] Panels can be split horizontally and vertically
- [ ] Panel edges are draggable for resizing
- [ ] Sidebar renders with collapsible sections
- [ ] Panel state persists across page refresh (localStorage)
- [ ] Placeholder panels for Phase 3 content

---

## Implementation Order

```
1.1 Database ──→ 1.2 Home Screen ──→ 1.3 Project View ──→ 1.7 Panel Layout
                       │
                       ├──→ 1.4 Cmd+K
                       ├──→ 1.5 Settings
                       └──→ 1.6 Create Project
```

---

## Packages

```
PostgreSQL             # Centralized database (projects, settings)
better-auth            # Authentication (user, session, account, verification)
zod                    # Validation
```

Already installed: Tauri, TanStack Start, Router, React, Tailwind, shadcn/ui.

## References

- [Tauri](https://tauri.app/)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [shadcn/ui](https://ui.shadcn.com)
- [Base UI](https://base-ui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
