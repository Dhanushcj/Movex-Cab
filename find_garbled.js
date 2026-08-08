const fs = require('fs');
const content = fs.readFileSync('customer-app/App.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('I\"')) {
    console.log(i + 1, lines[i].trim());
  }
}
