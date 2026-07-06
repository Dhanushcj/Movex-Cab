import os
import glob
import re

files = glob.glob('src/components/**/*.tsx', recursive=True)
files.append('App.tsx')

success_count = 0

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'const styles = StyleSheet.create({' in content:
        if 'const getStyles = () => StyleSheet.create({' in content:
            continue
            
        content = content.replace('const styles = StyleSheet.create({', 'const getStyles = () => StyleSheet.create({')
        
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(line)
            # Find a function definition
            if re.match(r'^(export )?(default )?function [A-Z]\w*\s*\(.*?\)\s*\{', line.strip()) or re.match(r'^(export )?const [A-Z]\w*\s*=\s*\(.*?\)\s*=>\s*\{', line.strip()):
                new_lines.append("  const styles = getStyles();")
                
        content = '\n'.join(new_lines)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        success_count += 1

print(f"Success, modified {success_count} files")
