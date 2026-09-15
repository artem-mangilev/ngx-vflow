# 05. `[vflowHandle]` вместо `<handle>`

Status: resolved
Type: task
Blocked by: 01

Реализовать D5 из `spec.md` (пересмотрено 2026-09-15). `<handle>` удаляется в этой задаче; docs, consumer,
моки и e2e переводятся здесь же. Связка `vflowPort` с `HANDLE_REF` из 06 делается здесь, потому что
миграция демо на `<span vflowHandle vflowPort>` без неё требует временных биндингов состояния.

- `directives/handle.directive.ts`: `VflowHandleDirective` (`[vflowHandle]`, `exportAs: 'vflowHandle'`), входы
  по D5, `provideHandleDefaults`, host-класс `vflow-handle` и атрибуты `data-vflow-handle-*`, стили `auto`,
  host-listeners pointer, a11y через `bindEntityAccessibility`, провайдер `HANDLE_REF`.
- `utils/inject-handle.ts`: `HandleRef`, `HANDLE_REF`, `injectHandle()`, `HandleDefaults`,
  `HANDLE_DEFAULTS`, `provideHandleDefaults()`; экспорт в `public-api.ts`, `HandleState` и `HandleType`
  публичные.
- `models/handle.model.ts`: опции на сигналах, `element`, публичный `localPoint`, `hasBox`; `measure` для
  `auto` (containing block) и `manual` (точка из прямоугольника); dev-warning при `display: none`.
- `NodeModel.isReady` не ждёт handle с `hasBox = false`; `EdgeModel.isReady` требует измеренных handle.
- Потребители `rawHandle`: `edge.model`, `connection-controller`, `connection.component`,
  `connection-events.interface`, `adjust-direction`.
- `directives/node-handles-controller.directive.ts`: наблюдать `element` и его родителя; перемер при смене
  `position`/`offset`/`layout`.
- `components/node/node.component.*`: магниты по `localPoint` и обработчики соединения.
- `directives/entity-accessibility.directive.ts`: функция `bindEntityAccessibility`.
- Удалить `public-components/handle/*`, `HandleTemplateDirective`, `HandleContext`, `NodeHandle`; обновить
  `vflow.ts`, `public-api.ts`.
- `ngx-vflow/testing`: `HandleMockDirective`, удалить `HandleMockComponent` и `HandleTemplateMockDirective`,
  `all-mocks.spec.ts`; спека на компонент с `hostDirectives` и `provideCustomNodeMocks()`.
- `@vflow/ui`: `vflowPort` берёт `state` из `HANDLE_REF`, README.
- Спеки: `handle.directive.spec.ts` (auto на ноде и внутри `position: relative`, manual, смена position,
  `display: none` не измеряется и не блокирует ноду, `visibility: hidden` измеряется, атрибуты состояния,
  `injectHandle` и defaults в компоненте с `hostDirectives`, магнит при активном соединении), перевод
  существующих спек на директиву.
- Docs и consumer: все `<handle>` → `[vflowHandle]`; страницы handles (custom-handles с CSS-состояниями и
  компонентом-портом), accessibility, connections, default-nodes, testing, migration-сниппеты 3.0; e2e-селекторы.

Файлы: `libs/ngx-vflow/src/lib/vflow/{directives,models,services,components/node,utils}`,
`libs/ngx-vflow/testing`, `libs/ui/src/lib/port.directive.ts`, `apps/docs`, `apps/consumer`, `apps/docs-e2e`.

## Answer

Сделано 2026-09-15, по пересмотренной D5.

- `VflowHandleDirective` (`[vflowHandle]`, `exportAs: 'vflowHandle'`) в `Vflow`. Роль из входа, затем из
  `provideHandleDefaults()` на том же элементе, затем `source`/`top`/`auto`. Состояние: класс `vflow-handle`,
  атрибуты `data-vflow-handle-*`, сигналы директивы и `HANDLE_REF`/`injectHandle()`. Входы `position` и `layout`
  объявлены на публичных полях `positionInput`/`layoutInput` с алиасом: на `protected` полях строгая проверка
  шаблонов консьюмера запрещает биндинг (karma этого не ловит, поймал `ngc` docs).
- `HandleModel` на сигналах: `element`, `type()`/`position()`/`id()`/`layout()`/`offset*()`, публичный `localPoint`,
  `hasBox`; `rawHandle`, `NodeHandle`, `template`, `templateContext` удалены. `auto` при containing block внутри
  ноды считает `top/left` от него (padding box и scroll), иначе прежние `left/right: 0`. `manual` берёт середину
  стороны из прямоугольника элемента. `display: none` даёт `hasBox = false` и одно dev-предупреждение;
  `NodeModel.isReady` такой handle не ждёт, `EdgeModel.isReady` с ним ложен.
- Магниты рендерит `NodeComponent` по `localPoint` измеренных handle, пока идёт соединение; обработчики
  валидации там же. Контроллер наблюдает элемент и его родителя и перемеряет при смене стороны, смещения и layout.
- A11y вынесена в `bindEntityAccessibility()`. Pointer через host-listeners, `RootPointerDirective` опционален.
- Удалены `HandleComponent`, `HandleTemplateDirective`, `HandleContext`. В `testing` новый `HandleMockDirective`,
  старые мок-компонент и мок шаблона удалены.
- `@vflow/ui`: `vflowPort` читает `state` из `HANDLE_REF` (без `self`), `vflowPortState` стал override (это 06).
- Docs и consumer: все `<handle>` переведены на `<span vflowHandle … vflowPort>` или свой класс в core-only примерах;
  шаблоны портов удалены. Страница custom-handles переписана (атрибуты состояния, layout, скрытый handle,
  компонент-порт `square-handle` на `hostDirectives`). Обновлены multiple-connection-points, accessibility,
  default-nodes, unit-testing, connections, обзор дизайн-системы, сниппеты и строка таблицы в migration.
  `CONTEXT.md`: термин «Handle». e2e-селекторы переведены на `.vflow-handle[data-vflow-handle-position=…]`.
- Спеки: новый `handle.directive.spec.ts` (auto на ноде, смена стороны, позиционированный предок с рамкой,
  manual, `display: none` и `visibility: hidden`, компонент с `hostDirectives` и defaults, магниты),
  `provide-custom-node-mocks.spec.ts`, переписан `handle.model.spec.ts`, остальные спеки переведены.

Проверки: `tsc` библиотеки; юнит-тесты библиотеки 257/257; `nx build ui` (с `ngx-vflow` и `testing`);
`ngc` docs; `consumer:check`; `nx build docs`; eslint и prettier изменённых файлов. e2e docs 32/32 на свежем
dev-сервере. Отдельный прогон Playwright на custom-handles: handle на краях нод по центру строк, `valid` на
компоненте-порте при наведении, ребро создаётся, флажки меняют атрибуты, ошибок консоли нет.
Не сделано: `sitemap.xml` по-прежнему перечисляет удалённые API-страницы, он и до этого был устаревшим.

## Comments

2026-09-15, после ревью пользователя:

- `provideHandleDefaults`, `HANDLE_DEFAULTS` и `HandleDefaults` удалены. Дефолты зашиты в директиву (`source`, `top`,
  `auto`), `position` и `layout` снова обычные входы, публичные `positionInput`/`layoutInput` и отключение
  `no-input-rename` ушли. Компонент на `hostDirectives` пробрасывает `vflowHandle` и `position`; `square-handle` в
  демо получает роль там, где используется.
- `VflowPort` сам применяет `VflowHandleDirective` через `hostDirectives` и пробрасывает все входы handle, тип
  через `vflowPort="source|target"`. Во всех демо, consumer и markdown `vflowHandle="x" … vflowPort` сведены к
  `vflowPort="x"`; e2e-селекторы `.vui-port.vflow-handle[…]` остались верными. D5 в `spec.md` обновлена.
- Компонент-handle пробрасывает тип под другим именем (`vflowHandle: type`): атрибут `vflowHandle` на его хосте в
  шаблоне, импортирующем `Vflow`, совпадает с селектором и применяет директиву второй раз. Поймано Playwright на
  custom-handles, ngc и юнит-спеки этого не видят.
- Вход типа переименован в `type` (`vflowHandle type="source"`, `vflowPort type="target"`), пробросы в
  `hostDirectives` без алиаса, ловушка NG0309 снята. В JSDoc входа и на странице custom-handles указано, что
  handle не ставится на `button`/`input`. В `handle.directive.ts` TODO про префикс входов (`vflowType`/`vwType`).
- `injectHandle()`, `HANDLE_REF`, `HandleRef` и поле `ref` удалены: код читает сигналы через
  `inject(VflowHandleDirective)` (хост на `hostDirectives` и содержимое handle), шаблон через `#h="vflowHandle"`.
  `HandleMockDirective` провайдит себя как `VflowHandleDirective` через `useExisting`. `square-handle`, спеки,
  custom-handles, migration и D5 обновлены.
- Спеки в `ngx-vflow/testing` штатный `nx test ngx-vflow` не запускает; их прогон:
  `nx test ngx-vflow --include='../testing/src/**/*.spec.ts'`. Новые `provide-custom-node-mocks.spec.ts` (компонент на
  `hostDirectives` с `provideCustomNodeMocks()`) и `handle-mock.directive.spec.ts` (`inject(VflowHandleDirective)`
  получает мок через `useExisting`) проходят. `all-mocks.spec.ts` падает с `Unexpected value 'undefined' imported by
the module 'DynamicTestModule'` и на чистом HEAD, то есть до этой задачи; вынесено в отдельную задачу.
