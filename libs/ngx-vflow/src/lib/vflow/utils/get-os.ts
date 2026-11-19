/** The operating system of the reader; `null` for an unknown one and on a server, which has no reader yet. */
export function getOS() {
  const userAgent = (typeof navigator === 'undefined' ? '' : navigator.userAgent).toLowerCase();
  const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i;
  const windowsPlatforms = /(win32|win64|windows|wince)/i;
  const iosPlatforms = /(iphone|ipad|ipod)/i;

  let os = null;

  if (macosPlatforms.test(userAgent)) {
    os = 'macos' as const;
  } else if (iosPlatforms.test(userAgent)) {
    os = 'ios' as const;
  } else if (windowsPlatforms.test(userAgent)) {
    os = 'windows' as const;
  } else if (/android/.test(userAgent)) {
    os = 'android' as const;
  } else if (!os && /linux/.test(userAgent)) {
    os = 'linux' as const;
  }

  return os;
}
