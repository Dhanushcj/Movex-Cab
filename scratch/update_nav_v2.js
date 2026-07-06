const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* ─────────────────── BOTTOM TAB BAR ─────────────────── */}';
const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  // Find the first </View> after the start marker
  const endMarker = '</View>';
  let currentIndex = startIndex;
  let viewCount = 0;
  
  // Actually, we know exactly what we're replacing. Let's just use regex between the start marker and the wallet modal.
  const walletMarker = '{/* ─────────────────── WALLET MODAL ─────────────────── */}';
  const walletIndex = content.indexOf(walletMarker, startIndex);
  
  if (walletIndex !== -1) {
    const originalBlock = content.substring(startIndex, walletIndex);
    
    const newBlock = `{/* ─────────────────── BOTTOM TAB BAR (REDESIGNED) ─────────────────── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'services', icon: 'grid',  label: 'Services' },
          { key: 'trips',    icon: 'clock', label: 'Trips' },
          { key: 'account',  icon: 'user',  label: 'Account' },
        ] as { key: TabName; icon: string; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={activeTab === tab.key ? { backgroundColor: Colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 } : { padding: 8 }}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon as any} size={activeTab === tab.key ? 18 : 24} color={activeTab === tab.key ? '#FCFCFC' : '#9098A2'} />
            {activeTab === tab.key && (
              <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      `;
      
    content = content.replace(originalBlock, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced Customer Bottom Nav!");
  } else {
    console.log("Could not find wallet marker.");
  }
} else {
  console.log("Could not find start marker.");
}
