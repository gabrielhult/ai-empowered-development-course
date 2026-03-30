# UI Contract: Todo Priority System

**Branch**: `001-todo-priority-system` | **Date**: 2026-03-30

This document defines the DOM structure, element IDs, data attributes, and user-visible behaviors that form the contract between HTML, JavaScript, and CSS for the priority feature. Any implementation must honor these contracts.

---

## New HTML Elements

### Priority Select in Input Row (creation)

```html
<!-- Added inside .input-section, before #addBtn -->
<select id="prioritySelect" aria-label="Priority">
  <option value="high">High</option>
  <option value="medium" selected>Medium</option>
  <option value="low">Low</option>
</select>
```

- **Element ID**: `prioritySelect`
- **Default selected value**: `medium`
- **Contract**: Value at the time `addTodo()` is called is used as the new todo's priority.

---

### Sort by Priority Toggle Button

```html
<!-- Added inside .filters div, after existing filter buttons -->
<button class="filter-btn" id="sortByPriorityBtn" data-sort="priority">
  Sort by Priority
</button>
```

- **Element ID**: `sortByPriorityBtn`
- **Active state class**: `active` (same class used by filter buttons when selected)
- **Contract**: Clicking toggles `sortByPriority` state. When active, the button has class `active` and the todo list renders in priority order.

---

### Priority Indicator Select on Each Todo Item

Each todo item contains a single `<select>` element that serves as both the visual priority indicator and the inline edit control:

```html
<!-- Added inside each .todo-item li, after .todo-text span -->
<select
  class="priority-edit-select"
  data-id="{todo.id}"
  data-priority="{level}"
  aria-label="Priority: {Label} — click to change"
>
  <option value="high">!! High</option>
  <option value="medium">! Med</option>
  <option value="low">↓ Low</option>
</select>
```

The `data-priority` attribute drives CSS color styling via attribute selectors. The `selected` attribute is set on whichever option matches the current `todo.priority`.

| `{level}` | `aria-label` example                        |
|-----------|---------------------------------------------|
| `high`    | `Priority: High — click to change`          |
| `medium`  | `Priority: Med — click to change`           |
| `low`     | `Priority: Low — click to change`           |

- **Data attribute `data-id`**: ties the select to a specific todo by ID
- **Data attribute `data-priority`**: drives CSS attribute-selector color styling; updated on every priority change
- **Contract**: `change` event updates `todo.priority` in state, updates `data-priority`, persists to localStorage, and calls `renderTodos()`.

---

## CSS Class Contracts

| Selector                                  | Applied to  | Meaning                                                  |
|-------------------------------------------|-------------|----------------------------------------------------------|
| `.priority-edit-select`                   | `<select>`  | Base styles: compact size, font-weight, border-radius, cursor |
| `.priority-edit-select[data-priority="high"]`   | `<select>`  | Red left-border + red-tinted background — high priority  |
| `.priority-edit-select[data-priority="medium"]` | `<select>`  | Amber left-border + amber-tinted background — medium priority |
| `.priority-edit-select[data-priority="low"]`    | `<select>`  | Gray left-border + gray-tinted background — low priority |

---

## Behavioral Contracts

### Adding a Todo
- The `addTodo()` function reads `prioritySelect.value` and sets it as the new todo's `priority`.
- After adding, `prioritySelect` is reset to `"medium"` (default).

### Changing Priority on Existing Todo
- The `change` event on `.priority-edit-select` finds the todo by `data-id`, updates `priority`, saves to localStorage, and calls `renderTodos()`.

### Sort Toggle
- `sortByPriority` is a module-level boolean.
- `getDisplayTodos()` (wraps `getFilteredTodos()` — filter logic unchanged) returns:
  1. If `sortByPriority` is true: filter result, then stable-sort by priority weight + completed status
  2. If `sortByPriority` is false: filter result only (current behavior preserved)

### Sort Order Rule
```
completed === false, priority === 'high'    → position 1 (top)
completed === false, priority === 'medium'  → position 2
completed === false, priority === 'low'     → position 3
completed === true  (any priority)          → position 4 (bottom)
Within each group: preserve original insertion order (stable sort)
```

### localStorage Contract
- Key: `'todos'`
- Written: after every mutation (add, toggle, delete, priority change, reorder)
- Read: on `DOMContentLoaded` before first render
