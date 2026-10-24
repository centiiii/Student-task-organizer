# Student Task Organizer

A simple, private task organizer for college students. Add your schoolwork, see what is due next, and keep everything in one place. No account, no server, and no tracking: your tasks stay in your own browser.

**Live site:** https://centiiii.github.io/Student-task-organizer/

Built with plain HTML, CSS, and JavaScript (no frameworks) as a class project by Vincent John S. Belmonte, 2CpE-A.

## Features

**Tasks**
- Add tasks with a title, subject, due date, priority (low, medium, high), and optional notes (up to 200 characters)
- Edit, delete, and mark tasks as done
- Undo the most recent delete for a few seconds
- "Clear completed" removes finished tasks after a confirmation
- Subject suggestions while typing, so "Math" and "math" stay one subject

**Finding things**
- Search by title, subject, or notes
- Filter by status: All tasks, Pending, or Completed
- Sort by due date, priority, subject (A to Z), or newest first
- Unfinished tasks always come before completed ones

**Deadlines**
- OVERDUE and DUE TODAY labels with a colored edge
- Friendly labels such as "Due tomorrow", "Due in 3 days", or "2 days ago"
- Subject colors, so each subject is easy to spot

**Dashboard**
- A greeting and today's date, with a subtitle based on your tasks
- Stat cards: total, done, due today, overdue
- A progress bar showing how many tasks are completed
- "Next up": your three closest unfinished deadlines
- "By subject": how many tasks (and how many done) each subject has

**Your data**
- Export a backup file (JSON) and import it later or on another device
- Export unfinished deadlines as a calendar file (.ics) for Google Calendar, Apple Calendar, or Outlook

**Look and feel**
- Responsive layout for phones, tablets, and desktops
- Light and dark mode, following your system setting until you choose one with the toggle
- Installable as an app and usable offline

## How to run it

No build step or installation is needed.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For the best experience while developing, use the Live Server extension in Visual Studio Code (right-click `index.html`, then **Open with Live Server**). Offline and install features need `http://localhost`, a local server, or `https://`, so they won't work when opening the file directly from your disk.

## Your data and privacy

- Tasks are saved only in your browser's localStorage (key `tasks`), and your light or dark choice under `theme`.
- Nothing is sent to a server, and there are no accounts, cookies, analytics, or advertising.
- The offline feature saves a copy of the site's own pages and styles on your device. It does not contain your tasks.
- Backup and calendar files are created in your browser and saved to your device. They are not encrypted, so keep them somewhere you trust. If you import a calendar file into an online calendar, that service's own privacy policy applies.
- Clearing your browser data or switching browsers or devices removes access to your tasks. Use **Export backup** regularly.

See the Privacy page on the site for the full policy.

## Project structure

```
index.html              Home page: dashboard, task list, and the Add task dialog
about.html              About page
privacy.html            Privacy policy
css/style.css           All styles, including light and dark themes
js/script.js            Task logic, dashboard, backup, and calendar export (home page only)
js/theme.js             Light and dark mode toggle
js/pwa.js               Registers the service worker
sw.js                   Service worker for offline use
manifest.webmanifest    App name, colors, and icons for installing
icons/                  App icons
DESIGN.md               Design guide (colors, spacing, rules)
PLAN.md                 Feature plan
```

## Design

The visual style is described in `DESIGN.md`: an indigo and soft gray-blue palette, white cards with subtle borders, 8px-based spacing, and colors defined as CSS variables so both themes share the same components.

## How it was built

The project was planned in phases (plan and design files, page skeleton, core features, styling, extras) and built step by step in Visual Studio Code using the Cline extension with AI models, then tested and reviewed by hand. Each step was committed with Git, and the redesign was developed on its own branch before being merged.

## Known limitations

- Data lives in one browser on one device. Use the backup export and import to move it.
- There are no reminders or notifications, and no accounts or syncing between devices.
- The installed app on some phones (notably iPhone) may keep its storage separate from the regular browser, so use backup export and import to move tasks between them.

## Updating the offline cache

When you add or rename a file listed in `sw.js`, change `CACHE_VERSION` at the top of that file so installed copies refresh.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari. Some styling uses modern CSS (such as `color-mix` and `:has`), so very old browsers may look different.
