import { isNodeDragPress, isPanPress, pressTarget } from './press-target';

describe('press target table', () => {
  function tree(html: string) {
    const root = document.createElement('div');
    root.innerHTML = html;
    return (selector: string) => root.querySelector(selector)!;
  }

  it('lets the nearest library element decide', () => {
    const find = tree(`
      <div class="vflow-node">
        <div class="vflow-handle"><span id="in-handle"></span><div class="vflow-drag-handle"><b id="drag-in-handle"></b></div></div>
        <div data-vflow-no-drag><i id="control"></i></div>
        <div data-vflow-no-pan><i id="no-pan"></i></div>
        <em id="body"></em>
      </div>
      <svg><circle class="reconnect-handle" id="reconnect"></circle><path id="edge"></path></svg>`);

    expect(pressTarget(find('#in-handle')).connection).toBe(find('.vflow-handle'));
    expect(pressTarget(find('#drag-in-handle')).connection).toBeNull();
    expect(pressTarget(find('#drag-in-handle')).dragHandle).toBe(find('.vflow-drag-handle'));
    expect(pressTarget(find('#reconnect')).connection).toBe(find('#reconnect'));
    expect(pressTarget(find('#control')).control).toBeTrue();
    expect(pressTarget(find('#no-pan')).noPan).toBeTrue();
    expect(pressTarget(find('#body')).node).toBe(find('.vflow-node'));
    expect(pressTarget(null).node).toBeNull();
  });

  it('pans from the canvas, edges, undraggable nodes and bodies outside drag handles only', () => {
    const find = tree(`
      <i id="canvas"></i>
      <svg><path id="edge"></path><circle class="reconnect-handle" id="reconnect"></circle></svg>
      <div class="vflow-node" id="draggable"><i id="draggable-body"></i><div data-vflow-no-pan><i id="no-pan"></i></div></div>
      <div class="vflow-node vflow-node--undraggable"><i id="undraggable-body"></i></div>
      <div class="vflow-node vflow-node--drag-handles-only"><i id="handles-body"></i><div class="vflow-drag-handle"><i id="title"></i></div></div>`);
    const pan = (selector: string) => isPanPress(pressTarget(find(selector)));

    expect(pan('#canvas')).toBeTrue();
    expect(pan('#edge')).toBeTrue();
    expect(pan('#reconnect')).toBeFalse();
    expect(pan('#draggable-body')).toBeFalse();
    expect(pan('#no-pan')).toBeFalse();
    expect(pan('#undraggable-body')).toBeTrue();
    expect(pan('#handles-body')).toBeTrue();
    expect(pan('#title')).toBeFalse();
  });

  it('drags a node from its body, or only from drag handles when it has them', () => {
    const find = tree(`
      <div class="vflow-node">
        <i id="body"></i>
        <div class="vflow-drag-handle"><i id="title"></i></div>
        <div data-vflow-no-drag><i id="control"></i></div>
        <div class="vflow-handle"><i id="port"></i></div>
        <div data-vflow-no-pan><i id="no-pan"></i></div>
      </div>`);
    const drag = (selector: string, handles = false) => isNodeDragPress(pressTarget(find(selector)), handles);

    expect(drag('#body')).toBeTrue();
    expect(drag('#no-pan')).toBeTrue();
    expect(drag('#body', true)).toBeFalse();
    expect(drag('#title', true)).toBeTrue();
    expect(drag('#control')).toBeFalse();
    expect(drag('#port')).toBeFalse();
  });
});
