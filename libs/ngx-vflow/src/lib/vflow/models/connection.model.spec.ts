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

  it('defaults to a bezier curve', () => {
    expect(new ConnectionModel({}).curve).toBe('bezier');
  });

  it('accepts a connection between two nodes by default', () => {
    expect(new ConnectionModel({}).validator(connection())).toBe(true);
  });

  it('rejects a self connection by default', () => {
    expect(new ConnectionModel({}).validator(connection(end(a, 'source'), end(a, 'target')))).toBe(false);
  });

  it('accepts a self connection only when allowed', () => {
    const { validator } = new ConnectionModel({ allowSelfConnections: true });

    expect(validator(connection(end(a, 'source'), end(a, 'target')))).toBe(true);
  });

  it.each<[HandleType, HandleType, boolean]>([
    ['source', 'source', false],
    ['target', 'target', false],
    ['any', 'source', true],
    ['any', 'any', true],
  ])('decides a connection from a %s handle to a %s handle: %s', (from, to, accepted) => {
    const { validator } = new ConnectionModel({});

    expect(validator(connection(end(a, from), end(b, to)))).toBe(accepted);
  });

  it.each([
    ['a self connection', () => connection(end(a, 'source'), end(a, 'target'))],
    ['two handles of one role', () => connection(end(a, 'source'), end(b, 'source'))],
  ])('does not ask the application validator about %s', (_, rejected) => {
    const validator = vi.fn(() => true);
    const model = new ConnectionModel({ validator });

    expect(model.validator(rejected())).toBe(false);
    expect(validator).not.toHaveBeenCalled();
  });

  it('asks the application validator about a connection the built-in rules accept', () => {
    const validator = vi.fn(() => false);
    const model = new ConnectionModel({ validator });
    const accepted = connection();

    expect(model.validator(accepted)).toBe(false);
    expect(validator).toHaveBeenCalledExactlyOnceWith(accepted);
  });
});
