const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';

let content = fs.readFileSync(path, 'utf8');

const brokenBlock = `      {activeScreen === 'tracking' && user?.role === 'driver' && (
        <DriverActiveRideScreen 
          ride={selectedRide} 
          onNavigateHistory={() => setActiveScreen('driverHistory')}
        />
      )}
      {activeScreen === 'adminDashboard' && (
        <AdminDashboardScreen onNavigateLogout={() => setActiveScreen('login')} />
      )}`;

const fixedBlock = `      {activeScreen === 'tracking' && user?.role === 'driver' && (
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
      )}`;

content = content.replace(brokenBlock, fixedBlock);

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx restored properly');
