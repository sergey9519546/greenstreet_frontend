# FinCEN Reverification - 2026-06-28

Scope: outdated-research cleanup `REVERIFY` rows for FinCEN BOI and Residential Real Estate Reporting Rule claims.

## Result

FinCEN BOI correction remains current for domestic U.S. companies. FinCEN's BOI page states that all entities created in the United States, including entities previously known as domestic reporting companies, and their beneficial owners are exempt from BOI reporting to FinCEN under the March 2025 interim final rule.

FinCEN RRE status requires correction overlay. FinCEN's Residential Real Estate Rule page and RRE FAQ state that on March 19, 2026, the U.S. District Court for the Eastern District of Texas vacated the Residential Real Estate Rule. FinCEN and DOJ have appealed, but while the court order remains in force, reporting persons are not required to file Real Estate Reports and are not subject to liability for not filing.

## Current Corpus Rule

- Do not treat the RRE Rule as an active production reporting obligation unless live primary-source status changes.
- Do not delete older RRE research. Mark it as stale or superseded by this live-source correction.
- Domestic U.S. LLC BOI-trigger claims remain wrong under current FinCEN BOI guidance.
- Foreign reporting company BOI obligations remain outside this DSCR domestic-LLC cleanup decision and require separate handling.

## Sources Checked

- FinCEN Residential Real Estate Rule: `https://www.fincen.gov/rre`
- FinCEN Residential Real Estate FAQs: `https://www.fincen.gov/rre-faqs`
- FinCEN BOI: `https://www.fincen.gov/boi`
- FinCEN BOI interim final rule press release: `https://www.fincen.gov/news/news-releases/fincen-removes-beneficial-ownership-reporting-requirements-us-companies-and-us`

## Cleanup Impact

Rows in `outdated_research_first_batch_2026-06-28.csv` with `matched_topic` equal to `FinCEN RRE` should be treated as `REVERIFY_COMPLETE_CORRECTION_OVERLAY`, not deletion candidates.

Rows with old BOI-trigger claims should be reviewed for correction banners or superseded archival. They should not be deleted if they contain provenance explaining how the correction was reached.
