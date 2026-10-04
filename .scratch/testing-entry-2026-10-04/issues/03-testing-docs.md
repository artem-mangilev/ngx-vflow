# 03. Docs: тесты с настоящим `Vflow`

Status: resolved
Type: task
Blocked by: 01, 02

## Answer

- Новая страница `testing/unit-testing`: пример теста компонента с flow, таблица «что проверяется без браузера», жест соединения.
- `testing/unit-testing-component-nodes` переписана: компонент узла в flow из одного узла вместо `provideCustomNodeMocks`.
- Страница `component-mocks` удалена.
- Migration guide: раздел «Testing mocks» и строка в «Removed APIs»; убраны упоминания моков в других разделах.
- Оба примера из docs дословно повторены в `node-dom/editor.spec.ts` и `node-dom/component-node.spec.ts`.

Найдено при проверке примера: жесту соединения нужен `await fixture.whenStable()` после нажатия и после отпускания — flow реагирует на них в разных проходах change detection. В docs это написано.
