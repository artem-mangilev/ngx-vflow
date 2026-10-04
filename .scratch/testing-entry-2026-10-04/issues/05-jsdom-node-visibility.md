# 05. В jsdom узлы навсегда остаются `visibility: hidden`

Status: resolved
Type: task
Blocked by: —

## Проблема

Узел скрыт до первого измерения (`node.component.ts`, initial viewport gate). В jsdom нет `ResizeObserver`, измерения не будет никогда, inline `visibility: hidden` остаётся. Измерено: `getComputedStyle(button).visibility === 'hidden'` для кнопки внутри узла.

Следствие: запросы, которые пропускают скрытые элементы (`getByRole` из Testing Library, `toBeVisible`), не находят содержимое узла. `textContent`, `querySelector` и клики работают. В happy-dom проблемы нет: его `ResizeObserver` срабатывает с нулевыми размерами, узел считается измеренным.

Сейчас это описано в docs как ограничение jsdom с обходом `{ hidden: true }`.

## Решить

- Оставить как есть (документировано).
- Или: где измерить нечем (нет `ResizeObserver`), узлы, рёбра и labels не ждут измерения и не скрываются. Это не фейковый layout, размеры остаются нулями; меняется только gate видимости.

## Answer

Решение (2026-10-04): не скрываем сущности там, где измерить нечем.

Исходное наблюдение было неполным. Specs не подключали стили компонентов; со стилями, как в сборке приложения, правило `.v-initializing .v-viewport { visibility: hidden }` скрывает всё содержимое flow и в jsdom, и в happy-dom, а minimap скрыт inline-стилем. Критерий «нет `ResizeObserver`» happy-dom не покрывал.

- `FlowRenderingService.hasLayout` — проверка один раз на flow: у окна есть размер, у корневого элемента нет → layout'а в этом DOM нет. В браузере `true`; при `innerWidth === 0` (скрытый iframe) тоже `true`, поведение прежнее.
- `hiddenUntil(ready)` используют узел, ребро и edge label; `awaitsFirstLayout` — host-класс `v-initializing` и minimap. Без layout они ничего не скрывают. `initialized()` по-прежнему `false`.
- `vitest.node-dom` обрабатывает CSS (`css: true`), spec проверяет computed `visibility` кнопки в узле, template-узла, пути ребра, edge label, viewport и minimap в обоих окружениях.
- Docs: примечание про `{ hidden: true }` убрано.
