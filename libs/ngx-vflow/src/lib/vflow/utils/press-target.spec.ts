import { isNodeDragPress, isPanPress, pressTarget } from './press-target';

describe('press target table', () => {
  function tree(html: string) {
    const root = document.createElement('div');
    root.innerHTML = html;
    return (selector: string) => root.querySelector(selector)!;
  }

  it('lets the nearest library element decide', () => {
    const find = tree(`
      <div class="v-node">
        <div class="v-handle"><span id="in-handle"></span><div class="v-drag-handle"><b id="drag-in-handle"></b></div></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div data-v-no-pan><i id="no-pan"></i></div>
        <em id="body"></em>
      </div>
      <svg><circle class="v-reconnect-handle" id="reconnect"></circle><path id="edge"></path></svg>`);

    expect(pressTarget(find('#in-handle')).connection).toBe(find('.v-handle'));
    expect(pressTarget(find('#drag-in-handle')).connection).toBeNull();
    expect(pressTarget(find('#drag-in-handle')).dragHandle).toBe(find('.v-drag-handle'));
    expect(pressTarget(find('#reconnect')).connection).toBe(find('#reconnect'));
    expect(pressTarget(find('#control')).control).toBe(true);
    expect(pressTarget(find('#no-pan')).noPan).toBe(true);
    expect(pressTarget(find('#body')).node).toBe(find('.v-node'));
    expect(pressTarget(null).node).toBeNull();
  });

  it('pans from the canvas, edges, undraggable nodes and bodies outside drag handles only', () => {
    const find = tree(`
      <i id="canvas"></i>
      <svg><path id="edge"></path><circle class="v-reconnect-handle" id="reconnect"></circle></svg>
      <div class="v-node" id="draggable"><i id="draggable-body"></i><div data-v-no-pan><i id="no-pan"></i></div></div>
      <div class="v-node v-node--undraggable"><i id="undraggable-body"></i></div>
      <div class="v-node v-node--drag-handles-only"><i id="handles-body"></i><div class="v-drag-handle"><i id="title"></i></div></div>`);
    const pan = (selector: string) => isPanPress(pressTarget(find(selector)));

    expect(pan('#canvas')).toBe(true);
    expect(pan('#edge')).toBe(true);
    expect(pan('#reconnect')).toBe(false);
    expect(pan('#draggable-body')).toBe(false);
    expect(pan('#no-pan')).toBe(false);
    expect(pan('#undraggable-body')).toBe(true);
    expect(pan('#handles-body')).toBe(true);
    expect(pan('#title')).toBe(false);
  });

  it('drags a node from its body, or only from drag handles when it has them', () => {
    const find = tree(`
      <div class="v-node">
        <i id="body"></i>
        <div class="v-drag-handle"><i id="title"></i></div>
        <div data-v-no-drag><i id="control"></i></div>
        <div class="v-handle"><i id="port"></i></div>
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
