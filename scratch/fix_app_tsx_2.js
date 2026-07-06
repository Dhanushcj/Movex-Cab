const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';

let content = fs.readFileSync(path, 'utf8');

const targetStr = `          onNavigateWallet={() => setActiveScreen('driverWallet')}
        />
      )}

// 1. REVAMPED LOGIN SCREEN`;

const replacement = `          onNavigateWallet={() => setActiveScreen('driverWallet')}
        />
      )}
      {activeScreen === 'tracking' && user?.role === 'driver' && (
        <DriverActiveRideScreen 
          ride={selectedRide} 
          onClose={() => {
            setSelectedRide(null);
            setActiveScreen('home');
          }} 
        />
      )}
      {activeScreen === 'driverProfile' && (
        <ProfileScreen 
          onBack={() => setActiveScreen('home')} 
          onEditProfile={() => setActiveScreen('driverProfileEdit')}
          onNavigateLanguage={() => setActiveScreen('driverLanguage')}
        />
      )}
      {activeScreen === 'driverProfileEdit' && (
        <ProfileEditScreen 
          onBack={() => setActiveScreen(user?.role === 'customer' ? 'home' : 'driverProfile')}
          onSave={() => setActiveScreen(user?.role === 'customer' ? 'home' : 'driverProfile')}
        />
      )}
      {activeScreen === 'driverLanguage' && (
        <LanguageScreen onBack={() => setActiveScreen('driverProfile')} />
      )}
      {activeScreen === 'driverHistory' && (
        <DriverHistoryScreen onNavigateHome={() => setActiveScreen('home')} />
      )}
      {activeScreen === 'driverWallet' && (
        <DriverWalletScreen
          onBack={() => setActiveScreen('home')}
          onNavigateHome={() => setActiveScreen('home')}
          onNavigateHistory={() => setActiveScreen('driverHistory')}
        />
      )}
      {activeScreen === 'adminDashboard' && (
        <AdminDashboardScreen onNavigateLogout={() => setActiveScreen('login')} />
      )}
      <StatusBar style="light" />
    </View>
  );
}

// 1. REVAMPED LOGIN SCREEN`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('App.tsx restored properly');
} else {
  // Let's try matching with regex to ignore exact newlines
  const regex = /onNavigateWallet=\{\(\) => setActiveScreen\('driverWallet'\)\}\r?\n\s*\/>\r?\n\s*\)\}\r?\n\s*\/\/\ 1\.\ REVAMPED\ LOGIN\ SCREEN/;
  if (regex.test(content)) {
    content = content.replace(regex, replacement.replace('// 1. REVAMPED LOGIN SCREEN', '').trim() + '\r\n\r\n// 1. REVAMPED LOGIN SCREEN');
    fs.writeFileSync(path, content, 'utf8');
    console.log('App.tsx restored properly using regex');
  } else {
    console.log('Could not find target string');
  }
}
