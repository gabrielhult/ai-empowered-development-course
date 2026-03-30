# Research: Todo Priority System

**Branch**: `001-todo-priority-system` | **Date**: 2026-03-30

## Decision Log

### 1. Persistence Strategy

**Decision**: Persist the entire `todos` array (including the new `priority` field) in `localStorage` as a JSON string under the key `todos`.

**Rationale**: The existing app stores no todos between page loads. FR-006 requires persisting priority across sessions, which is meaningless without persisting the todos themselves. `localStorage` is already used for dark mode preference, is available with no new dependencies, and suits the browser-only, single-user scope perfectly.

**Alternatives Considered**:
- Session-only (in-memory): Rejected — violates FR-006.
- IndexedDB: Rejected — unnecessary complexity for a personal todo list of < 200 items.
- Backend/server persistence: Rejected — project has no server component.

**Migration**: Existing users have no stored todos (app currently doesn't persist them), so no migration of old data is needed. A `priority` field absent from any loaded todo object defaults to `'medium'` at read time as a safety guard.

---

### 2. Priority Selector UI

**Decision**: Use a `<select>` dropdown element in the input row for assigning priority when creating a new todo. For editing priority on an existing item, add a `<select>` inline in each todo item row (replacing the static priority badge with an interactive one).

**Rationale**: A `<select>` is a native, accessible HTML control that works without a framework. It integrates cleanly into the existing `flexbox` row layout. It is screen-reader-friendly and keyboard-navigable out of the box.

**Alternatives Considered**:
- Radio buttons: More visible but occupy too much horizontal space in the compact todo row layout.
- Clicking the badge cycles through levels: Compact but not discoverable and lacks accessible labelling.
- Edit modal: Heavyweight UX for a simple one-field change.

---

### 3. Sort Trigger Mechanism

**Decision**: Add a "Sort by Priority" toggle button in the `.filters` row. When active, it applies priority ordering; when inactive, the original insertion order is restored. Button visually matches existing active `.filter-btn` styling when sort is on.

**Rationale**: A toggle is familiar (the existing filter buttons use the same on/off pattern) and explicit — users clearly see whether sort is active. The spec states sorting should be a triggered action, not a permanent default.

**Alternatives Considered**:
- Sort always on: Violates spec assumption; breaks existing insertion-order behavior.
- Separate sort controls section: Overkill for a single sort dimension.
- Column header click: No column header in the current flat list layout.

---

### 4. Visual Indicator Design

**Decision**: Display a compact `<span>` badge next to the todo text. The badge contains both a text abbreviation and an `aria-label` for accessibility:

| Priority | Badge text | Color scheme (light)   | Color scheme (dark)    |
|----------|------------|------------------------|------------------------|
| High     | `!! High`  | Red background (#ef4444) / white text | Same (sufficient contrast) |
| Medium   | `! Med`    | Amber background (#f59e0b) / white text | Same |
| Low      | `↓ Low`    | Gray background (#9ca3af) / white text | Same |

**Rationale**: Using both a symbol prefix and a text label ensures priority is distinguishable without relying on color alone (FR-005 / SC-005). Badges are compact and scannable. Colors use the existing Tailwind-inspired palette already present in `styles.css`.

**Alternatives Considered**:
- Icon-only (no text): Fails accessibility requirement for color-blind users who can't distinguish icon shapes.
- Left border stripe only: Subtle and not scannable at a glance (fails SC-002).
- Full-width colored row background: Too visually aggressive; reduces readability of todo text.

---

### 5. Sort Algorithm

**Decision**: Stable sort by priority weight (High=1, Medium=2, Low=3). Within the same priority level, preserve insertion order (stable sort guarantees this in modern JS engines). Completed todos always sort after all active todos within the priority-sorted view.

**Rationale**: Preserving relative order within a priority group matches spec acceptance scenario 2 of User Story 3. JavaScript's `Array.prototype.sort()` is stable in all modern environments (guaranteed since ECMAScript 2019).

**Alternatives Considered**:
- Completed todos sort by their own priority within completed group: More complex, less intuitive than "done is done — it goes to the bottom."
- Separate completed-first and completed-last toggle: Out of scope.
