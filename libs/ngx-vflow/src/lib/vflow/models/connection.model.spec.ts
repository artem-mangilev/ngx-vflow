import { ConnectionForValidation } from '../interfaces/connection-settings.interface';
import { ConnectionModel } from './connection.model';

describe('ConnectionModel', () => {
  const connection = (overrides: Partial<ConnectionForValidation> = {}): ConnectionForValidation => ({
    source: 'a',
    target: 'b',
    sourceHandleType: 'source',
    targetHandleType: 'target',
    ...overrides,
  });

  it('defaults to a bezier curve without self connections', () => {
    const model = new ConnectionModel({});

    expect(model.curve).toBe('bezier');
    expect(model.validator(connection())).toBe(true);
    expect(model.validator(connection({ target: 'a' }))).toBe(false);
  });

  it('accepts a self connection only when allowed', () => {
    expect(new ConnectionModel({ allowSelfConnections: true }).validator(connection({ target: 'a' }))).toBe(true);
  });

  it('rejects two handles of the same role and accepts any role against an any handle', () => {
    const { validator } = new ConnectionModel({});

    expect(validator(connection({ targetHandleType: 'source' }))).toBe(false);
    expect(validator(connection({ sourceHandleType: 'target' }))).toBe(false);
    expect(validator(connection({ sourceHandleType: 'any', targetHandleType: 'source' }))).toBe(true);
    expect(validator(connection({ sourceHandleType: 'any', targetHandleType: 'any' }))).toBe(true);
  });

  it('asks the application validator only about connections the built-in rules accept', () => {
    const validator = vi.fn(() => false);
    const model = new ConnectionModel({ validator });

    expect(model.validator(connection({ target: 'a' }))).toBe(false);
    expect(model.validator(connection({ targetHandleType: 'source' }))).toBe(false);
    expect(validator).not.toHaveBeenCalled();

    expect(model.validator(connection())).toBe(false);
    expect(validator).toHaveBeenCalledExactlyOnceWith(connection());
  });
});
