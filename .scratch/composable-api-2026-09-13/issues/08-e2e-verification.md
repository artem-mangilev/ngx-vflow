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
