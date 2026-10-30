# UI/UX specification

## Design direction

**Calm scientific instrument:** precise, legible and transparent. Use a neutral slate work surface, restrained teal actions, tabular numerals and readable plots. The result and its evidence are the focal point. Avoid decorative gradients, meaningless animated molecules and invented laboratory claims.

## Navigation and routes

| Route | Purpose | Main action |
|---|---|---|
| `/` | Workbench with draft input and last result | Run simulation |
| `/compare` | Compare up to four immutable local snapshots | Add snapshot |
| `/parameters` | Material templates, source status and editable user inputs | Inspect parameter |
| `/learn` | Equation derivation, units and regime explanation | Open demonstration |
| `/about/model` | Model versions, assumptions and scientific status | Read model details |

Top bar: product name, active project name, model version, theme and documentation. Left desktop navigation uses labels plus simple icons. Avoid hiding critical scientific caveats in a footer. No marketing landing page is required for the baseline workbench.

## Workbench placement

At ≥1200px, reserve 208px for navigation; use a 320px input column and flexible results region, minimum result width 480px. Outer content max-width 1440px, gutters 24px. At 768–1199px navigation collapses and input panel becomes a 288px column or drawer if results would be cramped. Below 768px use a single column: project/status → inputs → Run → result summary → plots → tables → evidence. No page-wide horizontal scrolling; individual data tables may scroll in a labeled region.

Input sections: (1) material and provenance, (2) substrate temperature and kinetics, (3) concentration/pressure/gas temperature, (4) transport and flow metadata, (5) conversion/duration, (6) optional sweep, (7) optional spatial fields. Labels sit above controls; number and unit are adjacent. Show source status next to each material coefficient. Blank fields remain blank. “Use synthetic demo” is a secondary action with an explicit disclosure.

One primary **Run simulation** button below the form; on mobile a sticky action may be used only with bottom padding and verified unobscured keyboard focus. Advanced sections are disclosures, not separate obscure settings pages. Run is enabled for a semantically complete draft; server validation remains authoritative.

## Results hierarchy

1. Snapshot title, provenance badge and timestamp; stale banner when inputs differ.
2. Flux with unit and optional growth/thickness. A missing growth conversion shows “Unavailable — add beta”, never zero.
3. Regime, Da and two labeled resistance fractions.
4. Temperature plot with axis units; plot/table toggle; shared plot legend states which fields remain fixed.
5. Spatial map/radial profile and separately named CV and half-range statistics. Always display extension disclosure, radius, edge exclusion and grid resolution.
6. Assumptions, parameter/source inspector, constraint statuses and export controls.

## Charts and comparisons

Use Plotly.js in Next.js client boundaries, loaded lazily. The Python API returns numerical arrays, not Plotly figures. Keep rendering in the browser. Stable series colors plus dash styles and text labels; use a perceptually ordered sequential map for positive flux. Show colorbar units. A fixed shared scale is the default for comparisons; disclose any per-panel scaling. Tooltips include original variable name and SI/display units. No smoothed line implying extra data.

Every chart has a title, short plain-language description, summary and HTML data table. Preserve precision in downloads, round display only. Keyboard users can move between data views without using Plotly's modebar. A map is accompanied by the radial table; the axisymmetric assumption is explicit. Do not fake 3D geometry or infer angular variation.

## States and copy

| State | Required behavior / example |
|---|---|
| Empty | “Choose a material template or open a synthetic demonstration.” |
| Incomplete | “A and Ea are not supplied for this material. Enter documented values or use direct ks.” |
| Loading | Keep draft visible, announce “Calculating”, prevent duplicate requests |
| Success | Show snapshot, assumptions and version |
| Stale | “Inputs changed. These results use the previous snapshot.” |
| Unknown constraint | “Pressure limits are not supplied in PS-64.” |
| Invalid unit | “Expected a velocity unit for hg, such as m/s.” |
| Invalid field | Error under field and linked summary; preserve entered value |
| Network/timeout | Preserve last result; offer retry and reduced workload |
| Synthetic | “Synthetic numerical demonstration; not material or process data.” |

## Tokens and typography

Ready-to-use light/dark CSS tokens are in `design/tokens.css`. Contrast pairs and computed ratios are in `design/contrast-report.json`. Color usage: background/surface dominant; accent for Run, focus and links; separate danger/warning/success roles with text/icon redundancy. Borders used to identify controls must meet 3:1 against adjacent surfaces.

Use self-hosted IBM Plex Sans (400/500/600) for interface and explanations, IBM Plex Mono (400/500) for code only; tabular numerals for data use Sans. Include license files when fonts are installed; use `font-display: swap` and a metric-aware fallback. Body 16px/1.5, long reading 17px/1.65, max 65ch. Scale: 12px metadata (not body), 14px table secondary text, 16px body/input, 20px section, 24px page, 32px display, 40px maximum display. Fluid page heading `clamp(1.5rem, 1.2rem + 1vw, 2rem)`.

Spacing: 4,8,12,16,24,32,48,64,96,128px; group spacing ≥24, field internals 8. Radius 6px inputs, 8px panels, no decorative pills except compact status badges. Two shadows maximum; dark elevation uses surfaces. Buttons min-height 44px; icon buttons have accessible labels. Standard transition 180ms ease-out, disabled for reduced motion. Tables: left text, right numbers, sticky header, unit-bearing headings.

## Components and interaction

Use shadcn primitives for dialog, tabs, select, tooltip, accordion and form controls, but test their composed behavior. Define default/hover/active/focus-visible/disabled/loading/error states for buttons and inputs; status badges never act as unlabeled controls. Focus ring uses an offset surface gap plus accent outline. Dialogs trap focus, have names/descriptions, close on Escape and restore focus. Tooltips supplement visible labels. Destructive draft replacement requires confirmation or undo. Export needs no confirmation. Auto-save (if enabled) shows location and clear action; browser storage is not server backup.
