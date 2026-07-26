import re
import json
with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\lenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ids = re.findall(r"id:\s*'([a-z_]+)'", content)
print(f'Total lenders: {len(ids)}')
print()

# Extract the LENDERS constant block
m = re.search(r'export const LENDERS[^=]*=\s*\[(.*?)\n\]', content, re.S)
if not m:
    m = re.search(r'const LENDERS[^=]*=\s*\[(.*?)\n\]', content, re.S)
if m:
    body = m.group(1)
    # Find each lender object
    blocks = re.findall(r"\{\s*id:\s*'([a-z_]+)'.*?\n\s*\},", body, re.S)
    print(f'Found {len(blocks)} lender object blocks')
    for bid in blocks:
        # Find the corresponding chunk
        idx = body.find(f"id: '{bid}'")
        chunk = body[idx:idx+2500]
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
        print(f'{bid:25} {(name_m.group(1) if name_m else "?")}')
        print(f'  FICO {fico_m.group(1) if fico_m else "?":>4} LTV {ltv_m.group(1) if ltv_m else "?":>3} DSCR {dscr_m.group(1) if dscr_m else "?":>5} Min ${(min_m.group(1) if min_m else "?"):>10} Max ${(max_m.group(1) if max_m else "?"):>10} Conf {(conf_m.group(1) if conf_m else "?")} STR {str_m.group(1) if str_m else "?"} IO {io_m.group(1) if io_m else "?"}')
        if notes_m:
            note = notes_m.group(1)[:100]
            print(f'  Note: {note}')
        print()
