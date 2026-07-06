import re
import json

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dictionary to hold new keys
    en_translations = {}
    ta_translations = {}

    def slugify(text):
        slug = re.sub(r'[^a-zA-Z0-9]+', '', text.title())
        return 'app.' + (slug[:20] if slug else 'empty')

    # Replace <Text>something</Text>
    def replace_text(match):
        pre = match.group(1)
        text = match.group(2).strip()
        post = match.group(3)

        # Ignore if it contains JSX expressions or is very short/numeric
        if '{' in text or '}' in text or not re.search('[a-zA-Z]', text):
            return match.group(0)

        key = slugify(text)
        en_translations[key] = text
        
        return f"{pre}{{t('{key}')}}{post}"

    content = re.sub(r'(<Text[^>]*>)([^<]+)(</Text>)', replace_text, content)

    # Replace placeholders
    def replace_placeholder(match):
        pre = match.group(1)
        text = match.group(2).strip()
        
        key = slugify(text)
        en_translations[key] = text
        
        return f"{pre}{{t('{key}')}}"

    content = re.sub(r'(placeholder=)"([^"]+)"', replace_placeholder, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    with open('new_translations.json', 'w', encoding='utf-8') as f:
        json.dump(en_translations, f, indent=2)

process_file('App.tsx')
