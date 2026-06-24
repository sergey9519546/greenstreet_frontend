import os
from bs4 import BeautifulSoup

def dedup_scripts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    scripts = soup.find_all('script')

    seen_srcs = set()
    seen_contents = set()
    removed_count = 0

    for script in scripts:
        if script.has_attr('src') and script['src']:
            src = script['src']
            if src in seen_srcs:
                script.decompose()
                removed_count += 1
            else:
                seen_srcs.add(src)
        elif script.string:
            content_hash = hash(script.string.strip())
            if content_hash in seen_contents:
                script.decompose()
                removed_count += 1
            else:
                seen_contents.add(content_hash)

    if removed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Removed {removed_count} duplicate script tags from {file_path}")
    else:
        print("No duplicate script tags found.")

if __name__ == '__main__':
    dedup_scripts('c:/Users/serge/OneDrive/Documents/DSCR_LOAN OFFICE/greenstreet_frontend/index.html')
