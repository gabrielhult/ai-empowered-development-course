# Data Model: Todo Priority System

**Branch**: `001-todo-priority-system` | **Date**: 2026-03-30

## Entities

### Todo

Represents a single task item in the list.

| Field          | Type                         | Description                                      | Constraints                        |
|----------------|------------------------------|--------------------------------------------------|------------------------------------|
| `id`           | `number`                     | Auto-incrementing integer identifier             | Required, unique, positive integer |
| `text`         | `string`                     | The todo task description                        | Required, non-empty after trim     |
| `completed`    | `boolean`                    | Whether the task is marked done                  | Required, default `false`          |
| `priority`     | `'high' \| 'medium' \| 'low'` | Urgency/importance level *(new field)*           | Required, default `'medium'`       |

**JSON shape** (as stored in `localStorage`):
```json
{
  "id": 3,
  "text": "Review pull request",
  "completed": false,
  "priority": "high"
}
```

---

### Priority Level

An enumerated domain value — not a separate stored entity, but defined here for clarity.

| Value      | Display Label | Symbol Prefix | Sort Weight | Badge Color      |
|------------|---------------|---------------|-------------|------------------|
| `'high'`   | High          | `!!`          | 1 (sorts first)  | Red `#ef4444`  |
| `'medium'` | Med           | `!`           | 2           | Amber `#f59e0b`  |
| `'low'`    | Low           | `↓`           | 3 (sorts last)   | Gray `#9ca3af` |

---

## Application State

In addition to persisted data, these runtime state variables govern the priority feature:

| Variable         | Type      | Initial Value | Description                                                  |
|------------------|-----------|---------------|--------------------------------------------------------------|
| `sortByPriority` | `boolean` | `false`       | Whether the "Sort by Priority" toggle is currently active    |

---

## Validation Rules

- `priority` MUST be one of `'high'`, `'medium'`, `'low'`. Any other value loaded from localStorage is coerced to `'medium'`.
- When a todo is created without an explicit priority selection, `priority` defaults to `'medium'`.

---

## State Transitions

### Priority Change Flow

```
User changes <select> on a todo item
    → todo.priority updated in todos[]
    → renderTodos() called
    → If sortByPriority is active: todo renders in new sorted position immediately
    → todos[] saved to localStorage
```

### Sort Toggle Flow

```
User clicks "Sort by Priority" button
    → sortByPriority toggled
    → renderTodos() called
    → If now active: getDisplayTodos() returns priority-sorted order
    → If now inactive: getDisplayTodos() returns original insertion order
```

### Todo Creation Flow

```
User enters text + optional priority selection + clicks Add (or presses Enter)
    → New todo created with selected priority (default 'medium' if no selection)
    → todos[] updated
    → renderTodos() called
    → todos[] saved to localStorage
```

---

## Persistence

**Storage key**: `'todos'`
**Format**: `JSON.stringify(todos)` — the full array is serialized on every write.
**Read**: On `DOMContentLoaded`, attempt `JSON.parse(localStorage.getItem('todos'))`. If parsing fails or result is not an array, start with an empty array. Any todo missing a `priority` field is assigned `'medium'`.
