# Tasks: Todo Priority System

**Input**: Design documents from `/specs/001-todo-priority-system/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contract.md ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in each description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the shared constants that all user story phases depend on.

- [x] T001 Add `PRIORITY_WEIGHT` (`{ high: 1, medium: 2, low: 3 }`) and `PRIORITY_LABELS` (`{ high: { symbol: '!!', label: 'High' }, medium: { symbol: '!', label: 'Med' }, low: { symbol: '↓', label: 'Low' } }`) constants near the top of `main.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `priority` field to the data model and wire up localStorage persistence. ALL user stories depend on this.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `loadTodos()` function (reads and parses `localStorage.getItem('todos')`; coerces missing priority to `'medium'`; falls back to `[]` on parse failure) and `saveTodos()` function (`localStorage.setItem('todos', JSON.stringify(todos))`) in `main.js`
- [x] T003 Call `loadTodos()` at the start of `init()` to initialize `todos` from localStorage, and call `saveTodos()` at the end of `addTodo()`, `toggleTodo()`, `deleteTodo()`, and `reorderTodos()` in `main.js`

**Checkpoint**: Foundation ready — priority data model exists and all mutations persist to localStorage.

---

## Phase 3: User Story 1 — Assign Priority to a Todo (Priority: P1) 🎯 MVP

**Goal**: Users can select a priority level when creating a todo, and change priority on existing todos.

**Independent Test**: Create a todo with "High" priority — it persists with `priority: 'high'`. Change an existing todo from Medium to Low — change reflects immediately. Reload the page — priorities are preserved.

### Implementation for User Story 1

- [x] T004 [US1] Add `<select id="prioritySelect" aria-label="Priority">` with `<option value="high">High</option>`, `<option value="medium" selected>Medium</option>`, `<option value="low">Low</option>` inside `.input-section` before `#addBtn` in `index.html`
- [x] T005 [US1] Update `addTodo()` in `main.js` to read `document.getElementById('prioritySelect').value` and assign it as `priority` on the new todo object; reset `prioritySelect` to `'medium'` after adding
- [x] T006 [US1] Add `<select class="priority-edit-select" data-id="${todo.id}" data-priority="${todo.priority}">` with three `<option>` elements (each with `value` and `selected` attribute when matching `todo.priority`) to the `li.innerHTML` template inside `renderTodos()` in `main.js` — omit `aria-label` here; T009 sets the definitive value
- [x] T007 [US1] Wire a `change` event listener on `.priority-edit-select` inside `renderTodos()` in `main.js`: read `data-id`, find the todo, set `todo.priority = e.target.value`, update `e.target.dataset.priority`, call `saveTodos()`, then call `renderTodos()`

**Checkpoint**: User Story 1 fully functional. Adding and editing priority works with localStorage persistence.

---

## Phase 4: User Story 2 — Visual Priority Indicators (Priority: P2)

**Goal**: Each priority level is instantly recognizable by a distinct color-coded style on the inline select. Accessible without relying on color alone.

**Independent Test**: View a list with High, Medium, and Low todos — each select has a visually distinct color. Inspect with a color-blind simulator — the symbol prefix (`!!`, `!`, `↓`) and option text make priority readable without color.

### Implementation for User Story 2

- [x] T008 [P] [US2] Add CSS for `.priority-edit-select` base styles (compact size, font-weight, border-radius, cursor pointer) and attribute-selector rules `[data-priority="high"]` (red left-border + red-tinted background), `[data-priority="medium"]` (amber left-border + amber-tinted background), `[data-priority="low"]` (gray left-border + gray-tinted background) in `styles.css`
- [x] T009 [P] [US2] Update `renderTodos()` in `main.js`: (a) set option text to include symbol prefix — `!! High`, `! Med`, `↓ Low` — using `PRIORITY_LABELS` constants from T001; (b) set `aria-label="Priority: ${PRIORITY_LABELS[todo.priority].label} — click to change"` on the `.priority-edit-select` element (this is the definitive aria-label; T006 intentionally omits it)
- [x] T010 [US2] Add dark mode overrides for `.priority-edit-select` attribute selectors in `styles.css` (ensure sufficient contrast of border and background tint on dark backgrounds under `body.dark-mode`)

**Checkpoint**: User Story 2 fully functional. Priority levels are visually distinct by color AND symbol prefix.

---

## Phase 5: User Story 3 — Sort Todos by Priority (Priority: P3)

**Goal**: A toggle button sorts the list High → Medium → Low (completed items always at bottom); toggling off restores insertion order.

**Independent Test**: Click "Sort by Priority" with a mixed list — High todos rise to the top. Click again — list returns to insertion order. Complete a High priority todo while sorted — it moves to the bottom.

### Implementation for User Story 3

- [x] T011 [US3] Add `let sortByPriority = false;` module-level variable and `getDisplayTodos()` function in `main.js`: calls `getFilteredTodos()`, then if `sortByPriority` is true runs a stable sort using `PRIORITY_WEIGHT` with completed items pushed to the bottom (sort key: `a.completed - b.completed || PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]`)
- [x] T012 [US3] Refactor `renderTodos()` in `main.js` to call `getDisplayTodos()` in place of the direct `getFilteredTodos()` call (single-line change to the `filteredTodos` assignment)
- [x] T013 [P] [US3] Add `<button class="filter-btn" id="sortByPriorityBtn" data-sort="priority">Sort by Priority</button>` to the `.filters` div in `index.html`, after the existing filter buttons
- [x] T014 [US3] Wire `#sortByPriorityBtn` click handler in `init()` in `main.js`: toggle `sortByPriority`, toggle `.active` class on the button, call `renderTodos()`

**Checkpoint**: User Story 3 fully functional. All three stories work independently and together.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, linting, and final validation across all stories.

- [x] T015 [P] Verify all new `<select>` elements added in T004, T006 have `aria-label` attributes and all interactive elements have accessible labels in `index.html` and `main.js`; fix any omissions
- [x] T016 [P] Run `npm run lint` from repo root and fix any ESLint/Stylelint errors reported in `main.js` and `styles.css`
- [x] T017 Run the manual verification checklist in `specs/001-todo-priority-system/quickstart.md` in its entirety; confirm all 9 checklist items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (inline select must exist before styling it)
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion (can start independently of US2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundation — no dependency on other stories
- **US2 (P2)**: Requires US1 — styles the select element created in US1
- **US3 (P3)**: Requires Foundation — no dependency on US1 or US2

### Within Each User Story

- HTML structure tasks before JS wiring tasks (JS event listeners reference DOM elements)
- State/data tasks before render tasks
- Core implementation before polish

### Parallel Opportunities

- T008 (CSS) and T009 (JS option labels) within US2 are in different files — can run in parallel
- T013 (HTML sort button) can run in parallel with T011/T012 (JS sort logic)
- T015 (accessibility audit) and T016 (lint) are independent — can run in parallel

---

## Parallel Example: User Story 2

```
# US2 parallel tasks (different files):
T008: Add priority color styles to styles.css
T009: Add symbol prefixes to option labels in main.js
# Both can proceed simultaneously; T010 (dark mode CSS) follows T008
```

## Parallel Example: User Story 3

```
# US3 partial parallelism:
T011: Add getDisplayTodos() sort logic to main.js
T013: Add sort button HTML to index.html
# T012 depends on T011; T014 depends on T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Add constants (T001)
2. Complete Phase 2: Foundation — persistence (T002, T003)
3. Complete Phase 3: User Story 1 — priority assignment (T004–T007)
4. **STOP and VALIDATE**: Create todos, assign priorities, reload — priorities survive
5. Users can already assign and change priority; app is functional

### Incremental Delivery

1. Setup + Foundation (T001–T003) → todos now persist between page loads
2. US1 (T004–T007) → priority assignment works; deploy as MVP
3. US2 (T008–T010) → priority is now visually distinct; deploy
4. US3 (T011–T014) → sort by priority; deploy
5. Polish (T015–T017) → accessibility and quality pass

### Single Developer Strategy

Work top to bottom in task ID order. Each phase produces a testable increment. Stop at any checkpoint to validate before proceeding.

---

## Notes

- [P] tasks operate on different files — safe to run as parallel AI agent tasks
- [Story] label maps each task to its user story for traceability against spec.md
- `getDisplayTodos()` replaces the direct `getFilteredTodos()` call — the filter logic itself is unchanged
- All new `<select>` elements styled via CSS attribute selectors (`[data-priority="high"]`) — no inline styles
- Avoid: merging multiple user stories into a single task, leaving `data-priority` out of the dynamic re-render after priority change
