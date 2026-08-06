import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\Drivers.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_target = "import { ShieldCheck, UserX, AlertTriangle, Image, ExternalLink, X, Check, Activity } from 'lucide-react';"
new_import = "import { ShieldCheck, UserX, AlertTriangle, Image, ExternalLink, X, Check, Activity, MapPin } from 'lucide-react';"

if import_target in content:
    content = content.replace(import_target, new_import)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added MapPin import!")
