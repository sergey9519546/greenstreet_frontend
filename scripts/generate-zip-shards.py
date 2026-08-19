"""Shard zip_fundamentals.json into per-prefix files the SPA can fetch on demand.

A single 3.5 MB (430 KB gzipped) blob would have to be downloaded in full to
answer one ZIP lookup. Sharding on the first three digits means a lookup pulls a
few KB. ~900 tiny files, each cacheable forever.

Every field that ships is rendered somewhere in the UI (see ZipSeedPanel.tsx).
The original derivation carried only 7 of the 20 source fields; this generator
ships the full public-domain set and repairs two source-level coverage gaps that
were costless to close:

  - INSURANCE: the recovered FIO table has a `NATIONAL` source_state series
    covering 25,593 ZIPs (public domain, 2022). The original derivation kept
    only the CA/FL state-specific rows (1,452 ZIPs) — a 17.6x under-coverage.
    Values cross-check identically on the overlap (only rounding differs).
  - STATE: realtor.com's `zip_name` field embeds the state ("allenspark, co"),
    a source-level attribution for 28,803 ZIPs. The original derivation only
    had state where ZORI rent existed (8,433 ZIPs). Joining rdc lifts state
    coverage to ~96% with no inference.
"""
import json, os, re, collections, sqlite3

SRC = r"C:\Users\serge\DSCR_DB_RECOVERED\derived\zip_fundamentals.json"
DB = r"C:\Users\serge\DSCR_DB_RECOVERED\dscr_engine.db"
OUT = r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\public\data\zip"

os.makedirs(OUT, exist_ok=True)
data = json.load(open(SRC))["data"]

# ---------------------------------------------------------------- DB joins
con = sqlite3.connect(DB)

# 1. NATIONAL FIO insurance premiums (2022), the whole US.
#    The derived values are the same numbers rounded, so taking NATIONAL
#    everywhere is strictly an extension, not a change, to CA/FL.
nat_ins = {}
for z, prem in con.execute(
    'SELECT "ZIP Code", "Premiums Per Policy" FROM treasury_fio '
    "WHERE Year=2022 AND source_state='NATIONAL'"
).fetchall():
    nat_ins[str(z).zfill(5)] = round(prem)

# 2. Source-level state from realtor.com zip_name ("city, st").
rdc_state = {}
for z, name in con.execute(
    "SELECT postal_code, zip_name FROM rdc_inventory WHERE month_date_yyyymm=202605"
).fetchall():
    m = re.match(r"^.*, ([a-z]{2})$", name or "")
    if m:
        rdc_state[str(z).zfill(5)] = m.group(1).upper()

con.close()

# ---------------------------------------------------------------- wire fields
# Compact keys — this ships to every visitor who uses the lookup.
#   r  monthly rent (Zillow ZORI)          i  annual insurance premium (Treasury FIO)
#   p  median list price (realtor.com)     d  median days on market
#   y  gross yield %                       s  state        c  city
#   f  NFIP flood claims since 1984        fp average $ paid per flood claim
#   s2 HUD SAFMR 2BR (rent sanity-check)   a  active listings (market depth)
FIELDS = [("rent", "r"), ("ins_premium", "i"), ("list_price", "p"),
          ("dom", "d"), ("gross_yield", "y"), ("state", "s"), ("city", "c"),
          ("flood_claims", "f"), ("flood_paid_avg", "fp"), ("safmr_2br", "s2"),
          ("active", "a")]

shards = collections.defaultdict(dict)
kept = 0
for zip_code, v in data.items():
    row = {short: v[long] for long, short in FIELDS if v.get(long) is not None}
    # Source-level repairs: insurance for every NATIONAL ZIP, state from realtor.com.
    if "i" not in row and zip_code in nat_ins:
        row["i"] = nat_ins[zip_code]
    if "s" not in row and zip_code in rdc_state:
        row["s"] = rdc_state[zip_code]
    # A row must seed or flag something to be worth showing. Flood claims are a
    # risk flag even without rent/price, so the old "rent or price" test is gone.
    if not row:
        continue
    shards[zip_code[:3]][zip_code] = row
    kept += 1

total = 0
for prefix, rows in shards.items():
    path = os.path.join(OUT, f"{prefix}.json")
    with open(path, "w") as fh:
        json.dump(rows, fh, separators=(",", ":"))
    total += os.path.getsize(path)

sizes = sorted(os.path.getsize(os.path.join(OUT, f"{p}.json")) for p in shards)
# Coverage report after regeneration.
def cov(field):
    return sum(1 for rows in shards.values() for r in rows.values() if field in r)
n = sum(len(rows) for rows in shards.values())
print(f"ZIPs kept      : {kept:,} of {len(data):,}")
print(f"shards         : {len(shards)}")
print(f"total on disk  : {total/1048576:.2f} MB")
print(f"shard size     : median {sizes[len(sizes)//2]/1024:.1f} KB, "
      f"max {sizes[-1]/1024:.1f} KB")
print(f"coverage       : state {cov('s'):,} ({100*cov('s')/n:.1f}%) | "
      f"rent {cov('r'):,} ({100*cov('r')/n:.1f}%) | "
      f"insurance {cov('i'):,} ({100*cov('i')/n:.1f}%) | "
      f"flood {cov('f'):,} ({100*cov('f')/n:.1f}%) | "
      f"safmr {cov('s2'):,} | active {cov('a'):,}")
