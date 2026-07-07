import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Fix prop={{Colors.xyz}} -> prop={Colors.xyz}
    content = re.sub(r'(\w+)=\{\{Colors\.([a-zA-Z0-9_]+)\}\}', r'\1={Colors.\2}', content)

    # Also fix prop=Colors.xyz -> prop={Colors.xyz} if any were missed
    content = re.sub(r'(\w+)=Colors\.([a-zA-Z0-9_]+)', r'\1={Colors.\2}', content)
    
    # Also fix anything where we might have accidentally created syntax errors in conditionals
    # e.g., color: paymentMethod === method ? Colors.accent : '#4B5563'
    # Wait, the error is TS1005: ',' expected.
    # What caused this? Let's check App.tsx line 911
    # Actually let's just see what App.tsx line 911 has.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

fix_file('App.tsx')
for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

print('Done')
