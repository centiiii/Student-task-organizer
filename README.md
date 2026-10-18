# Student Task Organizer

A simple, client-side task organizer designed for college students to manage their academic tasks.

## Features

- Add tasks with title, subject, due date, and priority (low/medium/high)
- Mark tasks as completed
- Edit existing tasks
- Delete tasks
- Filter tasks by subject
- Sort tasks by due date (earliest first)
- Visual highlighting for overdue and due-today tasks
- Data persistence using localStorage (all data stored locally in your browser)
- Responsive design (single column on mobile, two columns on desktop)
- Clean, calm, focused UI with rounded corners and soft shadows

## Technologies Used

- HTML5
- CSS3 (with CSS variables for easy theming)
- Vanilla JavaScript (no frameworks or libraries)

## How to Use

1. Open `index.html` in a web browser.
2. Use the form to add new tasks (title and subject are required).
3. Use the filter input to show only tasks matching a subject.
4. Click the checkbox to mark a task as completed.
5. Click "Edit" to modify an existing task.
6. Click "Delete" to remove a task.
7. Overdue tasks have a red left border and "OVERDUE" label.
8. Due-today tasks have an orange left border and "DUE TODAY" label.

## Data Persistence

All task data is stored in your browser's localStorage. This means:
- Your tasks persist between browser sessions.
- No data is sent to any server or collected externally.
- Clearing your browser data will delete all tasks.

## Files

- `index.html` - Main task organizer page
- `about.html` - Information about the project
- `privacy.html` - Privacy policy
- `css/style.css` - Styling for all pages
- `js/script.js` - Application logic

## Customization

To change the color scheme, modify the CSS variables in `css/style.css`:

```css
:root {
    --bg-color: #F7F8FA;      /* Background color */
    --text-color: #1F2933;    /* Text color */
    --primary-color: #3B6EF5; /* Primary accent color */
    --success-color: #2FA36B; /* Success state color */
    --warning-color: #E0A100; /* Warning state color */
    --danger-color: #D64545;  /* Error state color */
}
```

## Browser Support

This application uses modern web technologies and should work in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and educational use.