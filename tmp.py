import re, sys
content=open('src/components/MarketingSite.tsx', encoding='utf8').read()
matches=re.findall(r'<SafeScript[^>]+code=\{([^}]+)\}', content)
for m in matches:
    print('---')
    print(m)
