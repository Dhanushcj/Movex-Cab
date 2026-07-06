import json
import re

with open('src/context/LanguageContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

en_add = '''      "app.Logout": "Logout",
      "profile.darkTheme": "Dark theme",
      "profile.appLanguage": "App language",
      "profile.alertSound": "Order alert sound",
      "profile.helpCentre": "Help Centre",
      "profile.supportTickets": "Support tickets",
      "profile.settings": "Settings",'''
content = content.replace('"app.Logout": "Logout",', en_add)

ta_add = '''      "app.Logout": "????????",
      "profile.darkTheme": "?????? ????",
      "profile.appLanguage": "?????????? ????",
      "profile.alertSound": "????????????? ???",
      "profile.helpCentre": "???? ?????",
      "profile.supportTickets": "????? ?????????????",
      "profile.settings": "??????????",'''
content = content.replace('"app.Logout": "????????",', ta_add)

with open('src/context/LanguageContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
