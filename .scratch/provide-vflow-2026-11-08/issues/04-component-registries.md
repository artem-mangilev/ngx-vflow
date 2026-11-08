# 04. `withNodeComponents` / `withEdgeComponents`, строковые ключи в `component`

Status: resolved
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

## Comments

2026-11-08, сделано:

- `interfaces/entity-components.interface.ts`: пустые аугментируемые интерфейсы `VflowNodeComponents` / `VflowEdgeComponents`, типы `NodeComponentKey` / `EdgeComponentKey` (`keyof X extends never ? string : keyof X & string`).
- `features/with-entity-components.ts`: токены `VFLOW_NODE_COMPONENTS` / `VFLOW_EDGE_COMPONENTS` (`Signal<EntityComponentRegistry>`), `withNodeComponents(map)` / `withEdgeComponents(map)` поверх `provideMergedFeatureValue` — карты сливаются по уровням; аргумент только объект (значения — класс или lazy-фабрика).
- `Node.component` / `Edge.component`: `EntityComponentType | NodeComponentKey` / `EdgeComponentKey`; `createNode(s)` пропускают строку как есть.
- `utils/resolve-entity-component.ts`: `resolveEntityComponent(kind, component, registry)` — строка читается из реестра один раз (`untracked`), иначе бросает `[ngx-vflow] No node component is registered as "x". Register it with provideVflow(withNodeComponents({ x: … }))` — всегда, не только в dev. `NodeModel.component` / `EdgeModel.component` держат разрешённое значение; `isComponentClass` и шаблоны `node.component.html` / `edge.component.html` читают его.
- Docs-демо `custom-component-nodes-demo` (`red`/`blue`) и `component-edges-demo` (`colored`) переведены на ключи; `isComponentNodeEvent(event, Class)` в них без изменений.
- Экспорт: обе функции, оба токена, `EntityComponentRegistry`, оба интерфейса и оба типа ключей.
- Проверено: `provided-components.spec.ts` — 6 тестов (нода и ребро по ключу рядом с классом и шаблоном; lazy-ключ; событие несёт разрешённый класс и проходит `isComponentNodeEvent`; хост дополняет корень; неизвестный ключ бросает с текстом; ключ без аугментации — любая строка). Аугментация проверена против собранного `index.d.ts` отдельным tsconfig в scratchpad: с `declare module 'ngx-vflow' { interface VflowNodeComponents { task: typeof TaskNode } }` опечатка `'tsak'` и регистрация под чужим ключом не компилируются, без аугментации любой ключ принимается (в спеках репозитория аугментацию держать нельзя — она глобальна для всей компиляции спеков). `nx test ngx-vflow` 484 + 44; `nx lint ngx-vflow`, `nx lint docs`; `nx build ngx-vflow` (`ɵ` не прибавилось); `nx build docs`.
