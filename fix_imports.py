import glob

for filepath in glob.glob('src/components/**/*.tsx', recursive=True) + ['App.tsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'Colors.' in content and 'import Colors from' not in content:
        lines = content.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
                
        lines.insert(last_import + 1, "import Colors from '../constants/colors';")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
            
print('Success')
