# 05. Без чтения сигналов в host-биндингах сущностей

Status: resolved
Type: task
Blocked by: —

Embedded view в Angular делят реактивного потребителя с view компонента (`viewShouldHaveReactiveConsumer`: «all embedded views share a consumer with the component view… refresh at the component level»). Host-биндинги `[style.visibility]="model().isReady()…"` узла, `[attr.tabindex]="…focusable()"` keyboard-entity и `[style.visibility]` edge-label живут во view списка `@for` шаблона `vflow`, поэтому их сигналы — продюсеры потребителя всего шаблона. При pan на большом flow входящий узел дважды переключает `isReady` (сброс измерения), и весь шаблон `vflow` перезапускался: `ɵɵrepeater`/`reconcile` по 4 900 + 4 899 элементам и host-биндинги 9 800 view (в профиле pan: `VflowComponent_Template` 10 мс, `reconcile` 10 мс, `processHostBindingOpCodes` 35 мс на 49 кадров).

Решение: эти три биндинга переписаны в `effect` (view-эффект посещается только в своём грязном view).

## Answer

Сделано. CPU-профиль pan (headless dev, 51 кадр): script 114 → 45 мс, `VflowComponent_Template` больше не выполняется во время pan; tick 95 → 23 мс. Правило добавлено в spec.md.
