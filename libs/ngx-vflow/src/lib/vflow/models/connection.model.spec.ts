import { ConnectionEndpoint } from '../interfaces/connection-events.interface';
import { ConnectionForValidation } from '../interfaces/connection-settings.interface';
import { createNode } from '../interfaces/node.interface';
import { HandleType } from '../types/handle-type.type';
import { ConnectionModel } from './connection.model';

describe('ConnectionModel', () => {
  const a = createNode({ id: 'a', point: { x: 0, y: 0 } });
  const b = createNode({ id: 'b', point: { x: 0, y: 0 } });

  const end = (node = a, type: HandleType = 'source'): ConnectionEndpoint => ({
    node,
    handle: { type, position: 'right' },
  });

  const connection = (source = end(a, 'source'), target = end(b, 'target')): ConnectionForValidation => ({
    source,
    target,
  });

  it('defaults to a bezier curve without self connections', () => {
    const model = new ConnectionModel({});

    expect(model.curve).toBe('bezier');
    expect(model.validator(connection())).toBe(true);
    expect(model.validator(connection(end(a, 'source'), end(a, 'target')))).toBe(false);
  });

  it('accepts a self connection only when allowed', () => {
    const { validator } = new ConnectionModel({ allowSelfConnections: true });

    expect(validator(connection(end(a, 'source'), end(a, 'target')))).toBe(true);
  });

  it('rejects two handles of the same role and accepts any role against an any handle', () => {
    const { validator } = new ConnectionModel({});

    expect(validator(connection(end(a, 'source'), end(b, 'source')))).toBe(false);
    expect(validator(connection(end(a, 'target'), end(b, 'target')))).toBe(false);
    expect(validator(connection(end(a, 'any'), end(b, 'source')))).toBe(true);
    expect(validator(connection(end(a, 'any'), end(b, 'any')))).toBe(true);
  });

  it('asks the application validator only about connections the built-in rules accept', () => {
    const validator = vi.fn(() => false);
    const model = new ConnectionModel({ validator });

    expect(model.validator(connection(end(a, 'source'), end(a, 'target')))).toBe(false);
    expect(model.validator(connection(end(a, 'source'), end(b, 'source')))).toBe(false);
    expect(validator).not.toHaveBeenCalled();

    const accepted = connection();
    expect(model.validator(accepted)).toBe(false);
    expect(validator).toHaveBeenCalledExactlyOnceWith(accepted);
  });
});
