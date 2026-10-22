(() => {
  const KEY = 'dailyhelper-mvp-v1';
  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const initial = { tasks: [], expenses: [], notes: [] };
  let state;
  let currentFilter = 'all';
  let editingNoteId = null;
  let toastTimer;
  try { state = { ...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { state = structuredClone(initial); }
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(Number(amount) || 0).replace('KES', 'KSh');
  const dateLabel = (date) => { if (!date) return ''; const d = new Date(`${date}T00:00:00`); return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const monthKey = (date) => String(date || '').slice(0, 7);
  const thisMonth = () => today().slice(0, 7);
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); render(); }
  function toast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); }
  function empty(icon, title, detail = '') { return `<div class="empty-state"><div class="empty-icon">${icon}</div><strong>${escapeHtml(title)}</strong>${detail ? `<div style="margin-top:5px">${escapeHtml(detail)}</div>` : ''}</div>`; }
  function taskMarkup(task) { return `<div class="task-row ${task.done ? 'completed' : ''}"><button class="check-btn ${task.done ? 'checked' : ''}" data-toggle-task="${escapeHtml(task.id)}" aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}">${task.done ? '✓' : ''}</button><div class="task-copy"><div class="task-name">${escapeHtml(task.title)}</div><div class="task-meta">${task.due ? `Due ${escapeHtml(dateLabel(task.due))}` : 'No due date'}${task.due && task.due < today() && !task.done ? ' · Overdue' : ''}</div></div><button class="delete-btn" data-delete-task="${escapeHtml(task.id)}" aria-label="Delete task">×</button></div>`; }
  const categoryIcon = (category) => ({Food:'🍲',Transport:'🚌',Home:'🏠',Bills:'🧾',Shopping:'🛍️',Health:'💚',Other:'◉'}[category] || '◉');
  function expenseMarkup(expense) { return `<div class="expense-row"><div class="expense-symbol">${categoryIcon(expense.category)}</div><div class="expense-copy"><div class="expense-name">${escapeHtml(expense.title)}</div><div class="expense-meta">${escapeHtml(expense.category)} · ${escapeHtml(dateLabel(expense.date))}</div></div><div class="expense-amount">−${money(expense.amount)}</div><button class="delete-btn" data-delete-expense="${escapeHtml(expense.id)}" aria-label="Delete expense">×</button></div>`; }
  function render() {
    const open = state.tasks.filter(t => !t.done), done = state.tasks.filter(t => t.done);
    const monthExpenses = state.expenses.filter(e => monthKey(e.date) === thisMonth());
    $('openTaskStat').textContent = open.length; $('doneTaskStat').textContent = done.length;
    $('monthSpendStat').textContent = money(monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)); $('notesStat').textContent = state.notes.length;
    $('taskNavCount').textContent = open.length;
    const nextTasks = [...open].sort((a,b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 5);
    $('dashboardTasks').innerHTML = nextTasks.length ? nextTasks.map(taskMarkup).join('') : empty('✓', 'Nothing on your list yet', 'Add a task to get your day moving.');
    const sortedTasks = [...state.tasks].sort((a,b) => Number(a.done)-Number(b.done) || (a.due || '9999').localeCompare(b.due || '9999'));
    const filtered = sortedTasks.filter(t => currentFilter === 'all' || (currentFilter === 'open' ? !t.done : t.done));
    $('allTasks').innerHTML = filtered.length ? filtered.map(taskMarkup).join('') : empty('✓', currentFilter === 'done' ? 'No completed tasks yet' : currentFilter === 'open' ? 'You are all caught up' : 'No tasks yet', 'Add a task whenever you are ready.');
    const sortedExpenses = [...state.expenses].sort((a,b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
    $('dashboardExpenses').innerHTML = sortedExpenses.length ? sortedExpenses.slice(0,4).map(expenseMarkup).join('') : empty('◉', 'No expenses recorded', 'Add your first expense to start tracking.');
    $('allExpenses').innerHTML = sortedExpenses.length ? sortedExpenses.map(expenseMarkup).join('') : empty('◉', 'No expenses yet', 'Your saved expenses will appear here.');
    $('expenseMonthTotal').textContent = money(monthExpenses.reduce((sum,e) => sum + Number(e.amount),0));
    $('expenseAllTotal').textContent = money(state.expenses.reduce((sum,e) => sum + Number(e.amount),0));
    $('notesGrid').innerHTML = state.notes.length ? [...state.notes].sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).map(n => `<article class="note-card"><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.body || 'No extra details.')}</p><div class="note-card-footer"><span>Updated ${escapeHtml(dateLabel((n.updatedAt || '').slice(0,10)))}</span><div class="note-actions"><button data-edit-note="${escapeHtml(n.id)}">Edit</button><button data-delete-note="${escapeHtml(n.id)}">Delete</button></div></div></article>`).join('') : empty('▤', 'No notes saved yet', 'Create a note to keep useful details close by.');
    $('taskStatFoot').textContent = open.length ? `${open.length} task${open.length === 1 ? '' : 's'} waiting for you` : 'Ready when you are';
  }
  function openDialog(id) { const d = $(id); if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open',''); }
  function closeDialog(id) { const d = $(id); if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
  function showView(name) { document.querySelectorAll('.view').forEach(v => v.classList.add('hidden')); $(`${name}View`).classList.remove('hidden'); document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name)); window.location.hash = name; }
  function addTask(title, due) { state.tasks.push({id:uid(), title:title.trim(), due, done:false, createdAt:new Date().toISOString()}); save(); toast('Task added. You’ve got this!'); }
  function openNoteEditor(note = null) { editingNoteId = note?.id || null; $('noteDialogTitle').textContent = note ? 'Edit note' : 'New note'; $('noteTitle').value = note?.title || ''; $('noteBody').value = note?.body || ''; openDialog('noteDialog'); }
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.goto)));
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeDialog(btn.dataset.close)));
  $('quickAddTask').addEventListener('click', () => openDialog('taskDialog'));
  $('dashboardAddTask').addEventListener('click', () => openDialog('taskDialog'));
  $('openTaskModal').addEventListener('click', () => openDialog('taskDialog'));
  $('openExpenseModal').addEventListener('click', () => { $('expenseDate').value = today(); openDialog('expenseDialog'); });
  $('openNoteModal').addEventListener('click', () => openNoteEditor());
  $('taskForm').addEventListener('submit', e => { e.preventDefault(); const title = $('taskTitle').value.trim(); if (!title) return; addTask(title, $('taskDate').value); $('taskForm').reset(); closeDialog('taskDialog'); });
  $('expenseForm').addEventListener('submit', e => { e.preventDefault(); const title = $('expenseTitle').value.trim(), amount = Number($('expenseAmount').value), date = $('expenseDate').value; if (!title || !Number.isFinite(amount) || amount <= 0 || !date) { toast('Enter a name, a valid amount, and a date.'); return; } state.expenses.push({id:uid(), title, amount, category:$('expenseCategory').value, date, createdAt:new Date().toISOString()}); save(); $('expenseForm').reset(); closeDialog('expenseDialog'); toast('Expense saved.'); });
  $('noteForm').addEventListener('submit', e => { e.preventDefault(); const title = $('noteTitle').value.trim(); if (!title) return; const now = new Date().toISOString(); if (editingNoteId) { const note = state.notes.find(n => n.id === editingNoteId); if (note) Object.assign(note,{title,body:$('noteBody').value.trim(),updatedAt:now}); } else state.notes.push({id:uid(),title,body:$('noteBody').value.trim(),createdAt:now,updatedAt:now}); save(); closeDialog('noteDialog'); toast(editingNoteId ? 'Note updated.' : 'Note saved.'); editingNoteId = null; });
  $('quickNoteForm').addEventListener('submit', e => { e.preventDefault(); const title = $('quickNoteTitle').value.trim(); if (!title) return; const now = new Date().toISOString(); state.notes.push({id:uid(),title,body:$('quickNoteBody').value.trim(),createdAt:now,updatedAt:now}); save(); $('quickNoteForm').reset(); toast('Quick note saved.'); });
  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => { currentFilter = btn.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn)); render(); }));
  document.addEventListener('click', e => {
    const toggle = e.target.closest('[data-toggle-task]'); if (toggle) { const task = state.tasks.find(t => t.id === toggle.dataset.toggleTask); if (task) { task.done = !task.done; save(); toast(task.done ? 'Task completed!' : 'Task moved back to to-do.'); } }
    const delTask = e.target.closest('[data-delete-task]'); if (delTask && confirm('Delete this task?')) { state.tasks = state.tasks.filter(t => t.id !== delTask.dataset.deleteTask); save(); toast('Task deleted.'); }
    const delExpense = e.target.closest('[data-delete-expense]'); if (delExpense && confirm('Delete this expense?')) { state.expenses = state.expenses.filter(x => x.id !== delExpense.dataset.deleteExpense); save(); toast('Expense deleted.'); }
    const editNote = e.target.closest('[data-edit-note]'); if (editNote) openNoteEditor(state.notes.find(n => n.id === editNote.dataset.editNote));
    const delNote = e.target.closest('[data-delete-note]'); if (delNote && confirm('Delete this note?')) { state.notes = state.notes.filter(n => n.id !== delNote.dataset.deleteNote); save(); toast('Note deleted.'); }
  });
  $('todayLabel').textContent = new Date().toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  const hour = new Date().getHours(); $('greeting').textContent = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  $('expenseDate').value = today();
  const viewFromHash = location.hash.replace('#',''); showView(['dashboard','tasks','expenses','notes'].includes(viewFromHash) ? viewFromHash : 'dashboard'); render();
})();
