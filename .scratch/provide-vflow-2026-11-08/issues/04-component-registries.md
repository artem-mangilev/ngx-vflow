# 04. `withNodeComponents` / `withEdgeComponents`, строковые ключи в `component`

Status: ready-for-agent
Type: task
Blocked by: 01

Спецификация: [spec.md](../spec.md), решение 4.

## Что сделать

- Токены `VFLOW_NODE_COMPONENTS` и `VFLOW_EDGE_COMPONENTS: InjectionToken<Signal<Readonly<Record<string, EntityComponentType>>>>`; `withNodeComponents(map)` / `withEdgeComponents(map)` → `vflowFeature('node-components' | 'edge-components', [provideMerged(TOKEN, map)])` (карты сливаются с родительским уровнем; фабрика/сигнал тут не нужны — тип аргумента только объект).
- `Node.component?: EntityComponentType | string`, `Edge.component?: EntityComponentType | string`; `StaticNode`/`createNode(s)` пропускают строку как есть.
- Разрешение один раз при создании модели: `NodeModel` и `EdgeModel` (создаются в `runInInjectionContext` из `bindVflowInputs`) читают реестр через `inject(TOKEN, { optional: true })` в конструкторе и хранят `resolvedComponent: EntityComponentType | undefined`. `isComponentClass`, `node.component.html`, `edge.component.html` читают `resolvedComponent`. Реестр — `Signal`, но модель читает его `untracked` один раз: смена карты на лету не поддерживается (документировать).
- Неизвестный ключ: `throw new Error('[ngx-vflow] No node component is registered as "task". Register it with provideVflow(withNodeComponents({ task: … })).')` — всегда, не только в dev (решение: ошибка программиста, как компонент роута).
- Типизация ключей: экспортируемые пустые интерфейсы `VflowNodeComponents`, `VflowEdgeComponents`; `NodeComponentKey = keyof VflowNodeComponents extends never ? string : keyof VflowNodeComponents & string` (симметрично для рёбер); `component?: EntityComponentType | NodeComponentKey`. Типовой тест (`expectTypeOf`/`// @ts-expect-error` в `.spec.ts`) на оба случая: без аугментации — любая строка; с `declare module` в спеке — опечатка не компилируется.
- Docs-демо `custom-component-nodes-demo` переводится на ключи с `provideVflow(withNodeComponents({...}))` в `providers` демо-компонента; одно ребро в демо custom-edges — на `withEdgeComponents`.
- Экспорт: оба токена, обе функции, `VflowNodeComponents`, `VflowEdgeComponents`, `NodeComponentKey`, `EdgeComponentKey`.

## Готово, когда

- Спек: нода с `component: 'task'` рендерит зарегистрированный компонент; lazy-ключ ждёт вьюпорта при `lazyLoadTrigger: 'viewport'`, как lazy-класс; `componentNodeEvent.component` — разрешённый класс, `isComponentNodeEvent(event, TaskNode)` истинен; ключ из компонентного уровня дополняет корневой; неизвестный ключ бросает с текстом ошибки; класс напрямую продолжает работать; то же для ребра на SVG-хосте.
- `index.d.ts` содержит новые типы; ничего под `ɵ`.
