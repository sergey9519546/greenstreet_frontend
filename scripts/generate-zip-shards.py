"""Shard zip_fundamentals.json into per-prefix files the SPA can fetch on demand.

A single 3.5 MB (430 KB gzipped) blob would have to be downloaded in full to
answer one ZIP lookup. Sharding on the first three digits means a lookup pulls a
few KB. ~900 tiny files, each cacheable forever.

Only the fields the UI actually renders are carried. Everything else stays out
of the repo.
"""
import json, os, collections

SRC = r"C:\Users\serge\DSCR_DB_RECOVERED\derived\zip_fundamentals.json"
OUT = r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\public\data\zip"

os.makedirs(OUT, exist_ok=True)
data = json.load(open(SRC))["data"]

# Compact keys — this ships to every visitor who uses the lookup.
#   r  monthly rent (Zillow ZORI)          i  annual insurance premium (Treasury FIO)
#   p  median list price (realtor.com)     d  median days on market
#   y  gross yield %                       s  state        c  city
FIELDS = [("rent", "r"), ("ins_premium", "i"), ("list_price", "p"),
          ("dom", "d"), ("gross_yield", "y"), ("state", "s"), ("city", "c")]

shards = collections.defaultdict(dict)
kept = 0
for zip_code, v in data.items():
    row = {short: v[long] for long, short in FIELDS if v.get(long) is not None}
    # A row with no rent and no price cannot seed anything worth showing.
    if "r" not in row and "p" not in row:
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
print(f"ZIPs kept      : {kept:,} of {len(data):,}")
print(f"shards         : {len(shards)}")
print(f"total on disk  : {total/1048576:.2f} MB")
print(f"shard size     : median {sizes[len(sizes)//2]/1024:.1f} KB, "
      f"max {sizes[-1]/1024:.1f} KB")
print(f"-> a lookup transfers the median shard, not {os.path.getsize(SRC)/1048576:.1f} MB")
