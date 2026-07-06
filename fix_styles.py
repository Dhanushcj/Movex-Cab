import os
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)
files.append('App.tsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'const styles = StyleSheet.create({' in content:
        # Check if we already injected getStyles
        if 'const getStyles = () => StyleSheet.create({' in content:
            continue
            
        # Replace the module level styles declaration
        content = content.replace('const styles = StyleSheet.create({', 'const getStyles = () => StyleSheet.create({')
        
        # Inject const styles = getStyles(); at the beginning of the component
        # Finding the main component export can be tricky. We can look for export default function  or unction  or const 
        # Actually, let's just use regex to find the component block. 
        # But this is risky if there are multiple components in one file.
