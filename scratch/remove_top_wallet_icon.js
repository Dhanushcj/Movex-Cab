const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `                    <TouchableOpacity onPress={() => setShowWalletModal(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="credit-card" size={18} color="#9098A2" />
                    </TouchableOpacity>`;

content = content.replace(targetStr, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully removed wallet icon from top bar in App.tsx');
