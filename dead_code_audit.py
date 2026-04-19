import os
import re
import time

all_files_path = "all_src_files.txt"
with open(all_files_path, "r") as f:
    all_files = [line.strip() for line in f.readlines()]

# Base set of files to search IN
search_targets = [f for f in all_files if f.endswith(('.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.json'))]

usage_stats = {}

ENTRY_POINTS = [
    "main.py", "App.jsx", "index.html", "vite.config.js", "package.json", 
    "requirements.txt", "Dockerfile", "vercel.json", "render.yaml", 
    "tailwind.config.js", "postcss.config.js", "eslint.config.js",
    "package-lock.json", ".env", ".env.example", ".gitignore", "README.md"
]

def check_file(file_path):
    basename = os.path.basename(file_path)
    if basename in ENTRY_POINTS:
        return "DEFINITELY USED (Entry Point/Config)"
    
    if any(suffix in basename.lower() for suffix in [".old", ".bak", ".backup", "-copy", "-old", "-deprecated", ".tmp", "copy of"]):
        return "DEFINITELY UNUSED (Backup Suffix)"

    name_no_ext = os.path.splitext(basename)[0]
    # Handle common pluralization/singular naming variations
    search_pattern = re.compile(rf"\b{re.escape(name_no_ext)}\b", re.IGNORECASE)
    
    found = False
    for target in search_targets:
        if target == file_path:
            continue
        try:
            with open(target, 'r', errors='ignore') as f_target:
                content = f_target.read()
                if name_no_ext in content:
                    found = True
                    break
        except: continue
        
    if found:
        return "DEFINITELY USED (Referenced)"
    
    # Heuristics for LIKELY USED
    if "/pages/" in file_path or "/routes/" in file_path or "/routers/" in file_path:
        return "LIKELY USED (Route/Page Pattern)"
    
    return "POSSIBLY UNUSED"

for f in all_files:
    usage_stats[f] = check_file(f)

# Grouping
def get_file_info(p):
    if not os.path.exists(p): return (0, 0)
    stat = os.stat(p)
    return (stat.st_size, stat.st_mtime)

print("SECTION 1: DEFINITELY UNUSED (safe to delete)")
print("File Path|Size (bytes)|Reason Flagged|Last Modified")
for p, status in usage_stats.items():
    if "DEFINITELY UNUSED" in status:
        size, mtime = get_file_info(p)
        print(f"{p}|{size}|{status.split('(')[1].rstrip(')')}|{time.ctime(mtime)}")

print("\nSECTION 2: POSSIBLY UNUSED (review before deleting)")
print("File Path|Size (bytes)|Why It Might Still Be Needed|Last Modified")
for p, status in usage_stats.items():
    if "POSSIBLY UNUSED" in status:
        size, mtime = get_file_info(p)
        # Check for planned work
        note = "No code references found"
        try:
            with open(p, 'r', errors='ignore') as f:
                content = f.read()
                if "TODO" in content or "FIXME" in content:
                   note = "Contains TODO/FIXME"
        except: pass
        if p.endswith(('.jpg', '.png', '.svg', '.json')):
            note = "Asset - may be referenced via dynamic path"
        
        print(f"{p}|{size}|{note}|{time.ctime(mtime)}")

print("\nSECTION 3: DUPLICATE OR BACKUP FILES")
pairs = []
for p1, s1 in usage_stats.items():
    for p2, s2 in usage_stats.items():
        if p1 >= p2: continue
        n1 = os.path.splitext(os.path.basename(p1))[0]
        n2 = os.path.splitext(os.path.basename(p2))[0]
        if n1 in n2 and len(n2) > len(n1) and any(s in n2.lower() for s in ["old", "bak", "copy", "dup"]):
            print(f"{p1} and {p2}")

print("\nSECTION 4: LARGE FILES WORTH REVIEWING")
for p in all_files:
    size, _ = get_file_info(p)
    if size > 100 * 1024:
        print(f"{p}|{size/1024:.1f} KB")

print("\nSECTION 5: SUMMARY")
total_scanned = len(all_files)
def_unused = len([p for p, s in usage_stats.items() if "DEFINITELY UNUSED" in s])
pos_unused = len([p for p, s in usage_stats.items() if "POSSIBLY UNUSED" in s])
recovered_space = sum([get_file_info(p)[0] for p, s in usage_stats.items() if "UNUSED" in s])

print(f"Total files scanned|{total_scanned}")
print(f"Total flagged as definitely unused|{def_unused}")
print(f"Total flagged as possibly unused|{pos_unused}")
print(f"Total potential recovered space|{recovered_space/1024:.1f} KB")
