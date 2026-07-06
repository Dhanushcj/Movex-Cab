with open('src/components/ProfileScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix optionsBlock background
content = content.replace(
    '  optionsBlock: {\n    backgroundColor: Colors.textPrimary,',
    '  optionsBlock: {\n    backgroundColor: Colors.bgSecondary,'
)

# Fix iconCircle background
content = content.replace(
    "backgroundColor: '#F6F8FE',",
    "backgroundColor: Colors.iconBg,"
)

# Fix backButton background if it reverted to '#DEE0E3'
content = content.replace(
    "backgroundColor: '#DEE0E3',",
    "backgroundColor: Colors.borderGlass,"
)

with open('src/components/ProfileScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
