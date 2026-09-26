// Injected into the docs page. Exposes __prof (JS self-profiling aggregation) and __perf (scenarios).
window.__prof = (() => {
  const key = (frames, resources, f) =>
    (f.name || '(anon)') +
    ' @ ' +
    (resources[f.resourceId] || '').split('/').pop().split('?')[0] +
    ':' +
    (f.line ?? '');
  function aggregate(trace) {
    const { frames, stacks, samples, resources } = trace;
    const k = (f) => key(frames, resources, f);
    const self = new Map(),
      incl = new Map();
    let total = 0,
      idle = 0;
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].timestamp - samples[i - 1].timestamp;
      total += dt;
      const sid = samples[i].stackId;
      if (sid === undefined) {
        idle += dt;
        continue;
      }
      let s = stacks[sid];
      const lk = k(frames[s.frameId]);
      self.set(lk, (self.get(lk) || 0) + dt);
      const seen = new Set();
      while (s) {
        const kk = k(frames[s.frameId]);
        if (!seen.has(kk)) {
          seen.add(kk);
          incl.set(kk, (incl.get(kk) || 0) + dt);
        }
        s = s.parentId !== undefined ? stacks[s.parentId] : null;
      }
    }
    const top = (m, n) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([kk, v]) => [Math.round(v), kk]);
    return { totalMs: Math.round(total), idleMs: Math.round(idle), self: top(self, 22), incl: top(incl, 30) };
  }
  const SKIP =
    /producerAccessed|isValidLink|signalGetFn|computed2|producerUpdateValueVersion|producerRecomputeValue|consumerPollProducersForChange|consumerBeforeComputation|consumerAfterComputation|runEffect|\(anon\)|__spread|consumerMarkDirty|producerNotifyConsumers|forEach|Array\.|Set\.|Map\.|detectChangesIn|refreshView|executeTemplate|synchronize|tickImpl|_tick|^tick|^run:|^execute:|runOutsideAngular|maybeTrace|phaseFn|invoke|onInvoke|runTask|invokeTask|drainMicroTaskQueue|onInvokeTask|ZoneDelegate|runGuarded|checkStable|onLeave|onEnter|onHasTask|scheduleTask|onScheduleTask|Promise/;
  function paths(trace, leafMatch, depth = 10, n = 8) {
    const { frames, stacks, samples } = trace;
    const k = (f) => (f.name || '(anon)') + ':' + (f.line ?? '');
    const acc = new Map();
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].timestamp - samples[i - 1].timestamp;
      const sid = samples[i].stackId;
      if (sid === undefined) continue;
      let s = stacks[sid];
      if (leafMatch && !k(frames[s.frameId]).includes(leafMatch)) continue;
      const parts = [];
      while (s && parts.length < depth) {
        const kk = k(frames[s.frameId]);
        if (!SKIP.test(kk)) parts.push(kk);
        s = s.parentId !== undefined ? stacks[s.parentId] : null;
      }
      const kk = parts.reverse().join(' > ');
      acc.set(kk, (acc.get(kk) || 0) + dt);
    }
    return [...acc.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([kk, v]) => [Math.round(v), kk]);
  }
  async function run(fn) {
    const hasProfiler = typeof Profiler !== 'undefined';
    const profiler = hasProfiler ? new Profiler({ sampleInterval: 1, maxBufferSize: 800000 }) : null;
    const t0 = performance.now();
    const result = await fn();
    const wall = performance.now() - t0;
    const trace = profiler ? await profiler.stop() : null;
    window.__prof.last = trace;
    return { wallMs: Math.round(wall), result, ...(trace ? aggregate(trace) : {}) };
  }
  return { aggregate, paths, run };
})();

window.__perf = (() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const loaf = [];
  let obs = null;
  function loafStart() {
    loaf.length = 0;
    obs = new PerformanceObserver((l) => loaf.push(...l.getEntries()));
    obs.observe({ type: 'long-animation-frame', buffered: false });
  }
  function loafStop() {
    obs && obs.disconnect();
    obs = null;
    const total = loaf.reduce((s, e) => s + e.duration, 0);
    const sl = loaf.reduce(
      (s, e) => s + (e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0),
      0,
    );
    return {
      longFrames: loaf.length,
      totalLongMs: Math.round(total),
      maxFrameMs: Math.round(Math.max(0, ...loaf.map((e) => e.duration))),
      styleAndLayoutMs: Math.round(sl),
    };
  }
  // DOM read counters (forced layout indicators)
  const reads = { gbcr: 0, getClientRects: 0, offset: 0 };
  const gbcr = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    reads.gbcr++;
    return gbcr.call(this);
  };
  const gcr = Element.prototype.getClientRects;
  Element.prototype.getClientRects = function () {
    reads.getClientRects++;
    return gcr.call(this);
  };
  for (const p of ['offsetWidth', 'offsetHeight', 'offsetParent']) {
    const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, p);
    Object.defineProperty(HTMLElement.prototype, p, {
      get() {
        reads.offset++;
        return d.get.call(this);
      },
      configurable: true,
    });
  }
  function readsSnapshot() {
    return { ...reads };
  }
  function readsDelta(a) {
    const b = readsSnapshot();
    return { gbcr: b.gbcr - a.gbcr, getClientRects: b.getClientRects - a.getClientRects, offset: b.offset - a.offset };
  }

  function pane() {
    return document.querySelector('.vflow-pane');
  }
  function pe(type, target, x, y, extra = {}) {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        ...extra,
      }),
    );
  }
  async function frames(ms) {
    const t = [];
    let last = performance.now();
    const end = last + ms;
    await new Promise((res) => {
      function f() {
        const n = performance.now();
        t.push(n - last);
        last = n;
        if (n < end) requestAnimationFrame(f);
        else res();
      }
      requestAnimationFrame(f);
    });
    t.shift();
    t.sort((a, b) => a - b);
    return {
      frames: t.length,
      p50: Math.round(t[Math.floor(t.length * 0.5)] || 0),
      p90: Math.round(t[Math.floor(t.length * 0.9)] || 0),
      max: Math.round(t[t.length - 1] || 0),
    };
  }
  async function scenario(label, run, tailMs = 200) {
    const r0 = readsSnapshot();
    loafStart();
    const fp = frames(run.duration + tailMs);
    await run.go();
    const fr = await fp;
    await sleep(tailMs);
    const lf = loafStop();
    return { label, ...fr, loaf: lf, domReads: readsDelta(r0) };
  }
  function pan(steps = 60, dx = 8, dy = 6, interval = 16) {
    return scenario('pan', {
      duration: steps * interval,
      go: async () => {
        const p = pane();
        const r = p.getBoundingClientRect();
        let x = r.left + r.width / 2,
          y = r.top + r.height / 2;
        pe('pointerdown', p, x, y);
        for (let i = 0; i < steps; i++) {
          x += dx;
          y += dy;
          pe('pointermove', window, x, y);
          await sleep(interval);
        }
        pe('pointerup', window, x, y);
      },
    });
  }
  function zoom(steps = 40, deltaY = -40, interval = 16) {
    return scenario(
      'zoom',
      {
        duration: steps * interval,
        go: async () => {
          const p = pane();
          const r = p.getBoundingClientRect();
          const x = r.left + r.width / 2,
            y = r.top + r.height / 2;
          for (let i = 0; i < steps; i++) {
            p.dispatchEvent(
              new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                deltaY,
                deltaMode: 0,
              }),
            );
            await sleep(interval);
          }
        },
      },
      400,
    );
  }
  function drag(steps = 40, dx = 5, dy = 3, interval = 16) {
    return scenario('drag', {
      duration: steps * interval,
      go: async () => {
        const pr = pane().getBoundingClientRect();
        const node = [...document.querySelectorAll('.vflow-node')].find((n) => {
          if (n.style.display === 'none') return false;
          const b = n.getBoundingClientRect();
          return (
            b.width > 0 &&
            b.left > pr.left + 10 &&
            b.top > pr.top + 10 &&
            b.right < pr.right - 10 &&
            b.bottom < pr.bottom - 10
          );
        });
        const r = node.getBoundingClientRect();
        let x = r.left + r.width / 2,
          y = r.top + r.height / 2;
        pe('pointerdown', node, x, y);
        for (let i = 0; i < steps; i++) {
          x += dx;
          y += dy;
          pe('pointermove', window, x, y);
          await sleep(interval);
        }
        pe('pointerup', window, x, y);
      },
    });
  }
  function idle(ms = 500) {
    return scenario('idle', { duration: ms, go: () => sleep(ms) }, 0);
  }
  function viewport() {
    const v = document.querySelector('.vflow-viewport');
    return v && v.style.transform;
  }
  function counts() {
    const ns = [...document.querySelectorAll('.vflow-node')];
    return {
      nodes: ns.length,
      edges: document.querySelectorAll('svg[edge]').length,
      dom: document.querySelectorAll('*').length,
      visibleNodes: ns.filter((n) => n.style.display !== 'none').length,
      hiddenVisibility: ns.filter((n) => n.style.display !== 'none' && n.style.visibility === 'hidden').length,
    };
  }
  async function gotoAndWait(path, expected = 4900, cap = 60000) {
    const r0 = readsSnapshot();
    loafStart();
    history.pushState(null, '', path);
    dispatchEvent(new PopStateEvent('popstate'));
    const t0 = performance.now();
    let firstNode = 0,
      allNodes = 0;
    let stable = 0;
    while (performance.now() - t0 < cap) {
      await sleep(25);
      const n = document.querySelectorAll('.vflow-node').length;
      if (n && !firstNode) firstNode = performance.now() - t0;
      if (n >= expected) {
        allNodes = allNodes || performance.now() - t0;
        stable = counts().hiddenVisibility === 0 ? stable + 1 : 0;
        if (stable >= 20) break;
      }
    }
    return {
      firstNodeMs: Math.round(firstNode),
      allNodesMs: Math.round(allNodes),
      readyMs: Math.round(performance.now() - t0),
      ...counts(),
      loaf: loafStop(),
      domReads: readsDelta(r0),
    };
  }
  return { pan, zoom, drag, idle, viewport, counts, gotoAndWait, sleep, pe, pane, readsSnapshot, readsDelta };
})();
