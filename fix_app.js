const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Change StyleSheet.create
content = content.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (colors: any) => StyleSheet.create({');

// 2. Replace Colors. with colors. (except imports)
content = content.replace(/(?<!import )Colors\./g, 'colors.');

// 3. Inject correctly into the 7 components
const inject = (lineMatch) => {
  const idx = content.indexOf(lineMatch);
  if (idx !== -1) {
    const endOfLine = content.indexOf('\\n', idx);
    const before = content.slice(0, endOfLine + 1);
    const after = content.slice(endOfLine + 1);
    content = before + '  const { colors, isDark } = useTheme();\\n  const styles = getStyles(colors);\\n' + after;
  }
};

inject('function NavigationRoot() {');
inject('onBack: () => void;\\n  }) {'); // LocationPickerScreen
inject('activePasses?: any[]; onPassPurchased?: () => void; }) {'); // HomeScreen
inject('function TrackingScreen({ ride, onClose }: { ride: any; onClose: () => void }) {');
inject('export default function App() {');
inject('() => void; }) {'); // DriverHomeScreen
inject('function DriverActiveRideScreen({ ride, onClose }: { ride: any; onClose: () => void }) {');

// Fix duplicates in HomeScreen
content = content.replace(/const \{ isDark, toggleTheme \} = useTheme\(\);\n/, '');

fs.writeFileSync('App.tsx', content);
