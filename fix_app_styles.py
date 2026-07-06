import os
import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const styles = StyleSheet.create({", "const getStyles = () => StyleSheet.create({")

lines = content.split('\n')
new_lines = []

in_component = False
has_injected = False
brace_count = 0

for line in lines:
    # Check for start of component
    if re.match(r'^(export )?(default )?function [A-Z]\w*\s*\(.*?\)\s*\{', line.strip()):
        new_lines.append(line)
        new_lines.append("  const styles = getStyles();")
        continue
    
    new_lines.append(line)

content = '\n'.join(new_lines)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
