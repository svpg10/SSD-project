# CVD Studio visual redesign

Direction: precision materials lab. The first screen introduces thin-film modeling through a rotating, layered silicon wafer. The workspace uses a graphite navigation rail, warm-white surfaces, copper actions, generous space and strong typography. Light and dark themes remain available. Space Grotesk gives headings and branding a more distinct geometric voice; Manrope keeps body text, controls and chart labels clear. IBM Plex Mono remains for formulas and scientific metadata. The new fonts are locally hosted WOFF2 assets, with their licenses retained under `public/fonts`.

The landing page lives at `/`; the existing application moves to `/workbench`. All calculation, validation, units, immutable snapshots, exports and material-data disclosures remain in the existing scientific implementation. No numerical model changes are part of this redesign.

The landing page proceeds from an interactive wafer and primary action, through the resistance equation, to the three exploration tools and an illustrated explanation of the reactor context. Images are conceptual illustrations, explicitly distinct from instrument photographs and measured data. The rotation is code-native CSS 3D, with pause and viewing-angle controls and a static reduced-motion default. No new rendering dependency is required.

Layout: 1280px marketing container; two-column desktop hero; one-column mobile hero; 232px desktop workspace rail; one-column workbench below 900px. Touch controls remain at least 44px. Data tables and Plotly visualizations remain accessible through their existing tables.

New semantic tokens override the original supplied token file, which remains preserved. Neutral ramp: warm paper through graphite; brand ramp: copper. Text contrast and automated accessibility will be checked in both themes. Motion animates transform only and honors reduced motion. Final verification includes production build, existing scientific workflows, landing interactions and screenshots at mobile/tablet/desktop widths.
