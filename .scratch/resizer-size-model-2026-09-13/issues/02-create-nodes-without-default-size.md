# 02. createNodes без дефолтного размера для html/component нод

Status: resolved
Type: task
Blocked by: 01

Решение D2 из `spec.md`.

- В `createNode` с `useDefaults` не создавать `width`/`height` для `html-template` и component нод, если их нет во входных данных.
- Обновить `NodeWithDefaults`: `width`/`height` опциональны для этих типов, обязательны для `template-group`.
- Проверить компиляцию docs и consumer приложений; места, читающие `node.width()` без проверки, перевести на `nodesChanges.size` или на контекст.
- Запись в migration guide.
- Спеки: `node.interface`/`createNodes`.

Файлы: `libs/ngx-vflow/src/lib/vflow/interfaces/node.interface.ts`, docs migration page.

## Answer

Сделано: `createNode` с `useDefaults` не создаёт `width/height` для html/component нод; `NodeWithDefaults` стал объединением по типам, где размер опционален для html/component и обязателен для групп. Новый `node.interface.spec.ts`. Спека keyboard-navigation даёт тестовой ноде явный размер в данных. Заметка в migration guide («Node size modes»). Полный набор библиотеки: 219/219, lint и typecheck docs/consumer чистые.
