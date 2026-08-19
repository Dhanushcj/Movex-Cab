const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update TabName type
content = content.replace(
  `  type TabName = 'home' | 'services' | 'trips' | 'account';`,
  `  type TabName = 'home' | 'services' | 'trips' | 'account' | 'wallet';`
);

// 2. Update handleTabPress
const targetHandleTabPress = `  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'trips') { fetchMyRides(); }
  };`;
const newHandleTabPress = `  const handleTabPress = (tab: TabName) => {
    if (tab === 'wallet') {
      setShowWalletModal(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'trips') { fetchMyRides(); }
  };`;
content = content.replace(targetHandleTabPress, newHandleTabPress);

// 3. Update Bottom Nav Bar config
const targetNavConfig = `        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'services', icon: 'grid',  label: 'Services' },
          { key: 'trips',    icon: 'clock', label: 'Trips' },
          { key: 'account',  icon: 'user',  label: 'Account' },
        ] as { key: TabName; icon: string; label: string }[]).map((tab) => (`;
const newNavConfig = `        {([
          { key: 'home',     icon: 'home',  label: 'Home' },
          { key: 'services', icon: 'grid',  label: 'Services' },
          { key: 'wallet',   icon: 'credit-card', label: 'Wallet' },
          { key: 'trips',    icon: 'clock', label: 'Trips' },
        ] as { key: TabName; icon: string; label: string }[]).map((tab) => (`;
content = content.replace(targetNavConfig, newNavConfig);

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx bottom nav updated successfully.');
