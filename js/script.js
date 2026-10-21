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
        const subject = subjectInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (title === '') {
            errorEl.textContent = 'Title is required';
            errorEl.style.display = 'block';
            return;
        }
        if (subject === '') {
            errorEl.textContent = 'Subject is required';
            errorEl.style.display = 'block';
            return;
        }

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

    filterInput.addEventListener('input', () => {
        renderTasks();
    });

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
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

        // Sort tasks by due date: tasks with due date first (ascending), then tasks without due date
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            return a.id - b.id;
        });

        taskList.innerHTML = '';
        const todayStr = getTodayDateString();

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
            metaLine.appendChild(subjectSpan);

            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'due-date-span';
            dueDateSpan.textContent = task.dueDate || 'No due date';
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
            });
            buttonsWrapper.appendChild(deleteBtn);

            li.appendChild(buttonsWrapper);
            taskList.appendChild(li);
        });
    }

    renderTasks();
    updateFormButtonText();
});