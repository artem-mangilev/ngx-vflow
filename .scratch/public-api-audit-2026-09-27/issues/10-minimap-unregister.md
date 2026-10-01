# 10. `<mini-map>` снимает регистрацию при уничтожении

Status: ready-for-agent
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
