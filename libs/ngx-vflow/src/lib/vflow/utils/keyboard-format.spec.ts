import { parseBinding } from './keyboard-binding';
import { formatBinding, formatBindings } from './keyboard-format';

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('public keyboard key labels', () => {
  it('names modifiers the way each platform calls them, in words a screen reader can read', () => {
    expect(formatBinding(parse('Mod+Shift+a'), true)).toBe('Command+Shift+A');
    expect(formatBinding(parse('Mod+Shift+a'), false)).toBe('Ctrl+Shift+A');
    expect(formatBinding(parse('Alt+Enter'), true)).toBe('Option+Enter');
    expect(formatBinding(parse('Alt+Enter'), false)).toBe('Alt+Enter');
    // A modifier entry names the held key itself.
    expect(formatBinding(parse('Mod'), true)).toBe('Command');
    expect(formatBinding(parse('Mod'), false)).toBe('Ctrl');
  });

  it('keeps the spelling of the configuration', () => {
    expect(formatBinding(parse('ArrowUp'))).toBe('ArrowUp');
    expect(formatBinding(parse('NumpadAdd'))).toBe('NumpadAdd');
    expect(formatBinding(parse('Space'))).toBe('Space');
    expect(formatBinding(parse(' '))).toBe('Space');
    expect(formatBinding(parse('+'))).toBe('+');
  });

  it('joins a list into one phrase', () => {
    expect(formatBindings(['Enter', 'Space'].map(parse))).toBe('Enter or Space');
    expect(formatBindings(['+', '=', 'NumpadAdd'].map(parse))).toBe('+, = or NumpadAdd');
    expect(formatBindings([parse('Enter')])).toBe('Enter');
    expect(formatBindings([])).toBe('');
  });
});
