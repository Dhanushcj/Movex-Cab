import fs from 'fs';

const files = [
  'src/components/DriverAchievementsScreen.tsx',
  'src/components/PassPurchaseScreen.tsx',
  'src/components/ScheduleRideScreen.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("from \\'../../context/ThemeContext';", "from '../../context/ThemeContext';");
  fs.writeFileSync(file, content);
}
