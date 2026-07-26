with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\after-tax.ts', 'r', encoding='utf-8') as f:
    content = f.read()
# Find calculateBonusDepreciation function
import re
m = re.search(r'export function calculateBonusDepreciation.*?(?=export function|\Z)', content, re.S)
if m:
    print(m.group(0)[:3500])
else:
    print("Not found, looking for bonusDep...")
    m = re.search(r'export function getBonusDepRate.*?(?=export function|\Z)', content, re.S)
    if m:
        print(m.group(0)[:3500])
