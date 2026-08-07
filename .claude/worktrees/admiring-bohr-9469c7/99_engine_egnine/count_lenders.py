import re
with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\lenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()
ids = re.findall(r"id:\s*'([a-z_]+)'", content)
print(f'Lender IDs found: {len(ids)}')
for i in ids:
    print(f'  - {i}')
