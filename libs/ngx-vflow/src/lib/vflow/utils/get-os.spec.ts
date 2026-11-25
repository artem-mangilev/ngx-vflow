import { getOS } from './get-os';

describe('getOS', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [
      'macos',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    [
      'ios',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    ],
    ['windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'],
    [
      'android',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile',
    ],
    ['linux', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'],
  ])('is %s for its user agent', (os, userAgent) => {
    vi.stubGlobal('navigator', { userAgent });

    expect(getOS()).toBe(os);
  });

  it('is null for an unknown user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'SomeBot/1.0' });

    expect(getOS()).toBeNull();
  });

  it('is null without a navigator, as on a server', () => {
    vi.stubGlobal('navigator', undefined);

    expect(getOS()).toBeNull();
  });
});
