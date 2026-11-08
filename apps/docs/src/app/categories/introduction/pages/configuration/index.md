---
keyword: 'Configuration'
---

Every setting of `vflow` is an input, and binding inputs is all a single flow needs. An application with several
flows, or with labels that come from a translation service, configures them once through dependency injection:
`provideVflow()` takes features, each a `with*()` call, and goes into the providers of `bootstrapApplication`, of a
route, or of the component that hosts a flow.

```typescript
import { provideVflow, withAccessibility, withNodeComponents, withSettings } from 'ngx-vflow';

const settings = withSettings({ minZoom: 0.2, maxZoom: 4, zoomOnDoubleClick: true });
const labels = withAccessibility({ flowLabel: 'Approval graph' });
const components = withNodeComponents({
  task: TaskNode,
  decision: () => import('./decision-node').then((m) => m.DecisionNode),
});

bootstrapApplication(AppComponent, {
  providers: [provideVflow(settings, labels, components)],
});
```

## Where a value comes from

A setting is resolved per flow, from the closest source:

1. The input bound on the `vflow` element.
2. The nearest `provideVflow()` up the injector tree that gives the key.
3. The default of the library, exported as `VFLOW_SETTINGS_DEFAULTS`.

An input that is not bound does not take part, so `[minZoom]="zoom()"` overrides the providers only while `zoom()`
is not `undefined`. An object setting such as `optimization` merges its keys through the three layers.

Two `provideVflow()` calls on the path to a flow do not replace each other: every feature provides its own token, and
a feature closer to the flow lays its keys over the same feature further up. A route can therefore set the zoom range
for all of its pages and one component can still turn off double-click zoom for its flow:

{{ NgDocActions.demoPane("ConfigurationDemoComponent") }}

The inputs hold only what is bound. To read the settings in effect for a flow, use `flow.settings`, one signal per
setting: `flow.settings.minZoom()`.

## Features

### `withSettings(settings)`

Takes a `Partial<VflowSettings>`: the inputs of `vflow` by their names, `nodes` and `edges` excepted. Instead of an
object, pass a factory run in the injector that returns the settings or a signal of them, so the settings can come
from a service and follow its changes:

```typescript
provideVflow(withSettings(() => inject(Preferences).flowSettings));
```

### `withAccessibility(labels)`

Takes a `Partial<AriaLabelConfig>` with the names, descriptions and announcements of the graph; omitted keys keep
their English defaults. A factory works as for `withSettings()`, so the labels can follow the language of the
application. See [Accessibility](../../interactions/accessibility) for the keys.

### `withNodeComponents(components)` and `withEdgeComponents(components)`

Register component classes, or `() => import(...)` factories, under keys. A node or edge then names its component as
`component: 'task'`, so the code that builds the graph imports no component classes and the graph serializes as
data. A key that no `provideVflow()` on the path registers is an error when the entity is created. See
[Custom nodes](../../nodes/custom-nodes#component-keys) and [Custom edges](../../edges/custom-edges).

## Scope

`provideVflow()` returns plain providers, so it works at every level. It provides values only: nothing of the flow is
created until a `vflow` renders, and the services of a flow stay with its element, so two flows on one page never
share state. A feature of your own, for a package or an application, is built with `vflowFeature(kind, providers)`
and passed to the same `provideVflow()`; its kind is a string, namespaced for a third party, and one kind appears at
most once per call.
