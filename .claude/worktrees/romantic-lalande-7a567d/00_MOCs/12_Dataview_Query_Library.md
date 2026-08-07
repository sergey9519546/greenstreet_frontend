---
type: moc
title: Dataview Query Library
description: Pre-built Dataview queries for exploring the DSCR Sovereign OS vault
tags:
  - type/moc
  - topic/dataview
---

# Dataview Query Library

_Once you install the Dataview community plugin (already pre-staged in `.obsidian/plugins/dataview/`), you can paste these queries directly into any note as `dataview` code blocks._

## Quick Start

1. Install [Dataview](https://github.com/blacksmithgu/obsidian-dataview) from Obsidian Community Plugins
2. Open any note in this vault
3. Create a code block with `dataview` as the language
4. Paste any query below

---

## Query: All Shipped Deliverables

```dataview
TABLE
  title AS "Title",
  slice AS "Slice",
  sprint AS "Sprint",
  confidence AS "Conf"
FROM ""
WHERE type = "deliverable" OR contains(tags, "status/shipped")
SORT slice ASC, sprint ASC
```

## Query: All 20 Lenders

```dataview
TABLE
  title AS "Lender",
  slice AS "Slice"
FROM ""
WHERE contains(entities, "lender/pennymac")
   OR contains(entities, "lender/griffin-funding")
   OR contains(entities, "lender/kiavi")
   OR contains(entities, "lender/visio-lending")
   OR contains(entities, "lender/acra-lending")
   OR contains(entities, "lender/ocmbc")
   OR contains(entities, "lender/crosscountry")
   OR contains(entities, "lender/ad-mortgage")
   OR contains(entities, "lender/newfi")
   OR contains(entities, "lender/angel-oak")
   OR contains(entities, "lender/uwm")
   OR contains(entities, "lender/defy")
   OR contains(entities, "lender/easy-street")
   OR contains(entities, "lender/lima-one")
   OR contains(entities, "lender/new-silver")
   OR contains(entities, "lender/american-heritage")
   OR contains(entities, "lender/rocket-pro")
   OR contains(entities, "lender/insula")
   OR contains(entities, "lender/deephaven")
   OR contains(entities, "lender/ready-capital")
SORT title ASC
```

## Query: All ECOA Compliance Docs

```dataview
TABLE
  title AS "Topic",
  status AS "Status",
  slice AS "Slice"
FROM ""
WHERE contains(entities, "regulation/ecoa")
   OR contains(tags, "topic/adverse-action")
   OR contains(tags, "topic/kill-criteria")
SORT status DESC, slice ASC
```

## Query: All Math/Algorithm Files

```dataview
TABLE
  title AS "Algorithm",
  status AS "Status",
  slice AS "Slice",
  confidence AS "Conf"
FROM ""
WHERE contains(tags, "topic/monte-carlo")
   OR contains(tags, "topic/yield-curve")
   OR contains(tags, "topic/lgd")
   OR contains(tags, "topic/cecl")
   OR contains(tags, "topic/short-rate")
   OR contains(entities, "math/t-copula")
   OR contains(entities, "math/copula")
   OR contains(entities, "math/sobol")
   OR contains(entities, "math/merton-dd")
   OR contains(entities, "math/vine-copula")
   OR contains(entities, "ml/timesfm")
   OR contains(entities, "ml/tabpfn")
   OR contains(entities, "ml/conformal")
   OR contains(entities, "ml/mapie")
   OR contains(entities, "ml/xgboost")
   OR contains(entities, "ml/shap")
SORT confidence DESC, slice ASC
```

## Query: All 50-State Matrices

```dataview
TABLE
  title AS "Topic",
  status AS "Status"
FROM ""
WHERE contains(entities, "state/ca")
   OR contains(entities, "state/tx")
   OR contains(entities, "state/fl")
   OR contains(entities, "state/ny")
   OR contains(entities, "state/nj")
SORT title ASC
```

## Query: After-Tax Engine Sources

```dataview
TABLE
  title AS "Topic",
  status AS "Status",
  slice AS "Slice"
FROM ""
WHERE contains(tags, "topic/after-tax")
   OR contains(tags, "topic/tax")
   OR contains(entities, "tax/obba")
   OR contains(entities, "tax/1031")
   OR contains(entities, "tax/qoz")
   OR contains(entities, "tax/niit")
   OR contains(entities, "tax/pal")
   OR contains(entities, "tax/bonus-depreciation")
   OR contains(entities, "tax/section-179")
SORT status DESC, slice ASC
```

## Query: All Insurance/FEMA/Flood Docs

```dataview
TABLE
  title AS "Topic",
  status AS "Status"
FROM ""
WHERE contains(tags, "topic/insurance")
   OR contains(tags, "topic/flood-insurance")
   OR contains(tags, "topic/fair-plan")
   OR contains(tags, "topic/title-insurance")
SORT status DESC
```

## Query: All Market Data Sources

```dataview
TABLE
  title AS "Source",
  status AS "Status"
FROM ""
WHERE contains(entities, "data/fred")
   OR contains(entities, "data/zillow")
   OR contains(entities, "data/zori")
   OR contains(entities, "data/cotality")
   OR contains(entities, "data/trepp")
   OR contains(entities, "data/kbra")
   OR contains(entities, "data/apartment-list")
   OR contains(entities, "data/fannie-mae")
   OR contains(entities, "data/freddie-mac")
SORT title ASC
```

## Query: All Portfolio/Blanket Loan Docs

```dataview
TABLE
  title AS "Topic",
  status AS "Status",
  slice AS "Slice"
FROM ""
WHERE contains(tags, "topic/portfolio")
   OR contains(entities, "lender/insula")
   OR contains(entities, "lender/lima-one")
SORT status DESC
```

## Query: All Audit Reports

```dataview
TABLE
  title AS "Audit",
  slice AS "Slice",
  confidence AS "Conf"
FROM ""
WHERE contains(tags, "type/audit")
   OR contains(tags, "topic/gap-audit")
SORT confidence DESC
```

## Query: Files by Status & Confidence

```dataview
TABLE
  status AS "Status",
  count(rows) AS "Files"
FROM ""
GROUP BY status
```

## Query: Files by Slice

```dataview
TABLE
  slice AS "Slice",
  count(rows) AS "Files"
FROM ""
WHERE slice
GROUP BY slice
SORT slice ASC
```

## Query: Files by Sprint

```dataview
TABLE
  sprint AS "Sprint",
  count(rows) AS "Files"
FROM ""
WHERE sprint
GROUP BY sprint
SORT sprint ASC
```

## Query: Top 20 Most-Linked Topics

```dataview
TABLE
  count(rows) AS "Files"
FROM ""
FLATTEN tags AS tag
WHERE tag
GROUP BY tag
SORT count(rows) DESC
LIMIT 20
```

## Query: Files Mentioning DSCR = Rent/PITIA

```dataview
TABLE
  title AS "Topic",
  status AS "Status",
  confidence AS "Conf"
FROM ""
WHERE contains(entities, "concept/dscr")
   AND contains(entities, "concept/pitia")
SORT confidence DESC
LIMIT 20
```

## Query: Files Mentioning California

```dataview
TABLE
  title AS "Topic",
  status AS "Status"
FROM ""
WHERE contains(entities, "state/ca")
SORT status DESC
LIMIT 30
```

---

## Dataview JS (advanced) — Slice-Level Summary

For more advanced queries, enable DataviewJS in the plugin settings:

```dataviewjs
// Group all files by slice and count
const pages = dv.pages()
  .where(p => p.slice)
  .sort(p => p.slice);

const grouped = pages.groupBy(p => p.slice);

dv.header(2, "Slice Summary");
for (const group of grouped) {
  dv.header(3, `Slice ${group.key} (${group.rows.length} files)`);
  dv.table(
    ["File", "Status", "Confidence"],
    group.rows
      .limit(10)
      .map(p => [p.file.link, p.status || "—", p.confidence || "—"])
  );
}
```

---

## Tips

- **Press Ctrl/Cmd+P** → "Dataview: Reload" to refresh after editing frontmatter
- **Use `LIMIT`** to avoid overwhelming long result tables
- **Combine `WHERE` clauses** with `AND` / `OR` for complex filters
- **Group by any field**: `GROUP BY entity` shows top-50 entity tags
- **Sort by confidence DESC** to find Tier-1 verified material first
