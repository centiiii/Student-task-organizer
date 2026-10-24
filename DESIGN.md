
# Design guide (redesign branch)

Site: Student task organizer (dashboard layout, to be added)
Mood: clean, calm, focused
Font: Inter (self-hosted from /fonts), fallback system-ui, sans-serif
Spacing: 8px scale only (8, 16, 24, 32, 48)
Radius: 12px for cards, 8px for buttons and inputs, 999px for badges
Cards: white background, 1px solid border, very soft shadow
Interactions: subtle hover states, 150-200ms transitions, a short completion animation, clear feedback after actions; respect prefers-reduced-motion

Color tokens (keep the existing variable names, add the new ones):
--bg-color: #F5F7FB
--surface-color: #FFFFFF
--border-color: #E3E8F2
--text-color: #1F2937
--text-muted: #6B7280
--primary-color: #4F46E5
--primary-hover: #4338CA
--primary-soft: #EEF0FF
--success-color: #16A34A
--warning-color: #F59E0B
--danger-color: #DC2626

Rules:
- Plain HTML, CSS, and JavaScript only; no frameworks
- All colors come from the variables above, no hard-coded hex values (subject badge colors are set in JS with hsl and stay as they are)
- Text on warning/amber uses dark text (--text-color), not white
- Keep all element ids and class names used by js/script.js

## Dark mode
Theme is set with data-theme="dark" on <html>; default comes from the visitor's system setting, and a saved choice (localStorage key "theme") overrides it.
Dark tokens:
--bg-color: #0B1020
--surface-color: #151B2E
--border-color: #28324A
--text-color: #E5E7EB
--text-muted: #9CA3AF
--primary-color: #6366F1
--primary-hover: #4F46E5
--primary-soft: rgba(129, 140, 248, 0.16)
--primary-text: #A5B4FC (light mode: #4F46E5), used for text that is colored with the primary color
--success-color: #22C55E, --warning-color: #FBBF24, --danger-color: #DC2626 (solid labels keep white or dark text with enough contrast)
Rules: no hard-coded colors in components except the toast; use var() tokens; set color-scheme: dark in dark mode so native inputs, date pickers, and scrollbars match.