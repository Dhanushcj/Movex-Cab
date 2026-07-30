import fs from 'fs';

const files = [
  'src/components/PassPurchaseScreen.tsx',
  'src/components/ScheduleRideScreen.tsx',
  'src/components/SettingsScreen.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Match prop=colors.something and replace with prop={colors.something}
  // Be careful not to match things inside quotes (which shouldn't happen anyway since they are bare)
  content = content.replace(/([a-zA-Z]+)=colors\.([a-zA-Z]+)/g, '$1={colors.$2}');
  fs.writeFileSync(file, content);
}
