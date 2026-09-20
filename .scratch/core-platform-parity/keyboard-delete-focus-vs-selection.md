# Удаление с клавиатуры: фокус или выделение

Дата: 2026-09-20. Повод: в рецепте Delete selected после `Enter` на узле 1, `Tab` на узел 2 и `Delete` удаляется узел 1.

## Модели в других библиотеках

| Библиотека                                 | Фокус на элементах                                                                    | Выделение с клавиатуры                                        | На что действует Delete                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| React Flow 12                              | DOM-фокус на каждом узле и ребре (`tabindex=0`, `role=group`), Tab обходит все        | Enter/Space, фокус не выделяет                                | Глобальный обработчик на `window`: `deleteElements({ nodes: nodes.filter(selected), edges: edges.filter(selected) })`, фокус не учитывается |
| Foblex Flow 19 `withA11y()`                | Один tab stop на хосте, `aria-activedescendant`, DOM-фокус на элементы не переходит   | Стрелки «двигают выделение напрямую», Shift+стрелка расширяет | `fDeleteSelected` с id выделенных; активный элемент всегда в выделении, расхождение невозможно                                              |
| ng-diagram core                            | Нет клавиатурной навигации по узлам; диаграмма берёт фокус на pointerdown, `tabbable` | Только указателем и Ctrl+A                                    | `deleteSelection` (Delete/Backspace) по выделению                                                                                           |
| ng-diagram Org Chart (пример SynergyCodes) | Roving tabindex, Shift+стрелки двигают фокус, `aria-selected`                         | Отдельное состояние                                           | «Delete: remove the focused node»                                                                                                           |
| Blockly keyboard nav                       | Курсор на блоке                                                                       | Курсор и есть выделение                                       | Удаляет блок под курсором                                                                                                                   |

WAI-ARIA APG: «all operations take place at the point of focus»; в multi-select виджетах выделение отделено от фокуса и делается Enter/Space. Семантику Delete APG не задаёт.

## Выводы

- Два семейства. В первом выделение следует за фокусом (Foblex, Blockly, Org Chart), и Delete всегда касается того, где стоит пользователь. Во втором фокус и выделение независимы (React Flow, ngx-vflow), и Delete берёт только выделение, отсюда эффект «удалился предыдущий». Ни одна из библиотек не делает гибрид «сфокусированный, если он не в выделении».
- Переводить ngx-vflow в первое семейство не стоит: Tab начал бы менять прикладное состояние выделения, что противоречит принятой модели (фокус не меняет выделение, множественное выделение через модификатор).
- Глобальные обработчики Delete (React Flow) дают известные баги: срабатывание при потере фокуса flow (#4263), внутри полей с модификаторами (#3416, #3939). Команда на сфокусированной обёртке этих проблем не имеет.

## Рекомендация

Оставить фокус и выделение независимыми и применить правило: если сфокусированная сущность входит в выделение, запрос содержит всё выделение; иначе только её. Пустое выделение при этом перестаёт быть тихим отказом.

## Источники

- https://reactflow.dev/learn/advanced-use/accessibility
- https://raw.githubusercontent.com/xyflow/xyflow/main/packages/react/src/hooks/useGlobalKeyHandler.ts
- https://raw.githubusercontent.com/xyflow/xyflow/main/packages/react/src/components/NodeWrapper/index.tsx
- https://github.com/xyflow/xyflow/issues/4263, https://github.com/xyflow/xyflow/issues/3416, https://github.com/xyflow/xyflow/issues/3939
- https://flow.foblex.com/docs/accessibility
- https://raw.githubusercontent.com/Foblex/f-flow/main/CHANGELOG.md (19.0.0)
- https://www.ngdiagram.dev/docs/guides/shortcut-manager
- https://www.ngdiagram.dev/docs/api/types/configuration/shortcuts/keyboardactionname
- https://www.ngdiagram.dev/docs/changelog/
- https://dev.to/wojciechkrzesaj/why-your-accessibility-tools-cant-see-your-diagram-5f3
- https://docs.blockly.com/guides/configure/web/keyboard-nav
- https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
