import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's just find `<View style={styles.homeBottomCard}>` directly.
content = re.sub(
    r'(<View style=\{styles\.homeBottomCard\}>)',
    r"{bookingMode !== 'metro' && (\n          \1",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed start tag!")
