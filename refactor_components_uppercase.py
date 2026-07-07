import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Check if already refactored
    if 'getStyles(Colors' in content or 'getStyles = ' in content:
        # It might be partially refactored or we need to start clean.
        # Let's revert it back to normal first if we somehow messed up.
        pass

    # 1. Change StyleSheet.create to getStyles
    content = re.sub(
        r'const\s+styles\s*=\s*StyleSheet\.create\s*\(\s*\{',
        r'const getStyles = (Colors: any) => StyleSheet.create({',
        content
    )

    # 2. Inject useTheme into file imports if missing
    if 'useTheme' not in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import {{ useTheme }} from '{depth}context/ThemeContext';\n" + content
    
    # 3. Inject Colors into file imports if missing
    if 'import Colors' not in content and 'Colors.' in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import Colors from '{depth}constants/colors';\n" + content

    # 4. Find all React components (functions starting with Uppercase)
    # Match: export default function Foo(...) {
    # Match: function Foo(...) {
    # Match: const Foo = (...) => {
    # Match: const Foo = function(...) {
    
    # Pattern for function Foo(...) {
    def inject_function(match):
        prefix = match.group(1) # e.g. "function Foo("
        params = match.group(2) # e.g. "props"
        suffix = match.group(3) # e.g. ") {"
        
        # Determine if it's uppercase
        func_name_match = re.search(r'(?:function\s+|const\s+)([A-Z][a-zA-Z0-9_]*)', prefix)
        
        if func_name_match:
            # It's a React component!
            injection = "\n    const { isDark } = useTheme();\n"
            if 'const getStyles = ' in content:
                injection += "    const styles = getStyles(Colors);\n"
            
            # Avoid double injection
            if 'const styles = getStyles(Colors)' in match.group(0):
                return match.group(0)
                
            return prefix + params + suffix + injection
        else:
            return match.group(0)

    # Regex to match: function Name(args) {  OR export default function Name(args) {
    content = re.sub(
        r'((?:export\s+default\s+)?function\s+[A-Z][a-zA-Z0-9_]*\s*\()([^)]*)(\)\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        inject_function,
        content
    )

    # Regex to match: const Name = (args) => {
    def inject_arrow(match):
        prefix = match.group(1)
        params = match.group(2)
        suffix = match.group(3)
        
        injection = "\n    const { isDark } = useTheme();\n"
        if 'const getStyles = ' in content:
            injection += "    const styles = getStyles(Colors);\n"
            
        return prefix + params + suffix + injection

    content = re.sub(
        r'(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\()([^)]*)(\)\s*=>\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        inject_arrow,
        content
    )
    
    # Regex to match: const Name = ({destructured}: Type) => {
    # This is trickier because of the colon and nested braces.
    # Instead, let's just do a simpler search for const [A-Z]\w* = .*=> {
    
    # Let's fix the double injections if they happened
    content = re.sub(r'(    const \{ isDark \} = useTheme\(\);\n)+(    const styles = getStyles\(Colors\);\n)+', r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        pass

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

print('Done')
