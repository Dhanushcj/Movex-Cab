"""
Diagnostic script to check if HOME TAB code is inside HomeScreen function.
"""
file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find HomeScreen function line
homescreen_line = None
for i, line in enumerate(lines):
    if 'function HomeScreen(' in line:
        homescreen_line = i + 1  # 1-indexed
        break

print(f"HomeScreen starts at line: {homescreen_line}")

# Find the HOME TAB marker
home_tab_line = None
for i, line in enumerate(lines):
    if '─────────────────── HOME TAB ───────────────────' in line:
        home_tab_line = i + 1
        break

print(f"HOME TAB section at line: {home_tab_line}")

# Check lines 1280-1365 for the monthly payment modal structure
print("\n=== Lines 1280-1365 ===")
for i in range(1279, 1365):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')

print("\n\n=== Lines around error (1385-1395) ===")
for i in range(1384, 1395):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')
