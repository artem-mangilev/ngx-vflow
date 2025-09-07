export function isCallable(fn: any): boolean {
  try {
    new Proxy(fn, { apply: () => undefined })();
    return true;
  } catch (err) {
    return false;
  }
}
