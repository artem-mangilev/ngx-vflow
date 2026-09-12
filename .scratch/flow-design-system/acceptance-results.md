# Результаты приёмки новых блоков (этап 6)

Дата: 2026-09-12. Браузер приёмки — Chromium (Playwright, `apps/docs-e2e`). Все проверки воспроизводимы командами ниже; строка «Производительность» на этом этапе не применяется по решению пользователя.

## Команды

| Проверка                                      | Команда                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Юнит-тесты core                               | `npx nx test ngx-vflow --watch=false --browsers=ChromeHeadless`                               |
| Сборка пакетов и парность CSS-выходов         | `npx nx build ui && node libs/ui/scripts/check-styles.mjs` (или `npx nx run ui:check-styles`) |
| Consumer из собранных пакетов: core-only и ui | `npx nx run consumer:check`                                                                   |
| E2E, включая матрицу приёмки и consumer       | `npx playwright test --config apps/docs-e2e/playwright.config.ts`                             |

## Матрица

| Область                 | Что проверено                                                                                                                                                                                                                                                                                                                                                                      | Где                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Композиция              | Пять сцен покрывают принятые паттерны; общие части переиспользуются без копирования оболочек: карточки, строки, порты, контейнеры, toolbar, статусы, подписи связей, controls, BPMN                                                                                                                                                                                                | `design-system.spec.ts` (9 тестов), страницы секции Design system                          |
| Геометрия               | Endpoints совпадают с портами при первом кадре, zoom через controls, переносе длинных имён, смене типографики (`--vui-font-size`) и плотности (`--vui-space`), rename/reorder/delete полей, вставке строки порта, drag ноды с подписями start/center/end, collapse/scroll                                                                                                          | `design-system-acceptance.spec.ts` (geometry), `design-system.spec.ts`                     |
| Состояния и доступность | Выделение + статус + диагностика одновременно; активность не блокирует действия; axe без нарушений на пяти страницах (scope демо); фокус на core-обёртке с outline цвета темы; accessible names у кнопок и портов; вложенные controls не двигают ноду и не зумят граф; forced colors для связей и BPMN-линий; reduced motion останавливает анимацию активности                     | `design-system-acceptance.spec.ts`, `design-system.spec.ts`                                |
| Темы                    | Два редактора с разными темами и core-only flow на одной странице; тема доходит до нод, SVG-связей, маркеров, фона, toolbar и minimap; смена темы не меняет геометрию; импорт CSS не темизирует standalone flow                                                                                                                                                                    | `design-system.spec.ts` (themes)                                                           |
| Поставка                | Core-only consumer с собственными шаблонами не содержит кода и классов `@vflow/ui`; UI consumer без Tailwind (собственный пустой `.postcssrc.json`) использует compiled `styles.css` из `dist/libs/ui`, импортирует `@vflow/ui/bpmn` и `vflow-controls`; source-вход компилируется как у потребителя и побайтово равен compiled; docs hybrid-конфигурация потребляет `dist` пакеты | `apps/consumer` (`consumer:check`), `consumer.spec.ts`, `libs/ui/scripts/check-styles.mjs` |
| Angular-совместимость   | Заявлено `^20.0.0 \|\| ^21.0.0` (peerDependencies обоих пакетов). Проверено на установленном Angular 20.3: partial compilation ng-packagr, сборка consumer из `dist`. Angular 21 в этом окружении не установлен и не проверялся                                                                                                                                                    | `libs/ui/package.json`, `libs/ngx-vflow/package.json`                                      |

## Итог

Новые блоки прошли матрицу; результаты воспроизводимы. Это рубеж перед этапом 7 (удаление default presentation из core).
