with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the key from NavigationRoot so it doesn't destroy the navigation state
content = content.replace("<NavigationRoot key={isDark ? 'dark' : 'light'} />", "<NavigationRoot />")

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
