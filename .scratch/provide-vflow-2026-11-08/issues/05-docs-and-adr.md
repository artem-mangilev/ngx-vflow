# 05. Документация и ADR-0011

Status: ready-for-agent
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
