with open('src/constants/colors.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('export default darkColors;', 'export default lightColors;')

with open('src/constants/colors.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
