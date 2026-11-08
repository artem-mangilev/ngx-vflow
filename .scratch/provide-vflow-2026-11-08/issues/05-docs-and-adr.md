# 05. Документация и ADR-0011

Status: resolved
Type: task
Blocked by: 02, 03, 04

Спецификация: [spec.md](../spec.md), все решения.

## Что сделать

- Новая страница `apps/docs/src/app/categories/introduction/pages/configuration/` (order после Overview): где ставится `provideVflow` (bootstrap, роут, компонент), приоритет «инпут → ближайший провайдер → дефолт», слияние уровней по ключам, каждая `with*()` с примером; демо: два флоу на одной странице с общим корневым `withSettings` и разным компонентным переопределением. Памятка ng-doc: `{% raw %}` вокруг `{{ }}`, никаких `*word` в инлайн-коде.
- Accessibility: раздел про `withAccessibility`, пример с фабрикой из i18n-сервиса и сигналом. Custom nodes / Custom edges: раздел «Register components by key» с `withNodeComponents` и аугментацией `VflowNodeComponents`. Lazy loading: lazy-ключ.
- Migration (3.0): `[ariaLabelConfig]` → `provideVflow(withAccessibility(...))`; инпуты настроек больше не несут дефолт в типе (`InputSignal<T | undefined>`), что видно только тем, кто читает `flow.minZoom()` напрямую.
- `docs/adr/0011-configure-flows-through-provide-vflow-features.md` по образцу ADR-0010: решения 1–4 одним абзацем каждое; отклонённые варианты: `EnvironmentProviders`, конфиг первым аргументом, группы `withViewport`/…, «ближайший `provideVflow` побеждает целиком», откат на шаблон при неизвестном ключе, инпут `ariaLabelConfig` как вторая точка истины.
- `CONTEXT.md`: термин «Flow feature» (optional capability installed with `provideVflow`; _avoid_: plugin, module).

## Готово, когда

- Docs dev-сервер показывает страницу и демо без ошибок консоли; `nx build docs` (гибридная сборка против `dist/libs/ngx-vflow`) проходит.

## Comments

2026-11-08, сделано:

- Страница `introduction/configuration` (order 2; Architecture → 3, Roadmap → 4): откуда берётся значение (инпут → ближайший `provideVflow` → `VFLOW_SETTINGS_DEFAULTS`), слияние уровней по ключам, `flow.settings`, три фичи, scope и `vflowFeature` для своих фич. Демо `ConfigurationDemoComponent`: два флоу под одним `provideVflow`, правый под вторым с двумя ключами; подписи с фигурными скобками вынесены в поля компонента (в шаблоне `{` читается как ICU). `data-testid`: `configuration-demo`, `shared`, `overriding`, `zoom-range`, `double-click` — для e2e в тикете 06.
- Custom nodes: раздел «Component keys» (`#component-keys`) с `withNodeComponents`, ошибкой на неизвестный ключ и аугментацией `VflowNodeComponents`; Custom edges и Lazy loading — по предложению; Accessibility — ссылка на Configuration.
- Migration: новый раздел «Configuration through `provideVflow()`» (`[ariaLabelConfig]` → `withAccessibility`, фабрика для меток с хоста, инпуты без дефолтов и `flow.settings`, строковые ключи в `component`), правка абзаца про сигнальные инпуты, строка в Removed APIs.
- `docs/adr/0011-configure-flows-through-provide-vflow-features.md`; `CONTEXT.md`: термин «Flow feature».
- Проверено в dev-сервере: страницы Configuration, Custom nodes (якорь и ссылки) и Migrations рендерятся без ошибок консоли; демо показывает `0.5 – 2 / on` и `0.5 – 4 / off`. `nx lint docs` и `nx build docs` (production) зелёные.
