import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix icon border
content = content.replace(
    "borderColor: 'rgba(0, 83, 179, 0.2)'",
    "borderColor: '#0053B3'"
)

# Fix chevron icon
content = re.sub(
    r"<Text style=\{\{ fontSize: 20, color: Colors\.textPrimary, opacity: 0\.5 \}\}>[^<]+</Text>",
    "<Feather name=\"chevron-right\" size={24} color={Colors.textPrimary} style={{ opacity: 0.5 }} />",
    content
)

# Fix toggle switch
target_toggle = '''                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: Colors.borderGlass, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 2 }, isDark && { backgroundColor: '#0053B3' }]}>
                        <View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }, isDark && { transform: [{ translateX: 28 }] }]} />
                      </View>
                    )'''
replacement_toggle = '''                    {item.toggle ? (
                      <View style={[{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16 }, isDark && { backgroundColor: '#22282F' }]}>
                        <View style={[{ position: 'absolute', top: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: '#A1A3A6', left: -3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 }, isDark && { backgroundColor: '#0053B3', left: 25 }]} />
                      </View>
                    )'''
content = content.replace(target_toggle, replacement_toggle)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
