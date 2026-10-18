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

    // Update the form submit button text based on edit state
    const updateFormButtonText = () => {
        if (editTaskId !== null) {
            formSubmitButton.textContent = 'Save Changes';
        } else {
            formSubmitButton.textContent = 'Add Task';
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('title');
        const subjectInput = document.getElementById('subject');
        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');

        const title = titleInput.value.trim();
        const subject = subjectInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (title === '' || subject === '') {
            alert('Title and subject are required');
            return;
        }

        const taskData = {
            title,
            subject,
            dueDate,
            priority,
            completed: false
        };

        if (editTaskId !== null) {
            // Update existing task
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
        updateFormButtonText();
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
        const sortedTasks = filteredTasks.sort((a, b) => {
            // If both have due date, compare by date
            if (a.dueDate && b.dueDate) {
                return a.dueDate.localeCompare(b.dueDate);
            }
            // If only a has due date, it comes first
            if (a.dueDate && !b.dueDate) {
                return -1;
            }
            // If only b has due date, it comes first
            if (!a.dueDate && b.dueDate) {
                return 1;
            }
            // Both have no due date, maintain original order (sort by id as fallback)
            return a.id - b.id;
        });

        taskList.innerHTML = '';
        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('done');
            }

            // Check for overdue or due today (only if not completed and has due date)
            const todayStr = getTodayDateString();
            if (!task.completed && task.dueDate) {
                if (task.dueDate < todayStr) {
                    li.classList.add('overdue');
                } else if (task.dueDate === todayStr) {
                    li.classList.add('due-today');
                }
            }

            // Checkbox for completion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });
            li.appendChild(checkbox);

            const titleSpan = document.createElement('span');
            titleSpan.textContent = task.title;
            li.appendChild(titleSpan);

            const subjectSpan = document.createElement('span');
            subjectSpan.textContent = task.subject;
            li.appendChild(subjectSpan);

            const dueDateSpan = document.createElement('span');
            dueDateSpan.textContent = task.dueDate || 'No due date';
            li.appendChild(dueDateSpan);

            const prioritySpan = document.createElement('span');
            prioritySpan.textContent = task.priority;
            li.appendChild(prioritySpan);

            // Status label for overdue/due-today
            if (!task.completed && task.dueDate) {
                if (task.dueDate < todayStr) {
                    const statusLabel = document.createElement('span');
                    statusLabel.textContent = 'OVERDUE';
                    statusLabel.className = 'status-label';
                    li.appendChild(statusLabel);
                } else if (task.dueDate === todayStr) {
                    const statusLabel = document.createElement('span');
                    statusLabel.textContent = 'DUE TODAY';
                    statusLabel.className = 'status-label';
                    li.appendChild(statusLabel);
                }
            }

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                // Populate form with task data
                document.getElementById('title').value = task.title;
                document.getElementById('subject').value = task.subject;
                document.getElementById('due-date').value = task.dueDate;
                document.getElementById('priority').value = task.priority;
                editTaskId = task.id;
                updateFormButtonText();
                // Focus the title input for convenience
                document.getElementById('title').focus();
            });
            li.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    }

    // Initial render
    renderTasks();
    updateFormButtonText();
});
