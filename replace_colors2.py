import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the color mapping based on hex values
color_map = {
    r'#(FFF|FFFFFF|fff|ffffff)': 'Colors.bgSecondary',
    r'#(F8F9FA|f8f9fa)': 'Colors.bgPrimary',
    r'#(000|000000)': 'Colors.textPrimary',
    r'#262D36': 'Colors.textPrimary',
    r'#FCFCFC': 'Colors.textPrimary',
    r'#7C848D': 'Colors.textMuted',
    r'#A1A3A6': 'Colors.textSecondary'
}

# 1. JSX Props (e.g., color="#FFF" or color='#FFF') -> color={Colors.bgSecondary}
for hex_pattern, replacement in color_map.items():
    # Match property="hex" or property='hex'
    pattern = r'([a-zA-Z0-9_]+)=[\'"]' + hex_pattern + r'[\'"]'
    content = re.sub(pattern, r'\1={' + replacement + '}', content, flags=re.IGNORECASE)

# 2. Object properties / Inline styles (e.g., backgroundColor: '#FFF' or backgroundColor: "#FFF") -> backgroundColor: Colors.bgSecondary
for hex_pattern, replacement in color_map.items():
    # Match : 'hex' or : "hex"
    pattern = r':\s*[\'"]' + hex_pattern + r'[\'"]'
    content = re.sub(pattern, r': ' + replacement, content, flags=re.IGNORECASE)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
