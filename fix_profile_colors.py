with open('src/components/ProfileScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix backButton background
content = content.replace("backgroundColor: '#DEE0E3',", "backgroundColor: Colors.borderGlass,")

# Fix toggleTrack background (which is the same)
# Actually, they are both '#DEE0E3', so the replace above fixed both!

# Ensure no other weird backgrounds
with open('src/components/ProfileScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
