import re
with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\lenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find each id and extract chunk
ids_pos = []
for m in re.finditer(r"id:\s*'([a-z_]+)'", content):
    ids_pos.append((m.start(), m.group(1)))

print(f'Found {len(ids_pos)} lender IDs')
print()

# For each, extract the chunk from id to next id (or 2500 chars)
for i, (pos, lid) in enumerate(ids_pos):
    next_pos = ids_pos[i+1][0] if i+1 < len(ids_pos) else pos + 2500
    chunk = content[pos:next_pos]
    name_m = re.search(r"name:\s*'([^']+)'", chunk)
    fico_m = re.search(r"minFico:\s*(\d+)", chunk)
    ltv_m = re.search(r"maxLtv:\s*(\d+)", chunk)
    dscr_m = re.search(r"minDscr:\s*([\d.]+)", chunk)
    max_m = re.search(r"maxLoanAmount:\s*(\d+)", chunk)
    min_m = re.search(r"minLoanAmount:\s*(\d+)", chunk)
    conf_m = re.search(r"confidence:\s*(\d+)", chunk)
    str_m = re.search(r"strAllowed:\s*(true|false)", chunk)
    io_m = re.search(r"ioAllowed:\s*(true|false)", chunk)
    prepay_m = re.search(r"prepayType:\s*'([^']+)'", chunk)
    notes_m = re.search(r"notes:\s*'([^']+)'", chunk)
    print(f'{lid:25} {(name_m.group(1) if name_m else "?")}')
    print(f'  FICO {fico_m.group(1) if fico_m else "?":>4} LTV {ltv_m.group(1) if ltv_m else "?":>3} DSCR {dscr_m.group(1) if dscr_m else "?":>5} Min ${(min_m.group(1) if min_m else "?"):>10} Max ${(max_m.group(1) if max_m else "?"):>10} Conf {(conf_m.group(1) if conf_m else "?")} STR {str_m.group(1) if str_m else "?"} IO {io_m.group(1) if io_m else "?"} PPP {prepay_m.group(1) if prepay_m else "?"}')
