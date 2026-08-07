import json
from pathlib import Path

base = Path(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend')
data_uris = json.loads((base / 'logo_data_uris.json').read_text())

logos_list = [
    ("testimonial-01-nexus-financial.png", "testimonial", "Maya Reynolds - Nexus Financial"),
    ("testimonial-02-cedar-funding.png", "testimonial", "Layla Kabbani - Cedar Funding"),
    ("testimonial-03-hadley-capital-partners.png", "testimonial", "David Chen - Hadley Capital Partners"),
    ("testimonial-04-marlowe-asset-group.png", "testimonial", "Carlos Martinez - Marlowe Asset Group"),
    ("testimonial-05-sterling-bridge-partners.png", "testimonial", "Emma Wallace - Sterling Bridge Partners"),
    ("case-01-sterling-bridge-partners.png", "case", "Sterling Bridge Partners"),
    ("case-02-marlowe-asset-group.png", "case", "Marlowe Asset Group"),
    ("case-03-hadley-capital-partners.png", "case", "Hadley Capital Partners"),
    ("trust-01-apex-capital-group.png", "trust", "Apex Capital Group"),
    ("trust-02-northshore-capital.png", "trust", "Northshore Capital"),
    ("trust-03-pacific-wealth-advisors.png", "trust", "Pacific Wealth Advisors"),
    ("trust-04-summit-bridge-partners.png", "trust", "Summit Bridge Partners"),
    ("trust-05-ironwood-asset-management.png", "trust", "Ironwood Asset Management"),
    ("trust-06-vertex-capital-partners.png", "trust", "Vertex Capital Partners"),
    ("trust-07-cypress-financial-group.png", "trust", "Cypress Financial Group"),
    ("trust-08-atlas-wealth-management.png", "trust", "Atlas Wealth Management"),
    ("trust-09-heritage-asset-management.png", "trust", "Heritage Asset Management"),
    ("trust-10-coastline-capital-markets.png", "trust", "Coastline Capital Markets"),
    ("trust-11-cornerstone-advisors.png", "trust", "Cornerstone Advisors"),
    ("trust-12-pinnacle-wealth-partners.png", "trust", "Pinnacle Wealth Partners"),
    ("trust-13-lone-star-capital-partners.png", "trust", "Lone Star Capital Partners"),
    ("trust-14-vanguard-asset-management.png", "trust", "Vanguard Asset Management"),
    ("trust-15-beacon-hill-wealth.png", "trust", "Beacon Hill Wealth"),
    ("trust-16-iron-range-financial.png", "trust", "Iron Range Financial"),
    ("trust-17-sandhills-wealth-partners.png", "trust", "Sandhills Wealth Partners"),
    ("trust-18-northern-lights-capital.png", "trust", "Northern Lights Capital"),
    ("trust-19-south-bay-wealth-advisors.png", "trust", "South Bay Wealth Advisors"),
    ("trust-20-riverside-brokerage.png", "trust", "Riverside Brokerage"),
    ("trust-21-sequoia-capital-partners.png", "trust", "Sequoia Capital Partners"),
    ("trust-22-frontier-wealth-management.png", "trust", "Frontier Wealth Management"),
    ("trust-23-beacon-wealth-partners.png", "trust", "Beacon Wealth Partners"),
    ("trust-24-liberty-capital-partners.png", "trust", "Liberty Capital Partners"),
    ("trust-25-sandstone-asset-management.png", "trust", "Sandstone Asset Management"),
    ("trust-26-mercator-wealth-partners.png", "trust", "Mercator Wealth Partners"),
    ("trust-27-capital-bridge-partners.png", "trust", "Capital Bridge Partners"),
]

manifest_lines = []
for fname, cat, label in logos_list:
    uri = data_uris[fname]
    manifest_lines.append(f'  {{ file: "{fname}", category: "{cat}", label: "{label}", src: "{uri}" }},')
manifest = "\n".join(manifest_lines)

html_template = (base / 'review-logos.html').read_text(encoding='utf-8')

import re
new_const = f"const LOGOS = [\n{manifest}\n];"
html_new = re.sub(
    r"const LOGOS = \[\s*// Testimonial.*?\n\];",
    new_const,
    html_template,
    count=1,
    flags=re.DOTALL
)

# Update image src references to use the embedded data URI
html_new = html_new.replace(
    'img.src = `public/img/logos/${logo.file}`;',
    'img.src = logo.src;'
).replace(
    "thumb.dataset.src = `public/img/logos/${logo.file}`;",
    "thumb.dataset.src = logo.src;"
).replace(
    "modalImg.src = `public/img/logos/${logo.file}`;",
    "modalImg.src = logo.src;"
)

out_path = base / 'review-logos-standalone.html'
out_path.write_text(html_new, encoding='utf-8')
print(f"Wrote {out_path}")
print(f"Size: {out_path.stat().st_size:,} bytes ({out_path.stat().st_size / 1024 / 1024:.1f} MB)")