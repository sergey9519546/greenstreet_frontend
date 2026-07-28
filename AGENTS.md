# Greenstreet Working Rules

## Canonical workspace

- Work only inside `C:\Users\serge\Projects\greenstreet-finance`.
- Never read, write, list, search, execute from, or otherwise access a path containing `OneDrive`.
- If a tool or task starts from an old OneDrive path, stop and relocate the work before continuing.

## Permanent visual-review lanes

Every user-facing change must be reviewed through two independent lenses:

1. **Visual symmetry**
   - Grid and column alignment
   - Optical balance, not merely mathematical centering
   - Section rhythm and whitespace distribution
   - Consistent container edges and anchor lines
   - Responsive composition at desktop and mobile widths
   - Absence of horizontal overflow, clipping, accidental asymmetry, and uneven card geometry

2. **Design etiquette**
   - Typography hierarchy and line-length discipline
   - Spacing, radius, border, shadow, and color-token restraint
   - Premium institutional-finance credibility
   - Clear primary/secondary action hierarchy
   - Consistent iconography, imagery, motion, and interaction states
   - Accessibility polish, including focus, contrast, reduced motion, and touch targets

When subagents are available, assign one subagent to each lens before considering a visual change complete. The implementing agent remains responsible for reconciling their findings.

## Every-page coverage

- Build the route inventory from source routing, metadata, and the sitemap; do not audit only the homepage.
- Review every public route at representative desktop and mobile widths.
- Include navigation, footer, forms, modals, loading, empty, error, disabled, success, and validation states where present.
- Trace connected journeys across marketing pages, calculators, tools, review/lead flows, legal pages, articles, and case studies.
- Maintain a route checklist with `not reviewed`, `reviewed`, `needs correction`, or `passes`.
- Re-run the two visual-review lanes after shared component or design-token changes because they can affect every route.

## Completion gate

A page is not visually complete until:

- Both review lanes have assessed it.
- P0 and P1 findings are resolved.
- Desktop and mobile layouts have been inspected in a real browser.
- Console errors, broken links, unintended overflow, and obstructive overlays are absent.
- The page feels like part of the same Greenstreet product rather than an isolated template.
