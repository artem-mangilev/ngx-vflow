import { isNodeDragPress, isPanPress, pressTarget } from './press-target';

describe('press target table', () => {
  function tree(html: string) {
    const root = document.createElement('div');
    root.innerHTML = html;
    return (selector: string) => root.querySelector(selector)!;
  }

  describe('pressTarget', () => {
    const find = tree(`
      <div data-v-node>
        <div data-v-handle-type="source" data-v-handle-can-start id="handle">
          <span id="in-handle"></span><div data-v-drag-handle id="drag"><b id="drag-in-handle"></b></div>
        </div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-no-pan><i id="no-pan"></i></div>
      </div>
      <svg><circle data-v-reconnect-handle id="reconnect"></circle><path id="edge"></path></svg>`);

    it('names the handle that can start a connection around the target', () => {
      expect(pressTarget(find('#in-handle')).connection).toBe(find('#handle'));
    });

    it('lets the nearest library element decide: a drag handle inside a handle is a drag handle', () => {
      expect(pressTarget(find('#drag-in-handle')).connection).toBeNull();
      expect(pressTarget(find('#drag-in-handle')).dragHandle).toBe(find('#drag'));
    });

    it('names a reconnect handle as the connection', () => {
      expect(pressTarget(find('#reconnect')).connection).toBe(find('#reconnect'));
    });

    it('marks a target inside a no-drag part as a control', () => {
      expect(pressTarget(find('#control')).control).toBe(true);
    });

    it('marks a target inside a no-pan part', () => {
      expect(pressTarget(find('#no-pan')).noPan).toBe(true);
    });

    it('is empty for no target', () => {
      expect(pressTarget(null).control).toBe(false);
    });
  });

  describe('a handle that cannot start a connection', () => {
    const find = tree(`
      <div data-v-node data-v-handle-type="any" id="ball">
        <i id="label"></i>
        <div data-v-handle-type="source" data-v-handle-can-start id="port"></div>
        <div data-v-drag-handle id="grip"></div>
      </div>`);

    it('leaves the press to the node, like the node body', () => {
      expect(pressTarget(find('#label')).connection).toBeNull();
      expect(isNodeDragPress(pressTarget(find('#label')), false)).toBe(true);
      expect(isPanPress(pressTarget(find('#label')))).toBe(true);
    });

    it('keeps the press of a port inside it that can start', () => {
      expect(pressTarget(find('#port')).connection).toBe(find('#port'));
    });

    it('keeps the press of a drag handle inside it', () => {
      expect(pressTarget(find('#grip')).dragHandle).toBe(find('#grip'));
    });
  });

  describe('isPanPress', () => {
    const find = tree(`
      <i id="canvas"></i>
      <svg><path id="edge"></path><circle data-v-reconnect-handle id="reconnect"></circle></svg>
      <div data-v-node id="node">
        <i id="body"></i>
        <div data-v-no-pan><i id="no-pan"></i></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-drag-handle><i id="title"></i></div>
      </div>`);

    it.each([
      ['the canvas', '#canvas', true],
      ['an edge', '#edge', true],
      ['a node body, which the pane gets when the node declined to drag', '#body', true],
      ['a drag handle', '#title', true],
      ['a reconnect handle', '#reconnect', false],
      ['a no-pan part', '#no-pan', false],
      ['a control', '#control', false],
    ])('is %s: %s', (_, selector, pans) => {
      expect(isPanPress(pressTarget(find(selector)))).toBe(pans);
    });
  });

  describe('isNodeDragPress', () => {
    const find = tree(`
      <div data-v-node>
        <i id="body"></i>
        <div data-v-drag-handle><i id="title"></i></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-handle-type="source" data-v-handle-can-start><i id="port"></i></div>
        <div data-v-no-pan><i id="no-pan"></i></div>
      </div>`);

    it.each<[string, string, boolean, boolean]>([
      ['the body of a node without drag handles', '#body', false, true],
      ['a no-pan part', '#no-pan', false, true],
      ['a control', '#control', false, false],
      ['a handle that can start a connection', '#port', false, false],
      ['the body of a node that has drag handles', '#body', true, false],
      ['a drag handle of a node that has them', '#title', true, true],
    ])('on %s drags: %s', (_, selector, hasDragHandles, drags) => {
      expect(isNodeDragPress(pressTarget(find(selector)), hasDragHandles)).toBe(drags);
    });
  });
});
