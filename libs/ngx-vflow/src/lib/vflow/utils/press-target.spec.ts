import { isNodeDragPress, isPanPress, pressTarget } from './press-target';

describe('press target table', () => {
  function tree(html: string) {
    const root = document.createElement('div');
    root.innerHTML = html;
    return (selector: string) => root.querySelector(selector)!;
  }

  it('lets the nearest library element decide', () => {
    const find = tree(`
      <div data-v-node>
        <div data-v-handle-type="source" id="handle">
          <span id="in-handle"></span><div data-v-drag-handle id="drag"><b id="drag-in-handle"></b></div>
        </div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-no-pan><i id="no-pan"></i></div>
      </div>
      <svg><circle data-v-reconnect-handle id="reconnect"></circle><path id="edge"></path></svg>`);

    expect(pressTarget(find('#in-handle')).connection).toBe(find('#handle'));
    expect(pressTarget(find('#drag-in-handle')).connection).toBeNull();
    expect(pressTarget(find('#drag-in-handle')).dragHandle).toBe(find('#drag'));
    expect(pressTarget(find('#reconnect')).connection).toBe(find('#reconnect'));
    expect(pressTarget(find('#control')).control).toBe(true);
    expect(pressTarget(find('#no-pan')).noPan).toBe(true);
    expect(pressTarget(null).control).toBe(false);
  });

  it('pans from the canvas, edges and node bodies, not from handles, controls and no-pan parts', () => {
    const find = tree(`
      <i id="canvas"></i>
      <svg><path id="edge"></path><circle data-v-reconnect-handle id="reconnect"></circle></svg>
      <div data-v-node id="node">
        <i id="body"></i>
        <div data-v-no-pan><i id="no-pan"></i></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-drag-handle><i id="title"></i></div>
      </div>`);
    const pan = (selector: string) => isPanPress(pressTarget(find(selector)));

    expect(pan('#canvas')).toBe(true);
    expect(pan('#edge')).toBe(true);
    expect(pan('#reconnect')).toBe(false);
    // A press on a node body reaches the pane only when the node declined to drag.
    expect(pan('#body')).toBe(true);
    expect(pan('#no-pan')).toBe(false);
    expect(pan('#control')).toBe(false);
    expect(pan('#title')).toBe(true);
  });

  it('drags a node from its body, or only from drag handles when it has them', () => {
    const find = tree(`
      <div data-v-node>
        <i id="body"></i>
        <div data-v-drag-handle><i id="title"></i></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-handle-type="source"><i id="port"></i></div>
        <div data-v-no-pan><i id="no-pan"></i></div>
      </div>`);
    const drag = (selector: string, handles = false) => isNodeDragPress(pressTarget(find(selector)), handles);

    expect(drag('#body')).toBe(true);
    expect(drag('#no-pan')).toBe(true);
    expect(drag('#body', true)).toBe(false);
    expect(drag('#title', true)).toBe(true);
    expect(drag('#control')).toBe(false);
    expect(drag('#port')).toBe(false);
  });
});
