// Student Task Organizer - Main JavaScript

let tasks = [];
let editTaskId = null; // null means we are adding a new task

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

    const titleInput = document.getElementById('title');
    const subjectInput = document.getElementById('subject');

    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const backupMessage = document.getElementById('backup-message');

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
            cancelButton.style.display = 'inline-block';
        } else {
            formSubmitButton.textContent = 'Add Task';
            cancelButton.style.display = 'none';
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');

        const title = titleInput.value.trim();
        const rawSubject = subjectInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

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
            priority
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
                completed: false
            };
            tasks.push(task);
        }

        saveTasks();
        renderTasks();
        rebuildSubjectDatalist();
        form.reset();
        clearFormError();
        updateFormButtonText();
    });

    cancelButton.addEventListener('click', () => {
        // Clear the form
        form.reset();
        // Reset edit state
        editTaskId = null;
        // Update button states
        updateFormButtonText();
        // Focus on title field for next task
        document.getElementById('title').focus();
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
                if (confirm('Replace current tasks with imported data?')) {
                    tasks = imported;
                    saveTasks();
                    renderTasks();
                    rebuildSubjectDatalist();
                    backupMessage.textContent = '';
                    backupMessage.style.display = 'none';
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

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function renderTasks() {
        const filterValue = filterInput.value.trim().toLowerCase();

        // Filter tasks by subject
        let filteredTasks = tasks;
        if (filterValue !== '') {
            filteredTasks = tasks.filter(task =>
                task.subject.toLowerCase().includes(filterValue)
            );
        }

        // Sort tasks: unfinished first, then completed; within each group earliest due date first, no due date last
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            return a.id - b.id;
        });

        taskList.innerHTML = '';
        const todayStr = getTodayDateString();

        if (filteredTasks.length === 0) {
            const li = document.createElement('li');
            li.className = 'task-empty';
            li.textContent = tasks.length === 0 ? "No tasks yet. Add your first task!" : "No tasks match this subject.";
            taskList.appendChild(li);
        }

        // Compute summary counts for unfinished tasks
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
                editTaskId = task.id;
                updateFormButtonText();
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
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
                rebuildSubjectDatalist();
            });
            buttonsWrapper.appendChild(deleteBtn);

            li.appendChild(buttonsWrapper);
            taskList.appendChild(li);
        });
    }

    renderTasks();
    rebuildSubjectDatalist();
    updateFormButtonText();
});