import os
import re

src_dir = r"c:\Users\Amatek\Desktop\website\old-money-algeria-frontend\src"

replacements = {
    # Old named tailwind classes -> New named tailwind classes
    r"\bbg-bg-dark\b": "bg-bg",
    r"\btext-text-light\b": "text-text",
    
    # Specific color hexes -> Tailwind semantic names
    r"bg-\[\#0A0A0A\]": "bg-bg",
    r"bg-\[\#1A1A1A\]": "bg-cards",
    r"bg-\[\#111111\]": "bg-cards",
    r"bg-\[\#0D2B0D\]": "bg-cards",
    r"bg-\[\#1B3A1B\]": "bg-cards",
    r"bg-\[\#1A1400\]": "bg-cards",
    r"bg-\[\#0B4D2B\]": "bg-primary",
    r"bg-\[\#D4AF37\]": "bg-accent",
    r"bg-\[\#F5F0E8\]": "bg-text",
    
    r"text-\[\#0A0A0A\]": "text-bg",
    r"text-\[\#F5F0E8\]": "text-text",
    r"text-\[\#D4AF37\]": "text-accent",
    r"text-\[\#0B4D2B\]": "text-primary",
    r"text-\[\#FFFFFF\]": "text-text",
    
    r"border-\[\#D4AF37\]": "border-accent",
    r"border-\[\#333333\]": "border-border",
    r"border-\[\#1A1A1A\]": "border-cards",
    r"border-\[\#0A0A0A\]": "border-bg",
    
    # White Opacities -> Border/Muted theme tokens
    r"border-white/10": "border-border",
    r"border-white/20": "border-border",
    r"border-white/5": "border-border",
    r"bg-white/5": "bg-cards",
    r"bg-white/10": "bg-cards brightness-150", 
    r"bg-white/20": "bg-cards brightness-200", 
    
    r"text-white/30": "text-muted",
    r"text-white/40": "text-muted",
    r"text-white/50": "text-muted",
    r"text-white/60": "text-muted",
    r"text-white/70": "text-muted",
    r"text-white/80": "text-muted",
    r"text-gray-400": "text-muted",
    r"text-gray-500": "text-muted",
    
    # Specific fixes based on search
    r"\btext-black\b": "text-bg",
    
    # We leave text-white on 'PROMO' badge because it has bg-error (red) so text must be white
    r"bg-error text-white": "bg-error text-white", # Exception handling, wait, this will be matched, but if I just don't replace text-white everywhere, it's fine.
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
        
    # Replace inline hex colors as well if they exist
    content = content.replace("#0A0A0A", "var(--color-bg)")
    content = content.replace("#1A1A1A", "var(--color-cards)")
    content = content.replace("#0B4D2B", "var(--color-primary)")
    content = content.replace("#D4AF37", "var(--color-accent)")
    content = content.replace("#F5F0E8", "var(--color-text)")
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')) and not 'index.css' in file: # I already did index.css
            process_file(os.path.join(root, file))
print("Done refactoring frontend.")
