import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';

// Feature 3: Priority system constants
const PRIORITY_WEIGHT = { high: 1, medium: 2, low: 3 };
const PRIORITY_LABELS = {
    high:   { symbol: '!!', label: 'High' },
    medium: { symbol: '!',  label: 'Med'  },
    low:    { symbol: '↓',  label: 'Low'  }
};

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

// Current filter (Feature 2)
let currentFilter = 'all';
let dragSrcId = null;
const selectedIds = new Set();

// Feature 3: Persistence helpers
function loadTodos() {
    try {
        const stored = JSON.parse(localStorage.getItem('todos') || '[]');
        if (!Array.isArray(stored)) return [];
        return stored.map(t => ({
            ...t,
            priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
            favorited: Boolean(t.favorited)
        }));
    } catch {
        return [];
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

function init() {
    // Restore todos from localStorage
    todos = loadTodos();
    nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    // Restore dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }

    // Wire up dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
    });

    // Wire up add button
    const addBtn = document.getElementById('addBtn');
    const todoInput = document.getElementById('todoInput');

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Wire up filter buttons (skip non-filter buttons like the sort toggle)
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Wire up bulk action buttons
    document.getElementById('selectAllBtn').addEventListener('click', () => {
        getFilteredTodos().forEach(t => selectedIds.add(t.id));
        renderTodos();
    });

    document.getElementById('markCompletedBtn').addEventListener('click', () => {
        selectedIds.forEach(id => {
            const todo = todos.find(t => t.id === id);
            if (todo) todo.completed = true;
        });
        selectedIds.clear();
        renderTodos();
    });

    document.getElementById('deleteCompletedBtn').addEventListener('click', () => {
        todos = todos.filter(t => !t.completed);
        selectedIds.clear();
        saveTodos();
        renderTodos();
    });

    // Feature 3: Sort by priority toggle
    document.getElementById('sortByPriorityBtn').addEventListener('click', () => {
        sortByPriority = !sortByPriority;
        document.getElementById('sortByPriorityBtn').classList.toggle('active', sortByPriority);
        renderTodos();
    });

    renderTodos();
}

function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}

// Feature 1: Add, toggle, delete todos
function addTodo() {
    const input = document.getElementById('todoInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const text = input.value.trim();

    if (text === '') return;

    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        favorited: false,
        priority: prioritySelect.value || 'medium'
    });

    input.value = '';
    prioritySelect.value = 'medium';
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Feature 4: Favorite toggle
function toggleFavorite(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.favorited = !todo.favorited;
        saveTodos();
        renderTodos();
    }
}

function reorderTodos(srcId, targetId) {
    const srcIndex = todos.findIndex(t => t.id === srcId);
    const targetIndex = todos.findIndex(t => t.id === targetId);
    if (srcIndex === -1 || targetIndex === -1) return;
    const [moved] = todos.splice(srcIndex, 1);
    todos.splice(targetIndex, 0, moved);
    saveTodos();
    renderTodos();
}

// Feature 1: Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const filteredTodos = getDisplayTodos();

    todoList.innerHTML = '';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) li.classList.add('completed');
        li.setAttribute('draggable', 'true');
        li.dataset.id = todo.id;

        const p = todo.priority || 'medium';
        const isFav = Boolean(todo.favorited);
        li.innerHTML = `
            <span class="drag-handle">⠿</span>
            <input type="checkbox" class="todo-select" ${selectedIds.has(todo.id) ? 'checked' : ''}>
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <select class="priority-edit-select" data-id="${todo.id}" data-priority="${p}" aria-label="Priority: ${PRIORITY_LABELS[p].label} — click to change">
                <option value="high" ${p === 'high' ? 'selected' : ''}>${PRIORITY_LABELS.high.symbol} ${PRIORITY_LABELS.high.label}</option>
                <option value="medium" ${p === 'medium' ? 'selected' : ''}>${PRIORITY_LABELS.medium.symbol} ${PRIORITY_LABELS.medium.label}</option>
                <option value="low" ${p === 'low' ? 'selected' : ''}>${PRIORITY_LABELS.low.symbol} ${PRIORITY_LABELS.low.label}</option>
            </select>
            <button class="todo-favorite ${isFav ? 'todo-favorite-active' : ''}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '★' : '☆'}</button>
            <button class="todo-delete">Delete</button>
        `;

        li.querySelector('.todo-select').addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedIds.add(todo.id);
            } else {
                selectedIds.delete(todo.id);
            }
        });
        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.priority-edit-select').addEventListener('change', (e) => {
            const target = todos.find(t => t.id === parseInt(e.target.dataset.id));
            if (target) {
                target.priority = e.target.value;
                e.target.dataset.priority = e.target.value;
                saveTodos();
                renderTodos();
            }
        });
        li.querySelector('.todo-favorite').addEventListener('click', () => toggleFavorite(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));

        li.addEventListener('dragstart', () => {
            dragSrcId = todo.id;
            li.classList.add('dragging');
        });
        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            li.classList.add('drag-over');
        });
        li.addEventListener('dragleave', () => {
            li.classList.remove('drag-over');
        });
        li.addEventListener('drop', (e) => {
            e.preventDefault();
            li.classList.remove('drag-over');
            if (dragSrcId !== todo.id) {
                reorderTodos(dragSrcId, todo.id);
            }
        });
        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        todoList.appendChild(li);
    });
}

// Feature 3: Sort by priority state
let sortByPriority = false;

// Feature 3: Return display-ready todos (filtered + optionally sorted)
function getDisplayTodos() {
    const filtered = getFilteredTodos();
    if (!sortByPriority) return filtered;
    return [...filtered].sort((a, b) =>
        (a.completed - b.completed) || (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
    );
}

// Feature 2: Filter todos based on current filter
function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        return todos.filter(t => t.completed);
    }
    return todos; // 'all'
}

// Feature 2: Set filter and update UI
function setFilter(filter) {
    currentFilter = filter;

    // Update button styling (only affect filter buttons, not the sort toggle)
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    renderTodos();
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
