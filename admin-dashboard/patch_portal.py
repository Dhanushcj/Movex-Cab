import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\RouteManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Import createPortal
if 'createPortal' not in content:
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
    )

# Wrap Junction Dialog in Portal
junction_start = "{/* New Junction Dialog */}\n      {openJunctionDialog && ("
junction_portal_start = "{/* New Junction Dialog */}\n      {openJunctionDialog && createPortal("
if junction_start in content:
    content = content.replace(junction_start, junction_portal_start)
    # find the closing of this block
    # It ends with: "        </div>\n      )}"
    content = content.replace(
        "        </div>\n      )}",
        "        </div>,\n        document.body\n      )}",
        1 # only replace the first occurrence (which is the junction dialog)
    )

# Wrap Route Dialog in Portal
route_start = "{/* New Route Dialog */}\n      {openRouteDialog && ("
route_portal_start = "{/* New Route Dialog */}\n      {openRouteDialog && createPortal("
if route_start in content:
    content = content.replace(route_start, route_portal_start)
    content = content.replace(
        "        </div>\n      )}",
        "        </div>,\n        document.body\n      )}",
        1 # this will hit the route dialog
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied createPortal to modals!")
