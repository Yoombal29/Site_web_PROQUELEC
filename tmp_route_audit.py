import os
import re
root = 'src'
page_dir = os.path.join(root, 'pages')
page_files = []
for dirpath, dirnames, filenames in os.walk(page_dir):
    for f in filenames:
        if f.endswith('.tsx'):
            page_files.append(os.path.relpath(os.path.join(dirpath, f), root).replace('\\', '/'))
page_files.sort()
with open(os.path.join(root, 'App.tsx'), 'r', encoding='utf-8') as f:
    app = f.read()
imports = set(re.findall(r'import\s+(?:\{[^}]+\}|[^\s]+)\s+from\s+["\"]\./pages/([^"\']+)', app))
imports |= set(re.findall(r'import\s+(?:\{[^}]+\}|[^\s]+)\s+from\s+["\"]/src/pages/([^"\']+)', app))
imports |= set(re.findall(r'import\s+(?:\{[^}]+\}|[^\s]+)\s+from\s+["\"]\./pages/([^"\']+/[^"\']+)', app))
imported_modules = set()
for imp in imports:
    imported_modules.add(imp if imp.endswith('.tsx') else imp + '.tsx')
routes = re.findall(r'\{\s*path:\s*"([^"]+)",\s*element:\s*<([^>/]+)', app)
route_components = set(e for _, e in routes)
imported_modules_sorted = sorted(imported_modules)
print('PAGE_FILES_TOTAL', len(page_files))
for pf in page_files:
    print('PAGE_FILE', pf)
print('IMPORTS_TOTAL', len(imported_modules_sorted))
for im in imported_modules_sorted:
    print('IMPORTS', im)
print('ROUTE_COMPONENTS_TOTAL', len(route_components))
for rc in sorted(route_components):
    print('ROUTE', rc)
