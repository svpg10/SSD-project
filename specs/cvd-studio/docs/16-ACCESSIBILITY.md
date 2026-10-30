# Accessibility specification

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/). This is a requirement, not a certification of an unbuilt interface.

## Required implementation

Semantic landmarks and logical headings; skip link; meaningful page titles; labels and unit descriptions programmatically associated with every input; field errors plus linked summary; clear focus order and visible focus. Use text/icon/status labels in addition to color. Avoid drag-only controls. Controls target 44×44px where possible and meet WCAG 2.2 minimum target requirements and exceptions. Sticky panels must not obscure focus at zoom or small viewport sizes.

Chart information must be available through readable HTML summary and table, with keyboard-operated view/export controls. An equation has text explaining variables/units; render accessible math (e.g. vetted MathML support) and a plain-text equivalent. Heatmaps have a labeled colorbar, textual field/statistics summary and radial data table. Do not rely on canvas accessibility or Plotly modebar alone.

Body text contrast ≥4.5:1, large text ≥3:1, meaningful control boundaries and graphical indicators ≥3:1. Long explanatory text aims ≥7:1. Both light/dark theme pairs are computed in `design/contrast-report.json`; actual hover/focus/disabled composition still needs browser review. Links are underlined in prose. Status text uses background-specific contrast tokens. Reduced motion disables nonessential transitions. No flashing or automatic chart movement.

## Manual review script

1. Keyboard only: load, skip navigation, select template, enter all fields, open assumptions, run, inspect table, export, open/close dialog, return focus.
2. NVDA+Firefox or NVDA+Chrome on Windows; VoiceOver+Safari where available. Verify equation, units, errors, status announcements and table headers; record actual pair tested.
3. Test 375/768/1440px, 200% and 400% zoom, portrait/landscape and reflow without clipped controls. Horizontal scroll only within labeled numerical tables.
4. Test light/dark, high-contrast/forced-colors and reduced-motion settings. Focus survives validation errors and async result arrival. Announce completion with polite live region without re-reading an entire plot.
5. Check accessible names, target sizes, tooltips and dialog focus. Long numerical values wrap/copy correctly.

Run automated axe-based browser checks and contrast checks as supplements. Resolve violations and document any remaining manual issue before launch; automated zero violations alone is insufficient to claim WCAG conformance.
