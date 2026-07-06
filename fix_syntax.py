with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "style={{ width: 56, height: 28, backgroundColor: Colors.borderGlass, borderRadius: 16 }, isDark && { backgroundColor: '#0053B3', justifyContent: 'center', paddingHorizontal: 2 }}>",
    "style={[{ width: 56, height: 28, backgroundColor: Colors.borderGlass, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 2 }, isDark && { backgroundColor: '#0053B3' }]}>"
)

content = content.replace(
    "style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }, isDark && { transform: [{ translateX: 28 }] }]} />",
    "style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }, isDark && { transform: [{ translateX: 28 }] }]} />"
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
