# Developer Quickstart: Todo Priority System

**Branch**: `001-todo-priority-system` | **Date**: 2026-03-30

## Prerequisites

- Node.js (v18+)
- npm

## Running the App

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

## Files to Modify

| File          | What changes                                                                 |
|---------------|------------------------------------------------------------------------------|
| `index.html`  | Add `<select id="prioritySelect">` in input row; add sort button in filters  |
| `main.js`     | Add priority field to todos; add sort state; update render/filter/persist    |
| `styles.css`  | Add `.priority-badge`, `.priority-badge--high/medium/low`, sort button style |

## Key Implementation Points

### 1. Load todos from localStorage on init

```js
let todos = JSON.parse(localStorage.getItem('todos') || '[]').map(t => ({
  ...t,
  priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium'
}));
```

### 2. Save todos after every mutation

Call this after any change to the `todos` array:

```js
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}
```

### 3. Priority sort order

```js
const PRIORITY_WEIGHT = { high: 1, medium: 2, low: 3 };

function getDisplayTodos() {
  const filtered = getFilteredTodos(); // existing filter logic
  if (!sortByPriority) return filtered;
  return [...filtered].sort((a, b) => {
    // Completed items sink to bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    // Stable sort preserves relative order within same weight
  });
}
```

### 4. Priority badge in renderTodos

```js
const PRIORITY_LABELS = {
  high:   { symbol: '!!', label: 'High' },
  medium: { symbol: '!',  label: 'Med'  },
  low:    { symbol: '↓',  label: 'Low'  },
};

// Inside the li.innerHTML template:
// <span class="priority-badge priority-badge--${todo.priority}"
//       aria-label="Priority: ${PRIORITY_LABELS[todo.priority].label}"
//       data-priority="${todo.priority}">
//   ${PRIORITY_LABELS[todo.priority].symbol} ${PRIORITY_LABELS[todo.priority].label}
// </span>
```

## Manual Verification Checklist

- [ ] Add a todo with "High" priority — badge shows red `!! High`
- [ ] Add a todo with "Low" priority — badge shows gray `↓ Low`
- [ ] Add a todo with no priority change — badge shows amber `! Med`
- [ ] Change an existing todo's priority via the inline select — badge updates immediately
- [ ] Click "Sort by Priority" — High todos move to top, Low to bottom
- [ ] Click "Sort by Priority" again — list returns to insertion order
- [ ] Mark a todo complete, then sort — completed item goes to bottom regardless of priority
- [ ] Reload the page — todos and their priorities are preserved
- [ ] Toggle dark mode — all priority badges remain legible

## Linting

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint:fix
```
