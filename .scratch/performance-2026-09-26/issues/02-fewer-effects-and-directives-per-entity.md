# 02. Меньше эффектов и директив на сущность

Status: needs-triage
Type: task
Blocked by: —

Создание ~10 000 обёрток — крупнейшая оставшаяся статья загрузки: ~0.93 с в prod-профиле внутри Angular core (создание LView, инстанцирование директив, первый прогон эффектов). На каждую обёртку узла приходится пять директив (`node`, `vflowA11y`, `vflowKeyboardEntity`, `viewportVisibility`, `nodeHandlesController`/`nodeResizeController` внутри) и ~10 эффектов: в куче 102 915 `EffectRefImpl` и 9 801 `AfterRenderEffectSequence` на 9 799 сущностей.

Направления:

- Объединить `viewportVisibility`, `vflowA11y`, `vflowKeyboardEntity` в host-логику `NodeComponent`/`EdgeComponent` (одна директива меньше — минус один инстанс, инжектор-узел и набор host-биндингов на элемент).
- Заменить per-entity эффекты записи в DOM (`display`, `transform`, `zIndex`, `visibility`) одним проходом уровня flow: сервис держит список «грязных» моделей и пишет стили пачкой в `afterRenderEffect`/rAF. Это и есть «вынос за пределы CD»: 10 000 эффектов превращаются в один.
- `afterRenderEffect` на узел (`NodeResizeControllerDirective`, `NodeHandlesControllerDirective`) заменить одним проходом на flow (см. issue 03).

Метрика: `profile.mjs load` в prod — целевой self-time `chunk-<core>` ниже 0.5 с; количество `EffectRefImpl` в `heap.mjs` в разы меньше.
