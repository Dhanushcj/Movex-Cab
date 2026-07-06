const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* Floating top header on map */}';
const endMarker = '{/* Pickup strip on map bottom */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const originalBlock = content.substring(startIndex, endIndex);
  
  const newBlock = `{/* Floating top header on map */}
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              backgroundColor: '#FCFCFC', borderWidth: 1, borderColor: '#DEE0E3',
              borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
              paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, zIndex: 10,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
            }}>
              <View style={{ paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleTabPress('account')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderGlass }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.accent }}>{formatInitials(user?.name || 'U')}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', gap: 4 }}>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#7C848D' }}>{new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}</Text>
                      <Text style={{ fontFamily: 'sans-serif', fontSize: 20, color: '#262D36', fontWeight: 'bold' }}>{user?.name?.split(' ')[0] || 'Rider'}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="alert-triangle" size={18} color="#F71313" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowWalletModal(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="credit-card" size={18} color="#9098A2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            `;
            
  content = content.replace(originalBlock, newBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully replaced Customer Top Nav!");
} else {
  console.log("Could not find markers.");
}
