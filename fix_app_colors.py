with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Lines to replace 'backgroundColor: Colors.textPrimary' -> 'backgroundColor: Colors.bgSecondary'
# 804
content = content.replace("backgroundColor: Colors.textPrimary, borderWidth: 1, borderColor: '#DEE0E3',", "backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderGlass,")
# 1016, 1042
content = content.replace("backgroundColor: Colors.textPrimary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20", "backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20")
# 1915
content = content.replace("backgroundColor: Colors.textPrimary,\n            borderWidth: 1,\n            borderColor: '#DEE0E3',", "backgroundColor: Colors.bgSecondary,\n            borderWidth: 1,\n            borderColor: Colors.borderGlass,")
# 1972
content = content.replace("backgroundColor: Colors.textPrimary,\n            borderRadius: 24,", "backgroundColor: Colors.bgSecondary,\n            borderRadius: 24,")
# 2015
content = content.replace("backgroundColor: Colors.textPrimary,\n            borderWidth: 1,\n            borderColor: '#DEE0E3',", "backgroundColor: Colors.bgSecondary,\n            borderWidth: 1,\n            borderColor: Colors.borderGlass,")
# 2112
content = content.replace("backgroundColor: Colors.textPrimary, borderWidth: 1, borderColor: '#DEE0E3', borderRadius: 12", "backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderGlass, borderRadius: 12")

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
