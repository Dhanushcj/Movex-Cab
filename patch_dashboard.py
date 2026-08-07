import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\src\components\DashboardUI.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the search bar onPress to just call onBookRide (the metro flow)
# Also change the text from "Search destination" to "Explore Routes"
search_bar = """        {/* SEARCH BAR */}
        <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: colors.bgSecondary, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border }} onPress={onSearchClick || onBookRide}>
          <Feather name="search" size={20} color="#7C848D" />
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Search destination</Text>
        </TouchableOpacity>"""

new_search_bar = """        {/* SEARCH BAR -> EXPLORE ROUTES */}
        <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: colors.bgSecondary, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border }} onPress={onBookRide}>
          <Feather name="map" size={20} color="#7C848D" />
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Explore Metro Routes</Text>
        </TouchableOpacity>"""

content = content.replace(search_bar, new_search_bar)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("DashboardUI updated to only trigger Metro flow!")
