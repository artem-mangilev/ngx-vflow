import { matchesBinding, matchesBindingKey, parseBinding } from './keyboard-binding';

function event(init: KeyboardEventInit) {
  return new KeyboardEvent('keydown', init);
}

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('public keyboard binding grammar', () => {
  it('reads modifiers, keys, the space alias and physical codes without regard to case', () => {
    expect(parseBinding('Enter')).toEqual({ key: 'enter', source: 'Enter', modifiers: [], mod: false });
    expect(parseBinding(' ')).toEqual({ key: ' ', source: ' ', modifiers: [], mod: false });
    expect(parseBinding('Space')).toEqual({ key: 'space', source: 'Space', modifiers: [], mod: false });
    expect(parseBinding('MOD+shift+A')).toEqual({ key: 'a', source: 'A', modifiers: ['shift'], mod: true });
    expect(parseBinding('+')).toEqual({ key: '+', source: '+', modifiers: [], mod: false });
    expect(parseBinding('Shift++')).toEqual({ key: '+', source: '+', modifiers: ['shift'], mod: false });
    expect(parseBinding('Mod+KeyS')).toEqual({ key: 'keys', source: 'KeyS', modifiers: [], mod: true });
  });

  it('rejects a binding that names anything but a modifier before its key', () => {
    for (const binding of ['', '   ', 'a+b', '+a', 'Shift+', 'Ctrl+s', 'Shift++a']) {
      expect(parseBinding(binding), `"${binding}"`).toBeNull();
    }
  });

  it('resolves Mod to Meta on macOS and to Control elsewhere, as a modifier and as a key', () => {
    const command = parse('Mod+s');
    expect(matchesBinding(command, event({ key: 's', metaKey: true }), { mac: true })).toBe(true);
    expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: true })).toBe(false);
    expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: false })).toBe(true);
    expect(matchesBinding(command, event({ key: 's' }), { mac: false })).toBe(false);
    // A modifier entry names the held key itself and constrains nothing else.
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Meta', metaKey: true }), true)).toBe(true);
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Meta', metaKey: true }), false)).toBe(false);
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Control', ctrlKey: true }), false)).toBe(true);
    expect(matchesBindingKey(parse('MetaRight'), event({ key: 'Meta', code: 'MetaRight' }))).toBe(true);
  });

  it('checks Control, Meta and Alt exactly and leaves Shift free unless the binding names it', () => {
    const zero = parse('0');
    expect(matchesBinding(zero, event({ key: '0' }))).toBe(true);
    // Shift is free: it accelerates movement and produces the characters that bindings name.
    expect(matchesBinding(zero, event({ key: '0', shiftKey: true }))).toBe(true);
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      expect(matchesBinding(zero, event({ key: '0', ...init })), JSON.stringify(init)).toBe(false);
    }
    const shifted = parse('Shift+a');
    expect(matchesBinding(shifted, event({ key: 'A', shiftKey: true }))).toBe(true);
    expect(matchesBinding(shifted, event({ key: 'a' }))).toBe(false);
    // A tolerated modifier passes in either state, which is how holding multiselection still selects.
    expect(matchesBinding(zero, event({ key: '0', metaKey: true }), { ignoreModifiers: ['meta'] })).toBe(true);
    expect(matchesBinding(zero, event({ key: '0' }), { ignoreModifiers: ['meta'] })).toBe(true);
  });

  it('accepts a binding that names the character and one that names the physical key', () => {
    // The same character reached from two layout positions, and the same position giving another character.
    expect(matchesBinding(parse('+'), event({ key: '+', code: 'BracketRight' }))).toBe(true);
    expect(matchesBinding(parse('+'), event({ key: '+', code: 'Equal', shiftKey: true }))).toBe(true);
    expect(matchesBinding(parse('='), event({ key: '+', code: 'Equal', shiftKey: true }))).toBe(false);
    // A code name matches the position whatever the character is, which is how a keypad key is named.
    expect(matchesBinding(parse('NumpadAdd'), event({ key: '+', code: 'NumpadAdd' }))).toBe(true);
    expect(matchesBinding(parse('Numpad0'), event({ key: 'Insert', code: 'Numpad0' }))).toBe(true);
    expect(matchesBinding(parse('Equal'), event({ key: '+', code: 'Equal', shiftKey: true }))).toBe(true);
    expect(matchesBinding(parse('Space'), event({ key: ' ', code: 'Space' }))).toBe(true);
    expect(matchesBinding(parse(' '), event({ key: ' ', code: 'Space' }))).toBe(true);
  });
});
