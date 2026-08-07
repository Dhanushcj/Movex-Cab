import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Disable rendering of LocationPickerScreen
content = content.replace(
    'if (pickerMode) {',
    'if (false) {'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Disabled LocationPickerScreen rendering completely!")
