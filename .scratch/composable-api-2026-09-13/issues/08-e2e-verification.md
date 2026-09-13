# 08. Проверка e2e и финальный прогон

Status: ready-for-agent
Type: task
Blocked by: 07

- `apps/docs-e2e`: прогнать `resizer.spec.ts`, `custom-edge-interactions.spec.ts`,
  `accessibility.spec.ts`, `keyboard-navigation.spec.ts`, `minimap-navigation.spec.ts`, stress
  rendering (первые кадры: 0 линий до готовности, затем все, handle по центру карточки).
- Новые e2e: страница Edge labels (лейбл в центре, кликабелен, следует за ребром при drag ноды);
  Custom handles (`manual` layout, скрытый handle с `opacity: 0` принимает соединение).
- Юнит-набор библиотеки и `@vflow/ui`, typecheck docs/testing, lint, сборка библиотеки, формат.
- Итог в `report.md` этой папки: числа прогонов, что осталось открытым.

## Comments

2026-09-13: `stress-rendering.spec.ts` › virtualization demo нестабилен в dev-режиме: страница доходит до 4900
нод за 4.3–5.3 с, а тест ждёт 5 с. A/B на `13b270f4`, `919c2cfd` и тикете 02 даёт одинаковые медианы
(4460, 4414, 4390 мс), так что это не регрессия 3.0. При финальном прогоне либо поднять таймаут этой
проверки, либо гонять e2e против production-сборки.

2026-09-13: `minimap-navigation.spec.ts` › «keeps wheel zoom within limits, blocks page scrolling, and aligns after
resize at high DPI» тоже нестабилен: после `setViewportSize` тест ждёт только ширину canvas, а не пересчёт трансформации
миникарты, и клик уходит в устаревшую геометрию. A/B по 16 прогонов: `53a226e4` 2 падения, состояние тикета 03 1
падение. При финальном прогоне ждать пересчёта миникарты или сделать повтор проверки.
