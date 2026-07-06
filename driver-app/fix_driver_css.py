with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('--bg-color: #F3F4F6;', '--bg-color: #030A11;')
content = content.replace('--text-dark: #262D36;', '--text-dark: #FCFCFC;')
content = content.replace('--text-grey: #7C848D;', '--text-grey: #A1A3A6;')
content = content.replace('--white: #FCFCFC;', '--white: #262D36;')
content = content.replace('--white-pure: #FFFFFF;', '--white-pure: #030A11;')
content = content.replace('--card-bg-light: #F6F8FE;', '--card-bg-light: #1A1F26;')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
