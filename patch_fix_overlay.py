import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the search overlay condition
search_pattern = r'\{pickerMode !== null \|\| showMap \? \('
new_search = "{pickerMode !== null || (showMap && bookingMode !== 'metro') ? ("

content = re.sub(search_pattern, new_search, content)

# Also fix the bottom tab bar condition so it disappears correctly
tab_pattern = r"\{!\(activeTab === 'home' && \(\!\!dropAddr \|\| \(estimates && estimates\.length > 0\) \|\| pickerMode !== null \|\| showMap\)\) && \("
new_tab = "{!(activeTab === 'home' && (!!dropAddr || (estimates && estimates.length > 0) || pickerMode !== null || showMap)) && ("

# Let's just do a simple replacement for the search overlay first
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed search overlay logic!")
