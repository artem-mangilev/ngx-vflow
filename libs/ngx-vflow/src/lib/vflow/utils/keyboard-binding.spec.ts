import { matchesBinding, matchesBindingKey, parseBinding } from './keyboard-binding';

function event(init: KeyboardEventInit) {
  return new KeyboardEvent('keydown', init);
}

function parse(binding: string) {
  return parseBinding(binding)!;
}

describe('parseBinding', () => {
  it.each([
    ['a plain key', 'Enter', { key: 'enter', source: 'Enter', modifiers: [], mod: false }],
    ['the space character', ' ', { key: ' ', source: ' ', modifiers: [], mod: false }],
    ['the space alias', 'Space', { key: 'space', source: 'Space', modifiers: [], mod: false }],
    ['modifiers in any case', 'MOD+shift+A', { key: 'a', source: 'A', modifiers: ['shift'], mod: true }],
    ['the plus key', '+', { key: '+', source: '+', modifiers: [], mod: false }],
    ['a modifier before the plus key', 'Shift++', { key: '+', source: '+', modifiers: ['shift'], mod: false }],
    ['a physical code', 'Mod+KeyS', { key: 'keys', source: 'KeyS', modifiers: [], mod: true }],
  ])('reads %s', (_, binding, parsed) => {
    expect(parseBinding(binding)).toEqual(parsed);
  });

  it.each(['', '   ', 'a+b', '+a', 'Shift+', 'Ctrl+s', 'Shift++a'])('rejects "%s"', (binding) => {
    expect(parseBinding(binding)).toBeNull();
  });
});

describe('matchesBinding', () => {
  describe('the Mod modifier', () => {
    const command = parse('Mod+s');

    it('is Meta on macOS', () => {
      expect(matchesBinding(command, event({ key: 's', metaKey: true }), { mac: true })).toBe(true);
    });

    it('is not Control on macOS', () => {
      expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: true })).toBe(false);
    });

    it('is Control elsewhere', () => {
      expect(matchesBinding(command, event({ key: 's', ctrlKey: true }), { mac: false })).toBe(true);
    });

    it('must be held', () => {
      expect(matchesBinding(command, event({ key: 's' }), { mac: false })).toBe(false);
    });
  });

  describe('modifier keys as bindings', () => {
    it.each([
      ['Meta on macOS', 'Mod', event({ key: 'Meta', metaKey: true }), true, true],
      ['not Meta elsewhere', 'Mod', event({ key: 'Meta', metaKey: true }), false, false],
      ['Control elsewhere', 'Mod', event({ key: 'Control', ctrlKey: true }), false, true],
      ['a physical modifier code', 'MetaRight', event({ key: 'Meta', code: 'MetaRight' }), undefined, true],
    ])('name the held key itself: %s', (_, binding, pressed, mac, expected) => {
      expect(matchesBindingKey(parse(binding), pressed, mac)).toBe(expected);
    });
  });

  describe('modifiers', () => {
    const zero = parse('0');

    it('leave Shift free unless the binding names it', () => {
      expect(matchesBinding(zero, event({ key: '0' }))).toBe(true);
      expect(matchesBinding(zero, event({ key: '0', shiftKey: true }))).toBe(true);
    });

    it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])('reject an unnamed %o', (init) => {
      expect(matchesBinding(zero, event({ key: '0', ...init }))).toBe(false);
    });

    it('must include Shift when the binding names it', () => {
      const shifted = parse('Shift+a');

      expect(matchesBinding(shifted, event({ key: 'A', shiftKey: true }))).toBe(true);
      expect(matchesBinding(shifted, event({ key: 'a' }))).toBe(false);
    });

    it.each([true, false])('may be ignored whether held or not (held: %s)', (held) => {
      expect(matchesBinding(zero, event({ key: '0', metaKey: held }), { ignoreModifiers: ['meta'] })).toBe(true);
    });
  });

  describe('keys', () => {
    it.each([
      ['the character from one layout position', '+', { key: '+', code: 'BracketRight' }, true],
      ['the character from another position', '+', { key: '+', code: 'Equal', shiftKey: true }, true],
      ['a position that gives another character', '=', { key: '+', code: 'Equal', shiftKey: true }, false],
      ['a keypad code', 'NumpadAdd', { key: '+', code: 'NumpadAdd' }, true],
      ['a keypad code with another character', 'Numpad0', { key: 'Insert', code: 'Numpad0' }, true],
      ['a physical code for any character', 'Equal', { key: '+', code: 'Equal', shiftKey: true }, true],
      ['the space alias', 'Space', { key: ' ', code: 'Space' }, true],
      ['the space character', ' ', { key: ' ', code: 'Space' }, true],
    ])('match %s', (_, binding, init, expected) => {
      expect(matchesBinding(parse(binding), event(init))).toBe(expected);
    });
  });
});
