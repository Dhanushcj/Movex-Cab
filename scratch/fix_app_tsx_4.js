const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add prop to HomeScreen render in NavigationRoot
content = content.replace(
  `<HomeScreen \r
          onRideBooked={(booking: any) => {\r
            setSelectedRide(booking);\r
            setActiveScreen('tracking');\r
          }} \r
        />`,
  `<HomeScreen \r
          onRideBooked={(booking: any) => {\r
            setSelectedRide(booking);\r
            setActiveScreen('tracking');\r
          }} \r
          onNavigateProfileEdit={() => setActiveScreen('driverProfileEdit')} \r
        />`
);

// fallback if the above replace missed due to \n vs \r\n
content = content.replace(
  /<HomeScreen \n\s*onRideBooked=\{\(booking: any\) => \{\n\s*setSelectedRide\(booking\);\n\s*setActiveScreen\('tracking'\);\n\s*\}\} \n\s*\/>/g,
  `<HomeScreen 
          onRideBooked={(booking: any) => {
            setSelectedRide(booking);
            setActiveScreen('tracking');
          }} 
          onNavigateProfileEdit={() => setActiveScreen('driverProfileEdit')} 
        />`
);

// wait let's just do a simpler replace for NavigationRoot's HomeScreen
if (!content.includes('onNavigateProfileEdit={() => setActiveScreen')) {
  content = content.replace(
    `          onRideBooked={(booking: any) => {
            setSelectedRide(booking);
            setActiveScreen('tracking');
          }} 
        />`,
    `          onRideBooked={(booking: any) => {
            setSelectedRide(booking);
            setActiveScreen('tracking');
          }} 
          onNavigateProfileEdit={() => setActiveScreen('driverProfileEdit')}
        />`
  );
}

// 2. Change HomeScreen signature
content = content.replace(
  `function HomeScreen({ onRideBooked }: { onRideBooked: (ride: any) => void }) {`,
  `function HomeScreen({ onRideBooked, onNavigateProfileEdit }: { onRideBooked: (ride: any) => void; onNavigateProfileEdit: () => void; }) {`
);

// 3. Change onPress in HomeScreen
content = content.replace(
  `onPress={() => setActiveScreen('driverProfileEdit')}`,
  `onPress={onNavigateProfileEdit}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx fixed successfully');
