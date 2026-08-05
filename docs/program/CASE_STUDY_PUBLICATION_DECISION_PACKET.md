# Case-study publication decision packet

Status: **owner decision required**. Prepared from the isolated source tree on 2026-07-28; this packet neither approves publication nor changes application behavior.

## Decision requested

An accountable content, SEO, and legal owner must choose one posture for the four rendered child paths:

| Option | Publication posture | Required follow-through |
| --- | --- | --- |
| A | Public, indexable illustrative editorial | Publish an approved registry, canonical metadata, permitted structured data, and evidence/labeling rules. |
| B | Public, but noindex | Remove child paths from discovery surfaces and retain explicit noindex metadata with approved illustrative disclosures. |
| C | Not public pending evidence | Remove public discovery and rendering until the owner approves a publishable registry. |

The decision must also state whether the legacy `/case-studies/northshore-nonqm` spelling is intentionally supported, normalized to `/case-studies/northshore-non-qm`, or fails closed.

## Source facts requiring reconciliation

The following child URLs appear in `public/sitemap.xml` and are accepted by the route resolver:

- `/case-studies/aurora`
- `/case-studies/northshore-non-qm`
- `/case-studies/quintero-co`
- `/case-studies/vela-capital`

For those paths, the runtime metadata layer currently supplies `noindex,nofollow`, no canonical URL, no JSON-LD, and a not-found title. `CaseStudiesPage` has valid-slug detail content, while an unmatched child path falls back to the collection rather than rendering the not-found page. The collection route itself is indexable and uses `CollectionPage` structured data for **Illustrative Scenarios**.

The legacy home markup also links to Vela and Quintero plus the divergent `northshore-nonqm` spelling, calls the surface customer stories, and includes constructed-scenario disclosures. Aurora has no equivalent homepage link. These facts are implementation observations only; they do not establish that any person, transaction, result, endorsement, or customer relationship is publishable.

## Minimum owner record

Before code changes or release certification, record one signed/approved source of truth that maps each slug to:

1. publication status and indexability;
2. approved title, description, canonical URL, and allowed schema;
3. permitted labels such as “Customer Stories,” “Case Studies,” or “investor case studies”;
4. required illustrative/constructed disclosure and placement;
5. provenance, effective date, accountable owner, and review cadence; and
6. the disposition of the legacy Northshore spelling.

If the material represents actual people, transactions, results, or endorsements, add the applicable consent, permissions, privacy, substantiation, and counsel approvals. Do not infer those approvals from code or the sitemap.

## Browser interaction finding

The homepage's three legacy case CTA wrappers each contain a normal `.g_clickable_link` plus a duplicate `.cs-abs-link` wrapper and child anchor with the same href. The semantic adapter hides only the child overlay anchor from assistive technology and tab order. The legacy stylesheet positions both overlay layers above the visible CTA, so a normal Vela pointer click is intercepted and does not navigate.

This is a real interaction defect, not a test workaround issue. It cannot be safely repaired for only Vela: that would make one unapproved/noindex child path behave differently from two visually identical cards, while the Northshore card still has a divergent route spelling. No pointer-behavior change has been made.

After the owner selects a publication posture and route matrix, the smallest behavior-preserving repair is a scoped late-loading CSS rule that makes both duplicate overlay layers pointer-inert inside the three case CTA wrappers. The existing full-size `.g_clickable_link` then remains the single normal pointer and keyboard target; raw markup, hrefs, layout, animation, and z-index rules remain otherwise intact. Do not remove the overlays or use force-click evidence.

## Safe implementation path after approval

1. Add a default-deny publication registry with only owner-approved slugs and fields.
2. Make rendering, fallback behavior, sitemap inclusion, robots, canonical metadata, schema, homepage anchors, and the case-card pointer repair consume the same disposition.
3. Add a contract test for every approved child URL, each rejected/legacy spelling, and both case-overlay layers being pointer-inert.
4. Verify the rendered outcome on the named non-production preview: status, title, robots, canonical, structured data, visible disclosure, ordinary CTA pointer click, keyboard `Enter`, direct navigation, back/forward/reload, and absence of unapproved form or analytics activity.
5. Retain the approval record and preview evidence with the release decision.

No option should be implemented from this packet alone. The current behavior remains unchanged until the accountable owners select and evidence a posture.
