import codecs
import json
import re

with codecs.open('src/context/LanguageContext.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Add new keys
en_new = '''    'app.ConfirmPickupLocation': "Confirm Pickup Location",
    'app.ConfirmDropLocation': "Confirm Drop Location",
    'app.Book': "Book",'''

ta_new = '''    'app.ConfirmPickupLocation': "????-??? ?????? ??????????????",
    'app.ConfirmDropLocation': "?????? ??????????????",
    'app.Book': "????????? ????",'''

content = content.replace("'app.GotIt':", en_new + "\n    'app.GotIt':")
content = content.replace("'app.GotIt':", ta_new + "\n    'app.GotIt':", 1) # Note: 2nd occurrence is Tamil section but python string replace isn't index based natively like that without split.

# Safe replace
parts = content.split("'app.GotIt':")
if len(parts) == 3:
    content = parts[0] + en_new + "\n    'app.GotIt':" + parts[1] + ta_new + "\n    'app.GotIt':" + parts[2]

with codecs.open('src/context/LanguageContext.tsx', 'w', 'utf-8') as f:
    f.write(content)
