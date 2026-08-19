const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetLine = `          <View style={styles.homeMapPreview}>`;

const linesToInject = `    );
  }

  // ── Main home screen ──────────────────────────────────────────────────────
  return (
    <View style={styles.homeContainer}>
      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />

      {/* ─────────────────── HOME TAB ─────────────────── */}
      {activeTab === 'home' && (
        <>
          {/* Full-screen map */}
`;

if (content.includes(targetLine) && !content.includes('// ── Main home screen')) {
  // We need to inject `linesToInject` right before `targetLine`
  const targetIndex = content.indexOf(targetLine);
  content = content.substring(0, targetIndex) + linesToInject + content.substring(targetIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Fixed the broken return in HomeScreen!");
} else {
  console.log("Could not apply fix - maybe it was already fixed or targetline not found.");
}
