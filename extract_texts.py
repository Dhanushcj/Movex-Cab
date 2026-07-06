import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find strings inside >...< in Text tags
text_matches = re.findall(r'>([^<{}]+)</Text>', content)
text_matches = [m.strip() for m in text_matches if m.strip() and not m.strip().isdigit() and m.strip() not in ['?', '?', '›']]

# Find placeholders
placeholder_matches = re.findall(r'placeholder="([^"]+)"', content)

all_strings = set(text_matches + placeholder_matches)
for s in sorted(all_strings):
    print(s)
