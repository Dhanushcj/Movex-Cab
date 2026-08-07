import sys
import re

file_path = r'g:\Dhanush\New folder\Movex-Cab\customer-app\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to wrap <View style={styles.homeBottomCard}> and its children in {bookingMode !== 'metro' && ( ... )}
# We can find <View style={styles.homeBottomCard}> and replace it.
# To find the end, it's easier to use a regex or string replacement. 
# There's a comment `        {/* Route Booking Bottom Sheet */}` right after it.

old_str = """          {/* "?"? BOTTOM CARD "?"? */}
          <View style={styles.homeBottomCard}>"""

new_str = """          {/* "?"? BOTTOM CARD "?"? */}
          {bookingMode !== 'metro' && (
          <View style={styles.homeBottomCard}>"""

if old_str in content:
    content = content.replace(old_str, new_str)
else:
    print("Could not find start of homeBottomCard")

end_str = """            {/* Bottom padding for tabs */}
            <View style={{ height: 100 }} />
          </View>
        )}
      
        {/* Route Booking Bottom Sheet */}"""

new_end_str = """            {/* Bottom padding for tabs */}
            <View style={{ height: 100 }} />
          </View>
          )}
        )}
      
        {/* Route Booking Bottom Sheet */}"""

# Wait, let's verify the end_str exists
if "        {/* Route Booking Bottom Sheet */}" in content:
    # Use regex to find the closing View of homeBottomCard before this comment
    content = re.sub(
        r'(<View style={{ height: 100 }} />\s*</View>\s*)(\s*\{/\* Route Booking Bottom Sheet \*/\})',
        r'\1)}\2',
        content
    )
    print("Successfully replaced end!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for hiding homeBottomCard in metro mode!")
