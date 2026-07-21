import re
from pathlib import Path
path = Path('index.html')
text = path.read_text(encoding='utf-8')
start = text.index('const countryData = {')
end = text.index('};', start) + 2
block = text[start:end]
map_flags = {
    'BR': '🇧🇷', 'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹',
    'ES': '🇪🇸', 'PT': '🇵🇹', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'MX': '🇲🇽', 'CN': '🇨🇳',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺', 'RU': '🇷🇺', 'ZA': '🇿🇦', 'NL': '🇳🇱',
    'SE': '🇸🇪', 'CH': '🇨🇭', 'NO': '🇳🇴', 'DK': '🇩🇰', 'AT': '🇦🇹', 'BE': '🇧🇪', 'IE': '🇮🇪',
    'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'GR': '🇬🇷', 'HU': '🇭🇺', 'RO': '🇷🇴', 'SK': '🇸🇰',
    'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸', 'EE': '🇪🇪', 'LT': '🇱🇹', 'TR': '🇹🇷', 'UA': '🇺🇦',
    'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'QA': '🇶🇦', 'KW': '🇰🇼', 'BH': '🇧🇭', 'OM': '🇴🇲',
    'IQ': '🇮🇶', 'IR': '🇮🇷', 'JO': '🇯🇴', 'LB': '🇱🇧', 'KZ': '🇰🇿', 'EG': '🇪🇬', 'NG': '🇳🇬',
    'DZ': '🇩🇿', 'SG': '🇸🇬', 'MY': '🇲🇾', 'ID': '🇮🇩', 'PH': '🇵🇭', 'TH': '🇹🇭', 'VN': '🇻🇳',
    'BD': '🇧🇩', 'PK': '🇵🇰', 'LK': '🇱🇰', 'NP': '🇳🇵', 'MM': '🇲🇲', 'KH': '🇰🇭', 'MN': '🇲🇳',
    'TW': '🇹🇼', 'HK': '🇭🇰', 'NZ': '🇳🇿', 'PE': '🇵🇪', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾',
    'BO': '🇧🇴', 'EC': '🇪🇨', 'GT': '🇬🇹', 'HN': '🇭🇳', 'SV': '🇸🇻', 'NI': '🇳🇮', 'BZ': '🇧🇿',
    'CR': '🇨🇷', 'PA': '🇵🇦', 'DO': '🇩🇴', 'JM': '🇯🇲', 'CU': '🇨🇺', 'HT': '🇭🇹', 'TT': '🇹🇹',
    'BS': '🇧🇸', 'BB': '🇧🇧', 'PR': '🇵🇷', 'GY': '🇬🇾', 'SR': '🇸🇷', 'GLOBAL': '🌐'
}
pattern = re.compile(r"(\s+)([A-Z0-9_]+): \{ name: '([^']+)', avg: (\d+) \},")
new_lines = []
for line in block.splitlines():
    m = pattern.match(line)
    if m:
        code = m.group(2)
        name = m.group(3)
        avg = m.group(4)
        flag = map_flags.get(code, '🌐')
        new_lines.append(f"{m.group(1)}{code}: {{ name: '{name}', avg: {avg}, flag: '{flag}' }},")
    else:
        new_lines.append(line)
new_block = '\n'.join(new_lines)
path.write_text(text[:start] + new_block + text[end:], encoding='utf-8')
print('patched')
