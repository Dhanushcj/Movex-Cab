import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to remove the entire `searchOverlay` block.
# The block starts with `{pickerMode !== null || (showMap && bookingMode !== 'metro') ? (`
# And ends before `{/* HOME TAB */}` or something similar.
# Wait, it's inside `HomeScreen`.
# Let's just find the exact block and delete it.
# Actually, the block is huge. It's safer to just set the condition to `false ? (` so it NEVER renders!

# Replace `{pickerMode !== null || (showMap && bookingMode !== 'metro') ? (`
# with `{false ? (`

target_condition = r'\{pickerMode !== null \|\| \(showMap && bookingMode !== \'metro\'\) \? \('
new_condition = "{false ? ("

if re.search(target_condition, content):
    content = re.sub(target_condition, new_condition, content)
    print("Disabled search overlay rendering completely!")
else:
    # If the previous regex patch didn't apply (because of the crash or stash), check for the older condition
    target_condition_old = r'\{pickerMode !== null \|\| showMap \? \('
    if re.search(target_condition_old, content):
        content = re.sub(target_condition_old, new_condition, content)
        print("Disabled old search overlay rendering completely!")
    else:
        print("Could not find search overlay condition to disable!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
