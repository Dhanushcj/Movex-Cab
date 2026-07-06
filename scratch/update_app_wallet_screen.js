const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Revert handleTabPress
const oldHandleTabPress = `  const handleTabPress = (tab: TabName) => {
    if (tab === 'wallet') {
      setShowWalletModal(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'trips') { fetchMyRides(); }
  };`;
const newHandleTabPress = `  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'trips') { fetchMyRides(); }
  };`;
content = content.replace(oldHandleTabPress, newHandleTabPress);

// 2. Add import for CustomerWalletScreen
if (!content.includes('import CustomerWalletScreen')) {
  content = content.replace(
    `import AdminDashboardScreen from './src/components/AdminDashboardScreen';`,
    `import AdminDashboardScreen from './src/components/AdminDashboardScreen';\nimport CustomerWalletScreen from './src/components/CustomerWalletScreen';`
  );
}

// 3. Render CustomerWalletScreen when activeTab === 'wallet'
const targetRender = `      {activeTab === 'account' && (`;
const newRender = `      {activeTab === 'wallet' && (
        <CustomerWalletScreen
          onBack={() => setActiveTab('home')}
          onNavigateHome={() => handleTabPress('home')}
          onNavigateHistory={() => handleTabPress('trips')}
        />
      )}
      
      {activeTab === 'account' && (`;
if (!content.includes(`<CustomerWalletScreen`)) {
  content = content.replace(targetRender, newRender);
}

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx updated to use CustomerWalletScreen');
