let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

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

        const task = {
            id: Date.now(),
            title,
            subject,
            dueDate,
            priority,
            completed: false
        };

        tasks.push(task);
        renderTasks();
        form.reset();
    });

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';

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

            taskList.appendChild(li);
        });
    }
});
