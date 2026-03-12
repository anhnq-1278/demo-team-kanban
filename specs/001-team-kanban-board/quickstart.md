# Quickstart: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12

---

## Prerequisites

| Tool | Min version | Check |
|---|---|---|
| Node.js | 20 LTS | `node -v` |
| npm | 10+ | `npm -v` |

---

## 1 — Create the Next.js project

```bash
npx create-next-app@14 demo-team-kanban \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd demo-team-kanban
```

---

## 2 — Install dependencies

```bash
# State management + persistence
npm install zustand

# Drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Unique IDs
npm install nanoid

# Accessible UI primitives (optional but recommended)
npx shadcn@latest init
# Answer prompts: style=Default, base color=Slate, CSS variables=yes
npx shadcn@latest add button dialog input dropdown-menu tooltip badge

# Testing
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E
npm install --save-dev @playwright/test
npx playwright install chromium
```

---

## 3 — Configure Next.js for static export

Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",       // ← static site, no Node server
  trailingSlash: true,    // ensures /boards/[id]/ works on GitHub Pages
  images: {
    unoptimized: true,    // required for static export
  },
};

export default nextConfig;
```

---

## 4 — Configure Vitest

Create `vitest.config.ts` at repository root:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
```

Create `src/__tests__/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"build": "next build",
"start": "npx serve out"
```

---

## 5 — Set up folder structure

Create the directories described in plan.md:

```bash
mkdir -p src/app/boards/\[boardId\]
mkdir -p src/components/{board,column,card,activity,member,ui}
mkdir -p src/store/actions
mkdir -p src/data
mkdir -p src/lib
mkdir -p src/__tests__/{unit/store,unit/lib,integration,e2e}
```

---

## 6 — Start with the data layer

Implement in this order (each step is independently testable):

1. **`src/store/types.ts`** — Define all TypeScript interfaces (`Member`, `Comment`,
   `ActivityEntry`, `Card`, `Column`, `Board`, `StoreState`). Follow data-model.md exactly.

2. **`src/data/seed.ts`** — Create `SEED_DATA: StoreState` with 3 boards, sample cards, members.

3. **`src/lib/storage.ts`** — localStorage helpers with quota-error handler.

4. **`src/lib/utils.ts`** — `cn()` (clsx + tailwind-merge), `generateId()` (nanoid wrapper),
   `formatDate()`.

5. **`src/store/actions/*.ts`** — Implement each action file per store-actions.md contract.

6. **`src/store/index.ts`** — Combine into Zustand store with `persist` middleware.

---

## 7 — Build the UI (user story order)

Follow user story priorities from spec.md:

| Priority | Story | Key components |
|---|---|---|
| P1 | Board & Card Management | `BoardList`, `BoardCard`, `CreateBoardDialog`, `KanbanColumn`, `KanbanCard`, `CreateCardInput`, `CardDetailDialog` |
| P2 | Drag-and-drop | `DndContext` wrapper in board page, `useSortable` in `KanbanCard`, `useDroppable` in `KanbanColumn` |
| P3 | Member assignment | `MemberManager`, assignee selector in `CardDetailDialog`, assignee badge on `KanbanCard` |
| P4 | Comments | Comment list + input in `CardDetailDialog` |
| P5 | Activity Log | `ActivityLogPanel` trigger in board header |

---

## 8 — Run locally

```bash
npm run dev          # development server at http://localhost:3000
npm run build        # static export to ./out/
npm run start        # serve ./out/ locally (requires `npm i -g serve` or `npx serve out`)
```

---

## 9 — Run tests

```bash
npm test              # unit + integration (Vitest)
npm run test:e2e      # E2E drag-and-drop flows (Playwright, requires `npm run build` first)
```

---

## 10 — Deploy (GitHub Pages example)

```bash
# next.config.ts: add basePath: "/demo-team-kanban" if repo name differs
npm run build
# Push ./out/ contents to gh-pages branch, or use gh-pages npm package:
npx gh-pages -d out
```

---

## Mock Data

On first load the store is empty. `src/store/index.ts` checks for an empty store on mount:

```ts
// inside Zustand store, called once after rehydration
_hydrateSeed: () => {
  const state = get();
  if (Object.keys(state.boards).length === 0) {
    set(SEED_DATA);
  }
},
```

To reset to seed data during development, run in the browser console:

```js
localStorage.removeItem("kanban-store");
location.reload();
```
