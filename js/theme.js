// Theme handling (dark/light) – runs before paint
(function () {
    // Determine initial theme
    let theme = 'light';
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            theme = stored;
        }
    } catch (_) {
        // ignore localStorage errors (e.g., private browsing)
    }
    if (theme !== 'dark' && theme !== 'light') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Apply immediately to document element
    document.documentElement.dataset.theme = theme;
})();

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const updateButton = (current) => {
        const isDark = current === 'dark';
        btn.setAttribute('aria-pressed', isDark);
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        // Sun icon for dark mode (switch to light), moon for light mode (switch to dark)
        if (isDark) {
            btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
        } else {
            btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
    };

    // Initialize button state
    const current = document.documentElement.dataset.theme || 'light';
    updateButton(current);

    btn.addEventListener('click', () => {
        const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = newTheme;
        try {
            localStorage.setItem('theme', newTheme);
        } catch (_) {
            // ignore
        }
        updateButton(newTheme);
    });
});