// Student Task Organizer - Main JavaScript

let tasks = [];
let editTaskId = null; // null means we are adding a new task
let statusFilter = 'all'; // 'all' | 'pending' | 'completed'
let sortMode = 'due'; // 'due' | 'priority' | 'subject' | 'newest'

document.addEventListener('DOMContentLoaded', () => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (e) {
            console.error('Failed to parse tasks from localStorage', e);
            tasks = [];
        }
    }

    const form = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const filterInput = document.getElementById('subject-filter');
    const formSubmitButton = form.querySelector('button[type="submit"]');
    const cancelButton = document.getElementById('cancel-button');
    const errorEl = document.getElementById('form-error');

    const dialog = document.getElementById('task-dialog');
    const openBtn = document.getElementById('open-add-task');
    const closeBtn = document.getElementById('dialog-close');
    const dialogTitle = document.getElementById('dialog-title');

    const titleInput = document.getElementById('title');
    const subjectInput = document.getElementById('subject');

    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const backupMessage = document.getElementById('backup-message');
    const toast = document.getElementById('toast');
    const clearBtn = document.getElementById('clear-completed-btn');
    clearBtn.textContent = 'Clear completed';
    clearBtn.style.display = 'none';

    const statusFilterButtons = document.querySelectorAll('#status-filters .status-pill');

    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', () => {
        sortMode = sortSelect.value;
        renderTasks();
    });

    let deletedTask = null;
    let deletedIndex = -1;
    let toastTimeout = null;

    // Status filter pills click handling
    statusFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            statusFilter = btn.dataset.status;
            statusFilterButtons.forEach(b => {
                const isActive = b.dataset.status === statusFilter;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', isActive);
            });
            renderTasks();
        });
    });

    // Escape key clears search
    filterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            filterInput.value = '';
            renderTasks();
        }
    });

    exportBtn.textContent = 'Export backup';
    importBtn.textContent = 'Import backup';

    function clearFormError() {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }

    titleInput.addEventListener('input', clearFormError);
    subjectInput.addEventListener('input', clearFormError);

    // Update the form submit button text based on edit state
    const updateFormButtonText = () => {
        if (editTaskId !== null) {
            formSubmitButton.textContent = 'Save Changes';
        } else {
            formSubmitButton.textContent = 'Add Task';
        }
        // Cancel button is always visible in the dialog
        cancelButton.style.display = 'inline-block';
    };

    // Update welcome section (greeting, date, subtitle)
    function updateWelcome() {
        const greetingEl = document.getElementById('greeting');
        const dateEl = document.getElementById('today-date');
        const subtitleEl = document.getElementById('welcome-subtitle');
        // If none of the elements exist (e.g., on about/privacy pages), do nothing
        if (!greetingEl && !dateEl && !subtitleEl) return;

        // Greeting based on local hour
        const hour = new Date().getHours();
        let greetingText;
        if (hour >= 5 && hour < 12) greetingText = 'Good morning!';
        else if (hour >= 12 && hour < 18) greetingText = 'Good afternoon!';
        else if (hour >= 18 && hour < 22) greetingText = 'Good evening!';
        else greetingText = 'Working late?';

        const phraseMap = {
            'Good morning!': 'Ready to start the day?',
            'Good afternoon!': 'Ready to get things done?',
            'Good evening!': 'Ready to get things done?',
            'Working late?': "Let's finish strong."
        };
        const fullGreeting = `${greetingText} ${phraseMap[greetingText]}`;
        if (greetingEl) greetingEl.textContent = fullGreeting;

        // Today's date
        if (dateEl) {
            const today = new Date();
            dateEl.textContent = today.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        }

        // Subtitle based on unfinished tasks
        if (subtitleEl) {
            const todayStr = new Date().toISOString().split('T')[0];
            let overdueCount = 0;
            let dueTodayCount = 0;
            let unfinishedTotal = 0;
            tasks.forEach(t => {
                if (t.completed) return;
                unfinishedTotal++;
                if (!t.dueDate) return;
                if (t.dueDate < todayStr) overdueCount++;
                else if (t.dueDate === todayStr) dueTodayCount++;
            });

            let subtitleText;
            if (overdueCount > 0) {
                subtitleText = `You have ${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}. Start with the oldest.`;
            } else if (dueTodayCount > 0) {
                subtitleText = `${dueTodayCount} task${dueTodayCount === 1 ? '' : 's'} due today. You've got this.`;
            } else if (unfinishedTotal === 0) {
                subtitleText = 'Add your first task to get started.';
            } else {
                subtitleText = 'Nothing urgent. A good day to get ahead.';
            }
            subtitleEl.textContent = subtitleText;
        }
    }

    // Dashboard statistics
    function updateDashboard() {
        // Common values
        const todayStr = new Date().toISOString().split('T')[0];
        const total = tasks.length;
        const done = tasks.filter(t => t.completed).length;

        // Stat cards
        try {
            const totalEl = document.getElementById('stat-total');
            const doneEl = document.getElementById('stat-done');
            const todayEl = document.getElementById('stat-today');
            const overdueEl = document.getElementById('stat-overdue');
            if (totalEl && doneEl && todayEl && overdueEl) {
                const todayCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
                const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
                totalEl.textContent = total;
                doneEl.textContent = done;
                todayEl.textContent = todayCount;
                overdueEl.textContent = overdueCount;
            }
        } catch (e) {
            console.error('updateDashboard: stat cards error', e);
        }

        // Progress card
        try {
            const progressMessageEl = document.getElementById('progress-message');
            const progressPercentEl = document.getElementById('progress-percent');
            const progressFillEl = document.getElementById('progress-fill');
            const progressTrackEl = document.getElementById('progress-track');
            const progressCaptionEl = document.getElementById('progress-caption');
            if (progressMessageEl && progressPercentEl && progressFillEl && progressTrackEl && progressCaptionEl) {
                const percent = total === 0 ? 0 : Math.round((done / total) * 100);
                let message = '';
                if (total === 0) {
                    message = 'Add a task to get started';
                } else if (percent < 25) {
                    message = 'Every task you finish counts';
                } else if (percent < 75) {
                    message = 'Keep up the momentum';
                } else if (percent < 100) {
                    message = 'Almost there';
                } else {
                    message = 'All done. Great work!';
                }
                progressMessageEl.textContent = message;
                progressPercentEl.textContent = `${percent}%`;
                progressFillEl.style.width = `${percent}%`;
                progressTrackEl.setAttribute('aria-valuenow', percent);
                if (total === 0) {
                    progressCaptionEl.textContent = 'No tasks yet';
                } else {
                    progressCaptionEl.textContent = `${done} of ${total} tasks completed`;
                }
            }
        } catch (e) {
            console.error('updateDashboard: progress card error', e);
        }

        // Next up card
        try {
            const nextUpList = document.getElementById('next-up-list');
            if (nextUpList) {
                nextUpList.innerHTML = '';
                const unfinishedWithDue = tasks.filter(t => !t.completed && t.dueDate);
                if (unfinishedWithDue.length === 0) {
                    const allUnfinished = tasks.filter(t => !t.completed);
                    const msg = allUnfinished.length === 0
                        ? 'Nothing coming up. Enjoy the break.'
                        : 'Add due dates to see what\'s next.';
                    const li = document.createElement('li');
                    li.className = 'next-up-item';
                    li.textContent = msg;
                    li.style.color = 'var(--text-muted)';
                    li.style.fontStyle = 'italic';
                    nextUpList.appendChild(li);
                } else {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    unfinishedWithDue.sort((a, b) => {
                        const da = new Date(a.dueDate);
                        const db = new Date(b.dueDate);
                        if (da.getTime() !== db.getTime()) return da - db;
                        const pa = priorityOrder[a.priority] ?? 2;
                        const pb = priorityOrder[b.priority] ?? 2;
                        if (pa !== pb) return pa - pb;
                        return a.id - b.id;
                    });
                    const top = unfinishedWithDue.slice(0, 3);
                    top.forEach(task => {
                        const li = document.createElement('li');
                        li.className = 'next-up-item';

                        const titleSpan = document.createElement('span');
                        titleSpan.className = 'next-up-title';
                        titleSpan.textContent = task.title;
                        li.appendChild(titleSpan);

                        const subjectSpan = document.createElement('span');
                        subjectSpan.className = 'next-up-subject';
                        subjectSpan.textContent = task.subject;
                        const hue = getSubjectHue(task.subject);
                        subjectSpan.style.setProperty('--subject-hue', hue);
                        li.appendChild(subjectSpan);

                        const dueInfo = getDueLabelInfo(task.dueDate);
                        const dueSpan = document.createElement('span');
                        dueSpan.className = 'next-up-due ' + dueInfo.className;
                        dueSpan.textContent = dueInfo.text;
                        li.appendChild(dueSpan);

                        nextUpList.appendChild(li);
                    });
                }
            }
        } catch (e) {
            console.error('updateDashboard: next up card error', e);
        }

        // Subject card
        try {
            const subjectList = document.getElementById('subject-list');
            if (subjectList) {
                // Group tasks by subject (case-insensitive, trimmed), keep first spelling
                const groups = new Map();
                tasks.forEach(t => {
                    const key = t.subject.trim().toLowerCase();
                    if (!groups.has(key)) {
                        groups.set(key, { name: t.subject.trim(), total: 0, done: 0 });
                    }
                    const g = groups.get(key);
                    g.total++;
                    if (t.completed) g.done++;
                });
                // Convert to array and sort
                const subjects = Array.from(groups.values());
                subjects.sort((a, b) => {
                    if (b.total !== a.total) return b.total - a.total;
                    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                });
                const maxTotal = subjects.length > 0 ? subjects[0].total : 0;
                subjectList.innerHTML = '';
                if (subjects.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No subjects yet. Add a task to see them here.';
                    li.style.color = 'var(--text-muted)';
                    li.style.fontStyle = 'italic';
                    subjectList.appendChild(li);
                } else {
                    const displayCount = Math.min(5, subjects.length);
                    for (let i = 0; i < displayCount; i++) {
                        const sub = subjects[i];
                        const li = document.createElement('li');
                        // Row head with name and meta
                        const rowHead = document.createElement('div');
                        rowHead.className = 'subject-row-head';
                        const nameSpan = document.createElement('span');
                        nameSpan.className = 'subject-name';
                        nameSpan.textContent = sub.name;
                        const metaDiv = document.createElement('div');
                        metaDiv.className = 'subject-meta';
                        const countSpan = document.createElement('span');
                        countSpan.className = 'subject-count';
                        const taskWord = sub.total === 1 ? 'task' : 'tasks';
                        countSpan.textContent = `${sub.total} ${taskWord}`;
                        const doneSpan = document.createElement('span');
                        doneSpan.className = 'subject-done';
                        if (sub.done === 0) {
                            doneSpan.textContent = '0 done';
                            doneSpan.classList.add('zero');
                        } else if (sub.done === sub.total) {
                            doneSpan.textContent = 'All done';
                            doneSpan.classList.add('all');
                        } else {
                            doneSpan.textContent = `${sub.done} done`;
                            doneSpan.classList.add('partial');
                        }
                        metaDiv.appendChild(countSpan);
                        metaDiv.appendChild(doneSpan);
                        rowHead.appendChild(nameSpan);
                        rowHead.appendChild(metaDiv);
                        li.appendChild(rowHead);
                        // bar
                        const track = document.createElement('div');
                        track.className = 'subject-bar-track';
                        track.setAttribute('role', 'img');
                        track.setAttribute('aria-label', `${sub.name}: ${sub.total} ${taskWord}, ${sub.done} done`);
                        const hue = getSubjectHue(sub.name);
                        track.style.setProperty('--subject-hue', hue);
                        const fill = document.createElement('div');
                        fill.className = 'subject-bar-fill';
                        const pct = maxTotal > 0 ? (sub.total / maxTotal) * 100 : 0;
                        fill.style.width = `${pct}%`;
                        track.appendChild(fill);
                        li.appendChild(track);
                        subjectList.appendChild(li);
                    }
                    if (subjects.length > 5) {
                        const more = subjects.length - 5;
                        const li = document.createElement('li');
                        li.className = 'subject-more';
                        li.textContent = `+${more} more subjects`;
                        li.style.color = 'var(--text-muted)';
                        li.style.fontStyle = 'italic';
                        subjectList.appendChild(li);
                    }
                }
            }
        } catch (e) {
            console.error('updateDashboard: subject card error', e);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');
        const notesInput = document.getElementById('notes');

        const title = titleInput.value.trim();
        const rawSubject = subjectInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        const notes = notesInput.value.trim();

        if (title === '') {
            errorEl.textContent = 'Title is required';
            errorEl.style.display = 'block';
            return;
        }
        if (rawSubject === '') {
            errorEl.textContent = 'Subject is required';
            errorEl.style.display = 'block';
            return;
        }

        // Normalize subject to existing spelling (case-insensitive)
        const subjectMap = new Map();
        tasks.forEach(t => {
            const low = t.subject.toLowerCase();
            if (!subjectMap.has(low)) subjectMap.set(low, t.subject);
        });
        const lowSub = rawSubject.toLowerCase();
        const subject = subjectMap.has(lowSub) ? subjectMap.get(lowSub) : rawSubject;

        const taskData = {
            title,
            subject,
            dueDate,
            priority,
            notes
        };

        if (editTaskId !== null) {
            // Update existing task - preserve completed status
            const taskIndex = tasks.findIndex(t => t.id === editTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
            }
            editTaskId = null;
        } else {
            // Add new task
            const task = {
                id: Date.now(),
                title,
                subject,
                dueDate,
                priority,
                notes,
                completed: false
            };
            tasks.push(task);
        }

        saveTasks();
        renderTasks();
        dialog.close();
    });

    cancelButton.addEventListener('click', () => {
        dialog.close();
    });

    // Dialog open/close handling
    function resetDialog() {
        form.reset();
        editTaskId = null;
        dialogTitle.textContent = 'Add task';
        formSubmitButton.textContent = 'Add Task';
        clearFormError();
    }

    openBtn.addEventListener('click', () => {
        resetDialog();
        dialog.showModal();
        titleInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        dialog.close();
    });

    // Close dialog when clicking backdrop
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });

    dialog.addEventListener('close', () => {
        resetDialog();
    });

    // Export backup
    exportBtn.addEventListener('click', () => {
        const data = JSON.stringify(tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import backup
    importBtn.addEventListener('click', () => {
        importFile.value = '';
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) throw new Error('Not an array');
                const valid = imported.every(item =>
                    item && typeof item.id !== 'undefined' &&
                    typeof item.title === 'string' &&
                    typeof item.subject === 'string' &&
                    typeof item.completed === 'boolean'
                );
                if (!valid) throw new Error('Invalid items');
                // Sanitize notes for each task
                const sanitized = imported.map(item => {
                    let notes = '';
                    if (Object.prototype.hasOwnProperty.call(item, 'notes')) {
                        const raw = item.notes;
                        if (typeof raw === 'string' || typeof raw === 'number') {
                            notes = String(raw).trim();
                        } else {
                            notes = '';
                        }
                        if (notes.length > 200) notes = notes.slice(0, 200);
                    }
                    return { ...item, notes };
                });
                if (confirm('Replace current tasks with imported data?')) {
                    tasks = sanitized;
                    saveTasks();
                    renderTasks();
                    backupMessage.textContent = '';
                    backupMessage.style.display = 'none';
                    hideToast();
                }
            } catch (err) {
                backupMessage.textContent = 'Invalid backup file';
                backupMessage.style.display = 'block';
            }
        };
        reader.readAsText(file);
    });

    filterInput.addEventListener('input', () => {
        renderTasks();
    });

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function rebuildSubjectDatalist() {
        const datalist = document.getElementById('subject-list');
        if (!datalist) return;
        datalist.innerHTML = '';
        const seen = new Map();
        tasks.forEach(task => {
            const key = task.subject.toLowerCase();
            if (!seen.has(key)) {
                seen.set(key, task.subject);
            }
        });
        const subjects = Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            datalist.appendChild(opt);
        });
    }

    function hideToast() {
        toast.style.display = 'none';
        toast.innerHTML = '';
        deletedTask = null;
        deletedIndex = -1;
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }

    function showToast(task, index) {
        deletedTask = task;
        deletedIndex = index;
        toast.innerHTML = '';
        const message = document.createTextNode('Task deleted. ');
        toast.appendChild(message);
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        undoBtn.addEventListener('click', undoDelete);
        toast.appendChild(undoBtn);
        toast.style.display = 'flex';
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(hideToast, 6000);
    }

    function undoDelete() {
        if (deletedTask !== null) {
            tasks.splice(deletedIndex, 0, deletedTask);
            saveTasks();
            renderTasks();
            hideToast();
        }
    }

    function updateClearButton() {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            clearBtn.style.display = 'none';
            clearBtn.disabled = true;
        } else {
            clearBtn.style.display = 'inline-block';
            clearBtn.disabled = false;
        }
    }
clearBtn.addEventListener('click', () => {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        if (confirm(`Remove ${completedCount} completed tasks?`)) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
            updateClearButton();
        }
    });

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Shared helpers for date formatting and subject hue
    function getSubjectHue(subject) {
        const normalized = subject.trim().toLowerCase();
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
        }
        return hash % 360;
    }

    function formatFriendlyDate(iso) {
        const [year, month, day] = iso.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const options = { month: 'short', day: 'numeric' };
        let formatted = date.toLocaleDateString('en-US', options);
        const currentYear = new Date().getFullYear();
        if (date.getFullYear() !== currentYear) {
            formatted += `, ${date.getFullYear()}`;
        }
        return formatted;
    }

    function getDueLabelInfo(dueDate) {
        const todayStr = getTodayDateString();
        if (!dueDate) return { text: '', className: '' };
        const [dy, dm, dd] = dueDate.split('-').map(Number);
        const dueUTC = Date.UTC(dy, dm - 1, dd);
        const [ty, tm, td] = todayStr.split('-').map(Number);
        const todayUTC = Date.UTC(ty, tm - 1, td);
        const diff = Math.floor((dueUTC - todayUTC) / 86400000);
        if (diff < 0) {
            return { text: 'Overdue', className: 'overdue' };
        } else if (diff === 0) {
            return { text: 'Today', className: 'today' };
        } else if (diff === 1) {
            return { text: 'Tomorrow', className: 'tomorrow' };
        } else {
            return { text: formatFriendlyDate(dueDate), className: 'future' };
        }
    }

    function renderTasks() {
        const searchValue = filterInput.value.trim().toLowerCase();

        // Apply status filter
        let filteredTasks = tasks;
        if (statusFilter === 'pending') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (statusFilter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        }

        // Apply search filter across title, subject, notes
        if (searchValue !== '') {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchValue) ||
                task.subject.toLowerCase().includes(searchValue) ||
                (task.notes || '').toLowerCase().includes(searchValue)
            );
        }

        // Split into unfinished and completed
        const pending = filteredTasks.filter(t => !t.completed);
        const completed = filteredTasks.filter(t => t.completed);

        function compareTasks(a, b) {
            switch (sortMode) {
                case 'due':
                    if (!a.dueDate && !b.dueDate) return a.id - b.id;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const da = new Date(a.dueDate);
                    const db = new Date(b.dueDate);
                    if (da.getTime() !== db.getTime()) return da - db;
                    return a.id - b.id;
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    const pa = priorityOrder[a.priority] ?? 2;
                    const pb = priorityOrder[b.priority] ?? 2;
                    if (pa !== pb) return pa - pb;
                    if (!a.dueDate && !b.dueDate) return a.id - b.id;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const da2 = new Date(a.dueDate);
                    const db2 = new Date(b.dueDate);
                    if (da2.getTime() !== db2.getTime()) return da2 - db2;
                    return a.id - b.id;
                case 'subject':
                    const subjCmp = (a.subject || '').localeCompare(b.subject || '', undefined, { sensitivity: 'base' });
                    if (subjCmp !== 0) return subjCmp;
                    if (!a.dueDate && !b.dueDate) return a.id - b.id;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const da3 = new Date(a.dueDate);
                    const db3 = new Date(b.dueDate);
                    if (da3.getTime() !== db3.getTime()) return da3 - db3;
                    return a.id - b.id;
                case 'newest':
                    return b.id - a.id;
                default:
                    return a.id - b.id;
            }
        }

        pending.sort(compareTasks);
        completed.sort(compareTasks);
        const sortedTasks = [...pending, ...completed];

        taskList.innerHTML = '';
        const todayStr = getTodayDateString();

        if (filteredTasks.length === 0) {
            let message;
            if (tasks.length === 0) {
                message = "No tasks yet. Add your first task!";
            } else if (statusFilter === 'pending' && searchValue === '') {
                message = "Nothing pending. Nice work!";
            } else if (statusFilter === 'completed' && searchValue === '') {
                message = "No completed tasks yet.";
            } else {
                message = "No tasks match your search.";
            }
            const li = document.createElement('li');
            li.className = 'task-empty';
            li.textContent = message;
            taskList.appendChild(li);
        }

        // Compute summary counts for unfinished tasks (unchanged, based on all tasks)
        const todayDate = new Date(todayStr + 'T00:00:00');
        const weekLaterDate = new Date(todayDate);
        weekLaterDate.setDate(todayDate.getDate() + 7);
        const weekLaterStr = weekLaterDate.getFullYear() + '-' +
            String(weekLaterDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(weekLaterDate.getDate()).padStart(2, '0');

        let overdueCount = 0, dueTodayCount = 0, dueWeekCount = 0;
        tasks.forEach(t => {
            if (t.completed) return;
            if (!t.dueDate) return;
            if (t.dueDate < todayStr) overdueCount++;
            else if (t.dueDate === todayStr) dueTodayCount++;
            else if (t.dueDate > todayStr && t.dueDate <= weekLaterStr) dueWeekCount++;
        });

        const summaryEl = document.getElementById('task-summary');
        summaryEl.innerHTML = '';
        const badgeData = [
            { count: overdueCount, label: 'Overdue', className: 'overdue' },
            { count: dueTodayCount, label: 'Due today', className: 'due-today' },
            { count: dueWeekCount, label: 'Due in 7 days', className: 'due-week' }
        ];
        badgeData.forEach(b => {
            const span = document.createElement('span');
            span.className = `summary-badge ${b.className}`;
            span.textContent = `${b.label}: ${b.count}`;
            summaryEl.appendChild(span);
        });

        updateClearButton();
        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) li.classList.add('done');
            if (!task.completed && task.dueDate) {
                if (task.dueDate < todayStr) li.classList.add('overdue');
                else if (task.dueDate === todayStr) li.classList.add('due-today');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });
            li.appendChild(checkbox);

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'task-content';

            const titleLine = document.createElement('div');
            titleLine.className = 'task-title-line';
            const titleSpan = document.createElement('span');
            titleSpan.className = 'title-span';
            titleSpan.textContent = task.title;
            titleLine.appendChild(titleSpan);
            contentWrapper.appendChild(titleLine);

            const metaLine = document.createElement('div');
            metaLine.className = 'task-meta-line';

            const subjectSpan = document.createElement('span');
            subjectSpan.className = 'subject-span';
            subjectSpan.textContent = task.subject;
            // compute hue from subject for consistent coloring
            const normalizedSubject = task.subject.trim().toLowerCase();
            let hash = 0;
            for (let i = 0; i < normalizedSubject.length; i++) {
                hash = (hash * 31 + normalizedSubject.charCodeAt(i)) >>> 0;
            }
            const hue = hash % 360;
            subjectSpan.style.setProperty('--subject-hue', hue);
            metaLine.appendChild(subjectSpan);

            // Helper to format due date for display only
            const currentYear = new Date().getFullYear();
            function formatDueDate(iso) {
                const [year, month, day] = iso.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const options = { month: 'short', day: 'numeric' };
                let formatted = date.toLocaleDateString('en-US', options);
                if (date.getFullYear() !== currentYear) {
                    formatted += `, ${date.getFullYear()}`;
                }
                return formatted;
            }

            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'due-date-span';
            dueDateSpan.textContent = task.dueDate ? formatDueDate(task.dueDate) : 'No due date';
            metaLine.appendChild(dueDateSpan);
// Relative due date label for pending tasks with a due date
            if (!task.completed && task.dueDate) {
                const [dy, dm, dd] = task.dueDate.split('-').map(Number);
                const dueUTC = Date.UTC(dy, dm - 1, dd);
                const [ty, tm, td] = todayStr.split('-').map(Number);
                const todayUTC = Date.UTC(ty, tm - 1, td);
                const diff = Math.floor((dueUTC - todayUTC) / 86400000);
                let relText = '';
                if (diff < 0) {
                    const n = -diff;
                    relText = n === 1 ? '1 day ago' : `${n} days ago`;
                } else if (diff === 1) {
                    relText = 'Due tomorrow';
                } else if (diff >= 2 && diff <= 14) {
                    relText = `Due in ${diff} days`;
                }
                if (relText) {
                    const relSpan = document.createElement('span');
                    relSpan.className = 'relative-date' + (diff === 1 ? ' tomorrow' : '');
                    relSpan.textContent = relText;
                    metaLine.appendChild(relSpan);
                }
            }

            const prioritySpan = document.createElement('span');
            prioritySpan.className = `priority-span ${task.priority}`;
            prioritySpan.textContent = task.priority;
            metaLine.appendChild(prioritySpan);

            if (!task.completed && task.dueDate) {
                if (task.dueDate < todayStr) {
                    const statusLabel = document.createElement('span');
                    statusLabel.textContent = 'OVERDUE';
                    statusLabel.className = 'status-label overdue';
                    metaLine.appendChild(statusLabel);
                } else if (task.dueDate === todayStr) {
                    const statusLabel = document.createElement('span');
                    statusLabel.textContent = 'DUE TODAY';
                    statusLabel.className = 'status-label due-today';
                    metaLine.appendChild(statusLabel);
                }
            }

            contentWrapper.appendChild(metaLine);
            // Display notes if present
            if (task.notes && task.notes.trim() !== '') {
                const notesEl = document.createElement('p');
                notesEl.className = 'task-notes';
                notesEl.textContent = task.notes;
                notesEl.title = task.notes;
                contentWrapper.appendChild(notesEl);
            }
            li.appendChild(contentWrapper);

            const buttonsWrapper = document.createElement('div');
            buttonsWrapper.className = 'task-buttons';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => {
                document.getElementById('title').value = task.title;
                document.getElementById('subject').value = task.subject;
                document.getElementById('due-date').value = task.dueDate;
                document.getElementById('priority').value = task.priority;
                document.getElementById('notes').value = task.notes || '';
                editTaskId = task.id;
                updateFormButtonText();
                dialogTitle.textContent = 'Edit task';
                dialog.showModal();
                document.getElementById('title').focus();
            });
            buttonsWrapper.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                if (task.id === editTaskId) {
                    editTaskId = null;
                    form.reset();
                    updateFormButtonText();
                }
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    const removedTask = tasks[taskIndex];
                    tasks.splice(taskIndex, 1);
                    saveTasks();
                    renderTasks();
                    showToast(removedTask, taskIndex);
                }
            });
            buttonsWrapper.appendChild(deleteBtn);

            li.appendChild(buttonsWrapper);
            taskList.appendChild(li);
        });
        // Update welcome section after rendering tasks
        updateDashboard();
        rebuildSubjectDatalist();
        updateWelcome();
    }

    renderTasks();
    rebuildSubjectDatalist();
    updateFormButtonText();
    // Initial welcome update
    updateWelcome();
    updateDashboard();

    // Refresh welcome and tasks when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateWelcome();
            renderTasks();
        }
    });
});