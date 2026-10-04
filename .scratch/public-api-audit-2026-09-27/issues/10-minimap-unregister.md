# 10. `<mini-map>` снимает регистрацию при уничтожении

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.5. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

`MiniMapComponent` регистрирует шаблон в `ngOnInit` (`public-components/minimap/minimap.component.ts:35-40`) и не снимает его. `flowEntitiesService.minimap` не сбрасывается, и `vflow` продолжает рендерить шаблон уничтоженного компонента (`components/vflow/vflow.component.html:90-94`).

Проба: `@if (show) { <mini-map /> }`, затем `show=false` → canvas остаётся.

## Сделать

- `ngOnDestroy`: сбросить `flowEntitiesService.minimap`, если там модель этого экземпляра. Образец — `ResizableComponent.ngOnDestroy` (`public-components/resizable/resizable.component.ts:119-124`).
- Проверить, что `MinimapCanvasDirective` освобождает слушатели и observer'ы при уничтожении.

## Проверки

- spec в `public-components/minimap/minimap-navigation.spec.ts`:
  - включить → canvas есть;
  - выключить → `.vflow-minimap` нет;
  - включить снова → pan/zoom миникарты работают.

## Comments

- 2026-10-04: реализовано. `VflowMinimapComponent.ngOnDestroy` сбрасывает `flowEntitiesService.minimap`, только если там модель этого экземпляра (как `VflowResizableComponent`). `MinimapCanvasDirective` уже освобождал слушатели window/media query, wheel, `MutationObserver` и pointer capture через `DestroyRef`; менять не пришлось. Мок `VflowMinimapMockComponent` получил пустой `ngOnDestroy` (иначе не сходится `AsInterface`). Spec `unregisters when destroyed and navigates again when shown back` в `minimap-navigation.spec.ts` падает без фикса. Полный прогон в ChromeHeadless: 411/411. В оконном Chrome rAF-тесты флейкают из-за троттлинга фонового окна, и на чистом дереве тоже.
- 2026-10-04: регистрация заменена проекцией. Ручной портал (`MinimapModel` в `FlowEntitiesService.minimap` + `ngTemplateOutlet` под `@if` в `vflow`) удалён; в `vflow` стоит `<ng-content select="v-minimap" />`. Хост `<v-minimap>` сам стал слоем `.v-minimap` (absolute, inset 0, z-index 2, `role="img"` через `bindEntityAccessibility`) и прячется до `initialized` собственной привязкой `visibility`: стиль `:host(.v-initializing) .v-minimap` у `vflow` эмулированной инкапсуляцией к спроецированному хосту не применяется. `ngOnInit`/`ngOnDestroy` и стабы в моке больше не нужны. `@if`/`@for` с минимапой единственным корнем проецируются (Angular 20). Обёртка без `ngProjectAs="v-minimap"` не рендерится: в dev-режиме предупреждение. Migration guide (DOM compatibility) и страница Minimap дополнены. ChromeHeadless 413/413, lint и build зелёные, на docs-странице проверено в Playwright.
