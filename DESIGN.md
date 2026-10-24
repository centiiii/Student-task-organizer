
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