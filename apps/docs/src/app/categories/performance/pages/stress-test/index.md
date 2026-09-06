This graph contains 1024 small custom component nodes and 1023 edges. Each node renders an HTML card with two handles; node and handle geometry is measured from the DOM. By default, all of them remain mounted so you can evaluate rendering and interaction costs on your device.

This demo renders all nodes and edges with virtualization disabled. Viewport culling has its own overhead and may not improve performance for every graph. Use the dedicated [virtualization demo](/performance/virtualization) to explore that option. Performance depends on the number and complexity of visible elements, the browser, and whether Angular runs in development or production mode.

{{ NgDocActions.demoPane("StressTestDemoComponent") }}
