import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 1
content = content.replace('/img/people/brook-powers.png', '/img/generated/av1.png')
content = content.replace('Brook Powers', 'Maya Reynolds')
content = content.replace('CEO, Fiduciary Financial', 'Principal Broker, Reynolds Capital')

# Replace 2
content = content.replace('/img/people/doug-thalhammer.png', '/img/generated/av2.png')
content = content.replace('Doug Thalhammer', 'David Chen')
content = content.replace('broker, FSG', 'Managing Director, Chen & Co.')

# Replace 3
content = content.replace('/img/people/adam-boyer.png', '/img/generated/av4.png')
content = content.replace('Adam Boyer', 'Carlos Martinez')
content = content.replace('broker &amp; COO, JMG Financial Group', 'Broker &amp; COO, Martinez Capital')

# Replace 4
content = content.replace('/img/people/alex-stickelman.png', '/img/generated/av5.png')
content = re.sub(r'Alex Stickelman[^<]*', 'Emma Wallace', content)
content = content.replace('broker &amp; COO, Root Financial', 'Broker &amp; COO, Nexus Financial')

# Replace 5
content = content.replace('/img/people/maranda-leonard.png', '/img/generated/av3.png')
content = content.replace('Maranda Leonard', 'Layla Kabbani')
content = content.replace('Director, Risk Management, S2 Capital', 'Director of Originations, Cedar Funding')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
