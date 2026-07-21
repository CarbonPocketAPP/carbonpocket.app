import re
from pathlib import Path
p = Path('index.html')
text = p.read_text(encoding='utf-8')
keys = set(re.findall(r'data-i18n="([^"]+)"', text))
print('data-i18n count', len(keys))
block = re.search(r'const translations = \{(.*?)\};\s*\n\s*// Add empty objects', text, re.S)
if not block:
    raise SystemExit('translations block not found')
for lang, body in re.findall(r'(en|pt):\s*\{(.*?)\}\s*(?:,\s*\w+:|\s*$)', block.group(1), re.S):
    tk = set(re.findall(r'([a-z0-9_]+):\s*', body))
    miss = sorted(keys - tk)
    extra = sorted(tk - keys)
    print(f'lang={lang} count={len(tk)} missing={len(miss)} extra={len(extra)}')
    if miss:
        print('  miss', miss)
    if extra:
        print('  extra', extra)
for pat in ['localStorage.getItem(\'carbonPocketLang\')', 'localStorage.setItem(\'carbonPocketLang\')', 'localStorage.getItem(\'carbonpocket-lang\')', 'localStorage.setItem(\'carbonpocket-lang\')', 'document.body.className', '\.lang-en', '\.lang-pt', '\.lang-en-block', '\.lang-pt-block', 'body\.pt', 'body\.en']:
    if re.search(pat, text):
        print('found', pat)
