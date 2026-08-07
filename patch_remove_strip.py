import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the homePickupStrip block
pattern = r'\s*\{\/\* Pickup strip on map bottom \*\/.*?<\/TouchableOpacity>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed homePickupStrip from App.tsx!")
