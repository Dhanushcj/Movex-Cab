import os
import glob
import re

def process_file(filepath, is_app_tsx=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content

    # 1. Update imports
    if is_app_tsx:
        content = content.replace("import Colors from './src/constants/colors';", "import { ThemeColors } from './src/constants/colors';\nimport { useTheme } from './src/context/ThemeContext';")
    else:
        content = content.replace("import Colors from '../constants/colors';", "import { ThemeColors } from '../constants/colors';\nimport { useTheme } from '../context/ThemeContext';")

    # 2. Convert StyleSheet.create to useStyles
    if 'StyleSheet.create' in content:
        content = content.replace(
            "const styles = StyleSheet.create({",
            "const useStyles = (Colors: any) => StyleSheet.create({"
        )

    # 3. Inject hook into functional components
    # Match standard arrow functions and standard functions for components
    # Only match if the function name starts with a capital letter (component)
    
    # For arrow functions: const MyComponent = (props) => {
    def replacer(match):
        func_def = match.group(1)
        # Avoid injecting multiple times
        if "useTheme();" in content[match.end():match.end()+100]:
            return func_def
            
        inject = "\n  const { colors: Colors } = useTheme();"
        if 'useStyles' in content:
            inject += "\n  const styles = useStyles(Colors);"
            
        return func_def + inject

    content = re.sub(r"(const [A-Z][a-zA-Z0-9_]*\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)(?::\s*[^=]+)?\s*=>\s*\{)", replacer, content)
    
    # For standard functions: function MyComponent(props) {
    content = re.sub(r"(function [A-Z][a-zA-Z0-9_]*\s*\([^)]*\)(?::\s*[^\{]+)?\s*\{)", replacer, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Processed {filepath}')

process_file('App.tsx', True)
for filepath in glob.glob('src/components/**/*.tsx', recursive=True):
    process_file(filepath)

print('Success')
