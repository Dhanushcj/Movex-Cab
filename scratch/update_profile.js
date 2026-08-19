const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = "{/* ─────────────────── ACCOUNT TAB ─────────────────── */}";
const endMarker = "{/* ─────────────────── TRIPS TAB ─────────────────── */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const originalBlock = content.substring(startIndex, endIndex);
  
  const newBlock = `{/* ─────────────────── ACCOUNT TAB (REDESIGNED) ─────────────────── */}
      {activeTab === 'account' && (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#262D36' }}>My Profile</Text>
            </View>

            {/* Profile Card */}
            <TouchableOpacity style={{ backgroundColor: '#0053B3', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }} activeOpacity={0.9}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#005FCC', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>{formatInitials(user?.name || 'U')}</Text>
                </View>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: '#FCFCFC', fontSize: 16, fontWeight: '600' }}>{user?.name || 'Rider'}</Text>
                  <Text style={{ color: '#A1A3A6', fontSize: 14, marginTop: 4 }}>{user?.phone || 'No phone'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#FED101', fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#8DABCE', fontSize: 12, opacity: 0.5 }}>⭐</Text>
                    <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: '500', marginLeft: 4 }}>4.9</Text>
                  </View>
                </View>
                <Feather name="edit-2" size={20} color="#FCFCFC" style={{ opacity: 0.8 }} />
              </View>
            </TouchableOpacity>

            {/* Wallet Quick Access */}
            <TouchableOpacity onPress={() => setShowWalletModal(true)} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="credit-card" size={20} color="#0284C7" />
                </View>
                <View>
                  <Text style={{ color: '#000000', fontSize: 14, fontWeight: '500' }}>MoveX Wallet</Text>
                  <Text style={{ color: '#7C848D', fontSize: 12, marginTop: 2 }}>Top up your balance</Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0053B3' }}>₹ {user?.wallet?.balance || 0}</Text>
            </TouchableOpacity>

            {/* Options Block */}
            <View style={{ backgroundColor: '#FCFCFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { icon: 'moon', label: 'Dark theme', color: '#0053B3', toggle: true },
                { icon: 'globe', label: 'App language', color: '#0053B3' },
                { icon: 'volume-2', label: 'Alert sound', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#262D36', fontWeight: '500', flex: 1 }}>{item.label}</Text>
                    {item.toggle ? (
                      <View style={{ width: 56, height: 28, backgroundColor: '#DEE0E3', borderRadius: 16, justifyContent: 'center', paddingHorizontal: 2 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }} />
                      </View>
                    ) : (
                      <Text style={{ fontSize: 20, color: '#262D36', opacity: 0.5 }}>›</Text>
                    )}
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Support Block */}
            <View style={{ backgroundColor: '#FCFCFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
              {[
                { icon: 'help-circle', label: 'Help Centre', color: '#0053B3' },
                { icon: 'message-square', label: 'Support tickets', color: '#0053B3' },
                { icon: 'settings', label: 'Settings', color: '#0053B3' },
              ].map((item, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.5, borderColor: 'rgba(0, 83, 179, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#262D36', fontWeight: '500', flex: 1 }}>{item.label}</Text>
                    <Text style={{ fontSize: 20, color: '#262D36', opacity: 0.5 }}>›</Text>
                  </TouchableOpacity>
                  {idx < 2 && <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16 }} />}
                </View>
              ))}
            </View>

            {/* Log out */}
            <TouchableOpacity style={{ borderWidth: 1, borderColor: '#F52F14', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }} onPress={async () => { await logout(); }}>
              <Text style={{ color: '#F52F14', fontSize: 14, fontWeight: '500' }}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}

      `;
            
  content = content.replace(originalBlock, newBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully replaced Customer Account Profile!");
} else {
  console.log("Could not find markers.");
}
