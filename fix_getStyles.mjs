import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('getStyles(Colors)')) {
    // replace getStyles(Colors) with getStyles(colors)
    content = content.replace(/getStyles\(Colors\)/g, 'getStyles(colors)');
    
    // ensure `colors` is extracted
    if (content.includes('const { isDark } = useTheme();')) {
      content = content.replace('const { isDark } = useTheme();', 'const { colors, isDark } = useTheme();');
    } else if (!content.includes('const { colors')) {
      // Find the first getStyles(colors) and insert the hook before it if useTheme is not already there
      // This is a bit tricky, let's find the component signature
      const compRegex = /(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{|export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/;
      const match = content.match(compRegex);
      if (match) {
        content = content.replace(match[1], match[1] + '\n  const { colors, isDark } = useTheme();');
      }
    }
    fs.writeFileSync(file, content);
  }
}
