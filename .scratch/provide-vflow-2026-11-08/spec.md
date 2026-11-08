# `provideVflow()`: настройки, доступность и реестр компонентов через DI

Статус: план, 2026-11-08. Форма подтверждена пользователем 2026-11-08 (только `with*()`, `withAccessibility` принимает
сам конфиг, фабрика/сигнал — дополнительные формы). Открытые вопросы **[?]** закрыты по предложению: один
`withSettings`, две функции реестров, неизвестный ключ — ошибка всегда, имя `withAccessibility`. Тикеты в `issues/`.
Основание: `FlowSettingsService` и `bindVflowInputs` (3.0), ветка `plugin-system` (коммит `5695d10da`, сентябрь 2026:
`VflowFeature`, `provideVflow`), [отчёт о плагинной архитектуре](../plugin-architecture-2026-09-20/reports), ADR-0002,
ADR-0004, ADR-0007, `@angular/router` (`provideRouter(routes, ...features)`), Foblex Flow
(`provideFFlow(config?, ...features)`, `libs/f-flow/src/provide-f-flow/*`, `plugins/a11y/with-a11y.ts`).

## Цель

Одна функция `provideVflow(...)` и набор `with*()`-фич, чтобы приложение могло один раз, на уровне `bootstrapApplication`,
роута или компонента-хоста:

1. задать значения настроек `<vflow>` по умолчанию (`minZoom`, `zoomOnDoubleClick`, `selectionBox`, …), не повторяя
   их в каждом шаблоне;
2. локализовать доступность (`AriaLabelConfig`) через DI, в том числе из i18n-сервиса, а не через инпут;
3. зарегистрировать компонентные ноды и рёбра под строковыми ключами и ссылаться на них из данных
   (`component: 'task'`), что убирает импорт классов компонентов в код, который строит граф, и делает
   граф сериализуемым.

Не цель: швы плагинов (intent-конвейер, veto, strategy slots) из ветки `plugin-system` — из неё берётся только форма
`VflowFeature`/`provideVflow`, чтобы будущие фичи ядра и пакетов `@vflow/*` вставали в ту же функцию.

## Текущее состояние (3.0, 2026-11-08)

- Все настройки — сигнальные инпуты `VflowComponent` со значениями по умолчанию в самом инпуте
  (`minZoom = input(0.5)`); объектные инпуты сливаются с дефолтами через `withDefaults` в `transform`.
  `bindVflowInputs` привязывает их к `bindableSignal`-ам `FlowSettingsService` (`settings.bind({...})`),
  `connection` — к `FlowEntitiesService.connectionSettings`, `keyboardShortcuts` — к `KeyboardService`.
- `ariaLabelConfig` — такой же инпут (`Partial<AriaLabelConfig>` поверх `DEFAULT_ARIA_LABEL_CONFIG`); читают его
  через `settings.ariaLabels()` обёртки сущностей, `KeyboardLabelsService`, минимапа.
- `Node.component` / `Edge.component` — `EntityComponentType = Type<unknown> | (() => Promise<Type<unknown>>)`;
  `NodeModel` в конструкторе решает `isComponentClass` (для lazy-load), `EntityComponentOutletDirective` создаёт
  компонент. Все 20 сервисов флоу живут в `providers` `<vflow>`, `providedIn: 'root'` нет ни у одного.
- `export function provide*` в `libs/` нет; DI-токены: `NODE_REF`, `EDGE_REF`, `VFLOW_INITIALIZATION_GATE`,
  `VX_LAYOUT_POSITION_WRITER`.
- В ветке `plugin-system` есть `VflowFeature<K>` (класс с приватным брендом, `kind`, `providers`),
  `vflowFeature(kind, providers)`, `provideVflow(...features): Provider[]` с dev-проверками (не-фича, дубликат `kind`,
  сентинел «provideVflow дважды»). Там «ближайший provideVflow побеждает целиком» — здесь это меняется (ниже).

## Решения (предложение)

### 1. Форма: `provideVflow(...features: VflowFeature[]): Provider[]`

- Возвращает `Provider[]`, не `EnvironmentProviders`: та же функция работает в `bootstrapApplication({ providers })`,
  в `providers` роута и в `providers` компонента-хоста. `makeEnvironmentProviders` существует, чтобы _запретить_
  компонентный уровень; у нас он основной сценарий переопределения (две диаграммы на странице с разными ключами).
- `VflowFeature<K extends string>` и `vflowFeature(kind, providers)` — как в `plugin-system`: класс с приватным
  брендом (объектный литерал не проходит), `kind` — строка (`'settings'`, `'accessibility'`, `'node-components'`),
  сторонние/пакетные фичи берут namespace (`'vx:layout'`). Без `ɵkind`: в репозитории `ɵ` означает «не контракт».
- Dev-проверки за `typeof ngDevMode === 'undefined' || ngDevMode`: аргумент не `VflowFeature`; один `kind` дважды
  в одном вызове. Сентинел «provideVflow дважды в одном инжекторе» не нужен: с per-feature токенами второй вызов
  просто переопределяет токены первого (last-wins Angular), как у Foblex.
- **Каждая фича — свой токен, ближайший провайдер токена побеждает, но сливается с родительским.** `with*()`
  провайдит токен через `useFactory`, которая читает `inject(TOKEN, { skipSelf: true, optional: true })` и накладывает
  свои ключи сверху. Тогда:

  ```ts
  // app.config.ts
  provideVflow(withSettings({ minZoom: 0.2, maxZoom: 4 }), withAccessibility(ruLabels));
  // feature component
  providers: [provideVflow(withSettings({ zoomOnDoubleClick: true }))]; // minZoom 0.2 остаётся
  ```

  Это снимает проблему «multi-провайдеры двух уровней не сливаются» из отчёта о плагинах — слияние явное, в фабрике.

- **Приоритет значения**: привязанный инпут `<vflow>` > ближайший провайдер > дефолт библиотеки. Инпут без привязки
  ничего не переопределяет (см. 2).

**[?] Конфиг первым аргументом.** Foblex принимает `provideFFlow({ id }, withX())` через перегрузку и сниффинг
`kind`. Предложение: только `with*()`, чтобы форма была одна (`provideVflow(withSettings({ minZoom }))` на одну
функцию длиннее, зато нет перегрузки и вопроса «что из этого конфиг»). Альтернатива — `provideVflow({ minZoom }, …)`
как сахар над `withSettings`; добавить можно позже без ломки.

### 2. `withSettings(settings)` — настройки `<vflow>` через DI

- Новый экспортируемый тип `VflowSettings`: ключи = инпуты `VflowComponent`, кроме `nodes`, `edges` и `ariaLabelConfig`
  (уходит в 3). Включает `view`, `connection`, `keyboardShortcuts` — всё 1:1 с инпутами, одна ментальная модель:
  «любой инпут настроек можно задать и провайдером под тем же именем».
- `withSettings(value: Partial<VflowSettings> | (() => Partial<VflowSettings> | Signal<Partial<VflowSettings>>))`.
  Функция выполняется как `useFactory` в контексте инжектора (`inject()` доступен); сигнал читается реактивно.
- Дефолты переезжают из инпутов в константу `VFLOW_SETTINGS_DEFAULTS: Required<VflowSettings>` (экспорт, как
  `NODE_DEFAULTS`). Инпуты становятся `input<T | undefined>()` без значения: `undefined` = «не привязан».
  `transform`-ы инпутов (`nonNegative`, `withDefaults`) переезжают в резолвер.
- Резолвер в `bindVflowInputs`: для каждого ключа `computed(() => input() ?? provided()[key] ?? DEFAULTS[key])`;
  объектные настройки (`optimization`, `selectionBox`, `connection`, `keyboardShortcuts`, `autoPan`-объект,
  `alignmentHelper`-объект) сливаются по ключам в три слоя: дефолт ← провайдер ← инпут (семантика
  `withDefaults`, memory «Object settings semantics»). `FlowSettingsService.bind()` остаётся, в него уходят уже
  резолвленные сигналы; `FlowSettingsSources` не меняется.
- `VflowComponent.settings: ResolvedVflowSettingSignals` — публичные сигналы настроек в действии; инпуты держат
  только привязанное. Пакеты (`vuiControls`) и приложения читают эффективные значения отсюда (добавлено при
  реализации, 2026-11-08).
- Токен `VFLOW_SETTINGS: InjectionToken<Signal<Partial<VflowSettings>>>` экспортируется (чтение в тестах и пакетах);
  документированный способ задать — `withSettings`.
- Документация инпутов: JSDoc «Default: …» остаётся, ng-doc показывает тип `number | undefined` — приемлемо.

**[?] Группировка.** Альтернатива — `withViewport({ minZoom, zoomOn*, panOn* })`, `withSelection(…)`,
`withGestures(…)`: читается в доках, но 5–6 имён и спор, куда класть `background` или `snapGrid`. Предложение: один
`withSettings`, группы при желании добавить потом как сахар над тем же токеном.

### 3. `withAccessibility(labels)` — доступность через DI, инпут удаляется

- `withAccessibility(value: Partial<AriaLabelConfig> | (() => Partial<AriaLabelConfig> | Signal<Partial<AriaLabelConfig>>))`,
  `kind: 'accessibility'`, токен `VFLOW_ARIA_LABELS`. Та же схема слияния с родителем и с `DEFAULT_ARIA_LABEL_CONFIG`.
  Фабрика — для i18n: `withAccessibility(() => inject(TranslocoService).selectTranslateObject('vflow'))`; сигнал
  даёт смену языка на лету без пересоздания флоу.
- Инпут `ariaLabelConfig` удаляется (3.0 ломающий, период депрекации не нужен — 3.0 и так ломает API).
  `settings.ariaLabels` остаётся внутри: его читают обёртки, `KeyboardLabelsService`, минимапа — они не меняются.
- `nodesFocusable`, `edgesFocusable`, `autoPanOnNodeFocus` остаются настройками (`withSettings`): это поведение,
  а не локализация.
- ADR-0004 не противоречит: роли и состояния остаются библиотечными, приложение по-прежнему даёт только тексты.

**[?]** Имя: `withAccessibility` (общее, как у Foblex) или `withAriaLabels` (точнее по типу). Предложение —
`withAccessibility`, тип переименовать не нужно.

### 3a. `withShortcuts(shortcuts)` — клавиши через DI, инпут `keyboardShortcuts` удаляется

Решение пользователя 2026-11-08 (тикет 07): шорткаты — каталог, как метки, со своим правилом слияния (по секциям
`modifiers` / `commands`), поэтому своя фича `withShortcuts` и токен `VFLOW_SHORTCUTS`; ключ `keyboardShortcuts`
уходит из `VflowSettings`, инпут удаляется. Правило для `withSettings` уточнено: в нём инпуты-настройки; каталог с
собственной семантикой слияния получает свою фичу и теряет инпут, чтобы у значения был один источник. Имя
`withShortcuts` выбрано вместо `withKeyboardShortcuts` / `withKeyboard` (последнее обещает больше, чем даёт).

### 4. `withNodeComponents(map)` / `withEdgeComponents(map)` — строковые ключи компонентов

- `withNodeComponents(map: Record<string, EntityComponentType>)`, `kind: 'node-components'`, токен
  `VFLOW_NODE_COMPONENTS`; симметрично `withEdgeComponents` / `VFLOW_EDGE_COMPONENTS`. Значение — класс или lazy
  `() => import(...)`, как сегодня в `component`. Реестры сливаются с родительским (компонент-хост добавляет свои
  ключи к глобальным).
- `Node.component?: EntityComponentType | string`, `Edge.component?: …` аналогично. Класс напрямую продолжает
  работать (тесты, одноразовые ноды).
- Разрешение ключа — один раз при создании `NodeModel`/`EdgeModel` (они уже создаются в
  `runInInjectionContext(injector)` в `bindVflowInputs`, см. `ReferenceIdentityChecker`): модель хранит
  `resolvedComponent: EntityComponentType`, `isComponentClass` и `EntityComponentOutletDirective` читают его.
  События `componentNodeEvent` несут разрешённый класс, `isComponentNodeEvent(event, TaskNode)` работает без
  изменений (ADR-0010).
- Неизвестный ключ: ошибка в dev-режиме с подсказкой
  `No node component is registered as 'task'. Register it with provideVflow(withNodeComponents({ task: … })).`
  **[?]** В prod — та же ошибка (это ошибка программиста, как отсутствующий компонент роута) или откат на шаблон
  `vNode`? Предложение: ошибка всегда; молчаливый откат прячет баг.
- Типизация ключей (опционально, отдельный тикет): экспортируемые пустые интерфейсы `VflowNodeComponents`,
  `VflowEdgeComponents` для module augmentation. Тип ключа:
  `type NodeComponentKey = keyof VflowNodeComponents extends never ? string : keyof VflowNodeComponents & string`.
  Без аугментации — любая строка; с `declare module 'ngx-vflow' { interface VflowNodeComponents { task: typeof TaskNode } }`
  — `component: 'tsak'` не компилируется. Отчёт о плагинах рекомендовал аугментацию ровно для одного места —
  реестра типов нод/рёбер.

**[?]** Две функции или одна `withComponents({ nodes, edges })`? Предложение — две: плоские карты, симметрия с
`vNode`/`vEdge`, и у большинства приложений рёбра — шаблон.

### 5. Что остаётся как есть

- Все сервисы по-прежнему на `<vflow>`; `provideVflow` на корне провайдит только токены со значениями — ничего не
  инстанцируется до первого флоу.
- `Vflow` (массив импортов), `VFLOW_INITIALIZATION_GATE`, `NODE_REF`/`EDGE_REF` не меняются.
- Пакеты `@vflow/layout`, `@vflow/routing`, `@vflow/auto-size` — директивы на `vflow`, как сейчас. Их собственные
  `with*()` (например, `withLayout(dagre())` вместо директивы) — возможное развитие поверх `vflowFeature`, не в этом
  effort.
- `@vflow/ui`: `vuiControls` держит свои `labels` инпутом; подхватывать их из `withAccessibility` — возможный
  follow-up, в `AriaLabelConfig` таких ключей пока нет.

## Тикеты

1. **01-feature-record** — `VflowFeature`, `vflowFeature`, `provideVflow` с dev-проверками (перенос из
   `plugin-system` без реестра/контекста); хелпер `mergedToken(token, defaults, value)` для фабрик `with*()` со
   `skipSelf`-слиянием. Тесты: не-фича, дубликат `kind`, пустой вызов безвреден.
2. **02-settings** — `VflowSettings`, `VFLOW_SETTINGS_DEFAULTS`, `VFLOW_SETTINGS`, `withSettings`; инпуты без
   дефолтов, резолвер трёх слоёв в `bindVflowInputs`; `settings-inputs.spec.ts` расширяется: корень → флоу,
   компонент поверх корня по ключам, инпут поверх всего, объектное слияние, фабрика с `inject()`, сигнал.
3. **03-accessibility** — `withAccessibility`, `VFLOW_ARIA_LABELS`, удаление инпута `ariaLabelConfig`, миграция
   демо (`accessibility-demo`, `shortcuts-configuration-demo`) и спеков; тест смены языка через сигнал.
4. **04-component-registries** — `withNodeComponents`/`withEdgeComponents`, токены, `component: string` в
   `Node`/`Edge`, разрешение в моделях, ошибка неизвестного ключа, lazy-ключ ждёт вьюпорт как сегодня; демо
   `custom-component-nodes` переводится на ключи. Отдельный подпункт: аугментируемые интерфейсы ключей.
5. **05-docs-and-adr** — страница «Configuration» (Introduction, после Overview: где ставить `provideVflow`, три
   уровня, приоритет, все `with*()`), правки Accessibility, Custom nodes/edges, Migration (3.0: `ariaLabelConfig`
   → `withAccessibility`); ADR-0011 «Configure flows through provideVflow features» (решения 1–4, отклонённые
   варианты: `EnvironmentProviders`, конфиг-аргумент, группы, «ближайший provideVflow целиком»).
6. **06-release-smoke** — `nx build ngx-vflow`, `index.d.ts` содержит все новые символы и ничего под `ɵ`, гибридная
   сборка docs, e2e на страницах accessibility и custom nodes.

Зависимости: 02, 03, 04 зависят от 01 и независимы между собой; 05 — после 02–04; 06 — последним.
