This graph contains 1024 small custom component nodes and 1023 edges. Each node renders an HTML card with two handles; node and handle geometry is measured from the DOM. By default, all of them remain mounted so you can evaluate rendering and interaction costs on your device.

Enable virtualization to compare the same graph with offscreen entities hidden using CSS. All components stay mounted, preserving their state; nodes and edges retain their full appearance at every zoom. Performance depends on the number and complexity of visible elements, the browser, and whether Angular runs in development or production mode.

{{ NgDocActions.demoPane("StressTestDemoComponent") }}
