with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\after-tax.ts', 'r', encoding='utf-8') as f:
    content = f.read()
# Find the function that returns 100% for OBBBA
import re
# Search for jan19_2025
idx = content.find('jan19_2025')
if idx > 0:
    print(content[max(0,idx-500):idx+2000])
else:
    print("jan19_2025 not found, searching for bonus")
    idx = content.find('function bonus')
    print(content[max(0,idx-200):idx+2500] if idx > 0 else "not found")
