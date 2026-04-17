// Client-side mirror of src/shared/sanitize.js.
// Duplicated because Vite/Rollup doesn't resolve CommonJS from outside the
// client root cleanly, and the server needs CommonJS to work with `require()`.
// Keep the two in sync when changing the accent map.

const accentMap = {
  '\u00e0': 'a', '\u00e1': 'a', '\u00e2': 'a', '\u00e3': 'a', '\u00e4': 'a', '\u00e5': 'a', '\u00e6': 'ae',
  '\u00e7': 'c',
  '\u00e8': 'e', '\u00e9': 'e', '\u00ea': 'e', '\u00eb': 'e',
  '\u00ec': 'i', '\u00ed': 'i', '\u00ee': 'i', '\u00ef': 'i',
  '\u00f1': 'n',
  '\u00f2': 'o', '\u00f3': 'o', '\u00f4': 'o', '\u00f5': 'o', '\u00f6': 'o', '\u00f8': 'o', '\u0153': 'oe',
  '\u00f9': 'u', '\u00fa': 'u', '\u00fb': 'u', '\u00fc': 'u',
  '\u00fd': 'y', '\u00ff': 'y',
  '\u00c0': 'A', '\u00c1': 'A', '\u00c2': 'A', '\u00c3': 'A', '\u00c4': 'A', '\u00c5': 'A', '\u00c6': 'AE',
  '\u00c7': 'C',
  '\u00c8': 'E', '\u00c9': 'E', '\u00ca': 'E', '\u00cb': 'E',
  '\u00cc': 'I', '\u00cd': 'I', '\u00ce': 'I', '\u00cf': 'I',
  '\u00d1': 'N',
  '\u00d2': 'O', '\u00d3': 'O', '\u00d4': 'O', '\u00d5': 'O', '\u00d6': 'O', '\u00d8': 'O', '\u0152': 'OE',
  '\u00d9': 'U', '\u00da': 'U', '\u00db': 'U', '\u00dc': 'U',
  '\u00dd': 'Y', '\u0178': 'Y',
  '\u201c': '"', '\u201d': '"', '\u00ab': '"', '\u00bb': '"',
  '\u2018': "'", '\u2019': "'", '\u0060': "'",
  '\u2026': '...',
  '\u2013': '-', '\u2014': '-',
  '\u00A0': ' '
};

export const MAX_SMS_LENGTH = 160;

export function sanitizeMessage(message) {
  if (!message) return '';
  let sanitized = message;
  for (const accent in accentMap) {
    sanitized = sanitized.split(accent).join(accentMap[accent]);
  }
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[^\x20-\x7E\n\r]/g, '');
  return sanitized.trim();
}
