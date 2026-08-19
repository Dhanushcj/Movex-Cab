const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<View style={styles.homeTabBar}>
        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'services', icon: 'grid',  label: 'Services' },
          { key: 'trips',    icon: 'clock', label: 'Trips' },
          { key: 'account',  icon: 'user',  label: 'Account' },
        ] as { key: TabName; icon: string; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.homeTabItem}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon as any} size={22} color={activeTab === tab.key ? Colors.accent : Colors.textMuted} />
            {activeTab === tab.key && <View style={styles.homeTabActiveDot} />}
            <Text style={[styles.homeTabLabel, activeTab === tab.key && styles.homeTabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>`;

const replaceStr = `<View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, position: 'absolute', bottom: 16, left: 16, right: 16, borderRadius: 20, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
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
      </View>`;

// normalize line endings in both target and source to ensure match
const contentNormalized = content.replace(/\\r\\n/g, '\\n');
const targetNormalized = targetStr.replace(/\\r\\n/g, '\\n');

if (contentNormalized.includes(targetNormalized)) {
  const newContent = contentNormalized.replace(targetNormalized, replaceStr);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Success");
} else {
  console.log("Failed to find target string");
}
