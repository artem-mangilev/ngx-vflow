import { matchesBinding, matchesBindingKey, parseBinding } from './keyboard-binding';

function event(init: KeyboardEventInit) {
  return new KeyboardEvent('keydown', init);
}

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('public keyboard binding grammar', () => {
  it('reads modifiers, keys, the space alias and physical codes without regard to case', () => {
    expect(parseBinding('Enter')).toEqual({ key: 'enter', code: false, modifiers: [], mod: false });
    expect(parseBinding('Space')).toEqual({ key: ' ', code: false, modifiers: [], mod: false });
    expect(parseBinding(' ')).toEqual({ key: ' ', code: false, modifiers: [], mod: false });
    expect(parseBinding('code:Space')).toEqual({ key: 'space', code: true, modifiers: [], mod: false });
    expect(parseBinding('MOD+shift+A')).toEqual({ key: 'a', code: false, modifiers: ['shift'], mod: true });
    expect(parseBinding('+')).toEqual({ key: '+', code: false, modifiers: [], mod: false });
    expect(parseBinding('Shift++')).toEqual({ key: '+', code: false, modifiers: ['shift'], mod: false });
    expect(parseBinding('Mod+code:KeyS')).toEqual({ key: 'keys', code: true, modifiers: [], mod: true });
  });

  it('rejects a binding that names anything but a modifier before its key', () => {
    for (const binding of ['', '   ', 'a+b', '+a', 'Shift+', 'Ctrl+s', 'Shift++a']) {
      expect(parseBinding(binding)).withContext(`"${binding}"`).toBeNull();
    }
  });

  it('resolves Mod to Meta on macOS and to Control elsewhere, as a modifier and as a key', () => {
    const command = parse('Mod+s');
    expect(matchesBinding(command, event({ key: 's', metaKey: true }), { mac: true })).toBeTrue();
    expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: true })).toBeFalse();
    expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: false })).toBeTrue();
    expect(matchesBinding(command, event({ key: 's' }), { mac: false })).toBeFalse();
    // A modifier entry names the held key itself and constrains nothing else.
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Meta', metaKey: true }), true)).toBeTrue();
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Meta', metaKey: true }), false)).toBeFalse();
    expect(matchesBindingKey(parse('Mod'), event({ key: 'Control', ctrlKey: true }), false)).toBeTrue();
    expect(matchesBindingKey(parse('code:MetaRight'), event({ key: 'Meta', code: 'MetaRight' }))).toBeTrue();
  });

  it('checks Control, Meta and Alt exactly and leaves Shift free unless the binding names it', () => {
    const zero = parse('0');
    expect(matchesBinding(zero, event({ key: '0' }))).toBeTrue();
    // Shift is free: it accelerates movement and produces the characters that bindings name.
    expect(matchesBinding(zero, event({ key: '0', shiftKey: true }))).toBeTrue();
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      expect(matchesBinding(zero, event({ key: '0', ...init })))
        .withContext(JSON.stringify(init))
        .toBeFalse();
    }
    const shifted = parse('Shift+a');
    expect(matchesBinding(shifted, event({ key: 'A', shiftKey: true }))).toBeTrue();
    expect(matchesBinding(shifted, event({ key: 'a' }))).toBeFalse();
    // A tolerated modifier passes in either state, which is how holding multiselection still selects.
    expect(matchesBinding(zero, event({ key: '0', metaKey: true }), { ignoreModifiers: ['meta'] })).toBeTrue();
    expect(matchesBinding(zero, event({ key: '0' }), { ignoreModifiers: ['meta'] })).toBeTrue();
  });

  it('compares a code binding against the physical key and a key binding against the character', () => {
    expect(matchesBinding(parse('code:NumpadAdd'), event({ key: '+', code: 'NumpadAdd' }))).toBeTrue();
    // The same character reached from two layout positions, and the same position giving another character.
    expect(matchesBinding(parse('+'), event({ key: '+', code: 'BracketRight' }))).toBeTrue();
    expect(matchesBinding(parse('+'), event({ key: '+', code: 'Equal', shiftKey: true }))).toBeTrue();
    expect(matchesBinding(parse('='), event({ key: '+', code: 'Equal', shiftKey: true }))).toBeFalse();
    expect(matchesBinding(parse('code:Equal'), event({ key: '+', code: 'Equal' }))).toBeTrue();
  });
});
