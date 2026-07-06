import glob
import re

for filepath in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find every occurrence of 'const styles = useStyles(Colors);'
    # Check if 'const { colors: Colors } = useTheme();' is on the line above it.
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'const styles = useStyles(Colors);' in line:
            # Check the lines above it in the block
            has_colors = False
            for j in range(max(0, i-5), i):
                if 'useTheme' in lines[j]:
                    has_colors = True
                    break
            
            if not has_colors:
                # Get indentation of current line
                indent = len(line) - len(line.lstrip())
                lines[i] = (' ' * indent) + 'const { colors: Colors } = useTheme();\n' + line

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

print('Success')
