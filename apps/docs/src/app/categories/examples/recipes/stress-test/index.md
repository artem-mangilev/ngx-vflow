This graph contains 2000 small component nodes and 1999 edges. Each node renders an HTML card with two handles; node and handle geometry is measured from the DOM. By default, all of them remain mounted so you can evaluate rendering and interaction costs on your device.

This demo renders all nodes and edges with virtualization disabled. Viewport culling has its own overhead and may not improve performance for every graph. Use the dedicated [virtualization demo](/docs/performance/virtualization) to explore that option. Performance depends on the number and complexity of visible elements, the browser, and whether Angular runs in development or production mode.

On an M1 Pro in a production build, a flow of 1000 such nodes, all in view, pans, zooms and drags at 120 frames per
second and more; 2000 keep 60 frames per second; from 3000 on, zooming drops frames. Most of the cost is the browser
painting every visible node again on each zoom step, so simpler nodes go further.

{{ NgDocActions.demoPane("StressTestDemoComponent") }}
