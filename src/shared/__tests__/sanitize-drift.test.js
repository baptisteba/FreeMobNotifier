// Guards against drift between the server's shared/sanitize.js (CJS)
// and the client's src/client/src/utils/sanitize.js (ESM mirror).
import { describe, it, expect } from 'vitest';
import serverModule from '../sanitize.js';
import { sanitizeMessage as clientSanitize, MAX_SMS_LENGTH as clientMax } from '../../client/src/utils/sanitize.js';

const { sanitizeMessage: serverSanitize, MAX_SMS_LENGTH: serverMax } = serverModule;

describe('server/client sanitize parity', () => {
  const samples = [
    'Café au lait',
    'Noël joyeux',
    'œuf coque',
    'Hello, World!',
    'emoji 🎉 here',
    '\u201chi\u201d \u2014 \u2018bye\u2019',
    '\u2026',
    '  trim me  ',
    ''
  ];

  for (const s of samples) {
    it(`produces identical output for: ${JSON.stringify(s)}`, () => {
      expect(clientSanitize(s)).toBe(serverSanitize(s));
    });
  }

  it('both expose MAX_SMS_LENGTH=160', () => {
    expect(clientMax).toBe(160);
    expect(serverMax).toBe(160);
  });
});
