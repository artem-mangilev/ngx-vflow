import { parseBinding } from './keyboard-binding';
import { formatBinding, formatBindings } from './keyboard-format';

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('formatBinding', () => {
  it.each([
    ['Mod+Shift+a', true, 'Command+Shift+A'],
    ['Mod+Shift+a', false, 'Ctrl+Shift+A'],
    ['Alt+Enter', true, 'Option+Enter'],
    ['Alt+Enter', false, 'Alt+Enter'],
    ['Mod', true, 'Command'],
    ['Mod', false, 'Ctrl'],
  ])('names the modifiers of %s the way the platform does (mac: %s)', (binding, mac, label) => {
    expect(formatBinding(parse(binding), mac)).toBe(label);
  });

  it.each([
    ['ArrowUp', 'ArrowUp'],
    ['NumpadAdd', 'NumpadAdd'],
    ['Space', 'Space'],
    [' ', 'Space'],
    ['+', '+'],
  ])('keeps the spelling of %j', (binding, label) => {
    expect(formatBinding(parse(binding))).toBe(label);
  });
});

describe('formatBindings', () => {
  it.each([
    [[], ''],
    [['Enter'], 'Enter'],
    [['Enter', 'Space'], 'Enter or Space'],
    [['+', '=', 'NumpadAdd'], '+, = or NumpadAdd'],
  ])('joins %j into one phrase', (bindings, phrase) => {
    expect(formatBindings(bindings.map(parse))).toBe(phrase);
  });
});
