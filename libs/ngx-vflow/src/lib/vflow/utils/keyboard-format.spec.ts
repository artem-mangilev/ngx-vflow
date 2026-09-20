import { parseBinding } from './keyboard-binding';
import { formatAriaShortcut, formatBinding, formatBindings } from './keyboard-format';

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('public keyboard key labels', () => {
  it('names modifiers the way each platform calls them, in words a screen reader can read', () => {
    expect(formatBinding(parse('Mod+Shift+a'), {}, true)).toBe('Command+Shift+A');
    expect(formatBinding(parse('Mod+Shift+a'), {}, false)).toBe('Ctrl+Shift+A');
    expect(formatBinding(parse('Alt+Enter'), {}, true)).toBe('Option+Enter');
    expect(formatBinding(parse('Alt+Enter'), {}, false)).toBe('Alt+Enter');
    // A modifier entry names the held key itself.
    expect(formatBinding(parse('Mod'), {}, true)).toBe('Command');
    expect(formatBinding(parse('Mod'), {}, false)).toBe('Ctrl');
  });

  it('keeps the spelling of the configuration and lets an application translate it', () => {
    expect(formatBinding(parse('ArrowUp'))).toBe('ArrowUp');
    expect(formatBinding(parse('NumpadAdd'))).toBe('NumpadAdd');
    expect(formatBinding(parse('Space'))).toBe('Space');
    expect(formatBinding(parse(' '))).toBe('Space');
    expect(formatBinding(parse('+'))).toBe('+');
    expect(formatBinding(parse('ArrowUp'), { arrowup: 'стрелка вверх' })).toBe('стрелка вверх');
    expect(formatBinding(parse('Mod+a'), { meta: '⌘' }, true)).toBe('⌘+A');
  });

  it('joins a list with a word an application can replace', () => {
    const bindings = ['Enter', 'Space'].map(parse);
    expect(formatBindings(bindings)).toBe('Enter or Space');
    expect(formatBindings(bindings, { or: 'или' })).toBe('Enter или Space');
    expect(formatBindings(['+', '=', 'NumpadAdd'].map(parse))).toBe('+, = or NumpadAdd');
    expect(formatBindings([parse('Enter')])).toBe('Enter');
    expect(formatBindings([])).toBe('');
  });

  it('writes the aria-keyshortcuts grammar with modifiers first and the reserved key names', () => {
    expect(formatAriaShortcut(parse('Mod+Enter'), true)).toBe('Meta+Enter');
    expect(formatAriaShortcut(parse('Mod+Enter'), false)).toBe('Control+Enter');
    expect(formatAriaShortcut(parse('Shift+Alt+w'))).toBe('Alt+Shift+w');
    expect(formatAriaShortcut(parse('+'))).toBe('Plus');
    expect(formatAriaShortcut(parse('Space'))).toBe('Space');
    expect(formatAriaShortcut(parse(' '))).toBe('Space');
    expect(formatAriaShortcut(parse('ArrowUp'))).toBe('ArrowUp');
  });
});
