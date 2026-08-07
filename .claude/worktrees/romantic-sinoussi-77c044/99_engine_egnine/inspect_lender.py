with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\lenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find("id: 'kiavi'")
chunk = content[idx:idx+2500]
print(chunk)
