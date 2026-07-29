# Triage labels

The engineering workflow uses these five canonical roles. They are the intended
GitHub label vocabulary for this repository; create or map them deliberately
before an automation applies labels.

| Canonical role | GitHub label | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate the issue. |
| `needs-info` | `needs-info` | Waiting on the reporter for information. |
| `ready-for-agent` | `ready-for-agent` | Fully specified and safe for an agent to pick up. |
| `ready-for-human` | `ready-for-human` | Requires accountable human implementation or approval. |
| `wontfix` | `wontfix` | Will not be actioned. |

For regulated, privacy, pricing, underwriting, legal, tax, or release-sensitive
work, use `ready-for-human` until the required accountable approval is recorded.
