# 01. Программные изменения viewport: лимиты zoom и без потерь

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.1, 1.2. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- `viewportTo({ x, y, zoom })` не ограничивает zoom: ветка `x`+`y` в `applyChange` (`directives/viewport-gestures.directive.ts:153-175`) берёт `state.zoom` без `clamp`, ветка «только zoom» ограничивает. Проба: `maxZoom=2`, `viewportTo({x:0, y:0, zoom:10})` → 10, `zoomTo(10)` → 2.
- Все программные изменения пишут в один сигнал `ViewportService.writableViewport`, а применяет его `effect` (`directives/viewport-gestures.directive.ts:105-109`). Две записи в одном тике — применяется последняя. Проба: `zoomTo(1.5); panTo({x:123, y:45})` → `{x:123, y:45, zoom:1}`. Так же пропадает `fitView(); zoomTo(1)`.
- Частичное состояние без пары `x`+`y` (например, `{ x }`) молча игнорируется.

Пишут в сигнал:

- `components/vflow/vflow.component.ts:579-613` (`viewportTo`, `zoomTo`, `panTo`);
- `services/viewport.service.ts:47-67` (`fitView`);
- `services/keyboard-viewport-commands.service.ts:23,36`;
- `directives/keyboard-entity.directive.ts:70`;
- `directives/auto-pan.directive.ts:95`;
- `public-components/minimap/minimap-canvas.directive.ts:289,315`.

## Сделать

- Заменить сигнал и effect императивным каналом: `ViewportService` синхронно передаёт изменение зарегистрированному исполнителю (`ViewportGesturesDirective`). Изменения, пришедшие до регистрации, ставятся в очередь и применяются по порядку. Заодно закрывается `TODO: add writableViewportWithConstraints` (`services/viewport.service.ts:44`).
- Каждое изменение строится от состояния после предыдущего: частичное состояние дополняется текущими значениями, zoom всегда проходит `clampZoom`.
- Изменение с `duration > 0` прерывает текущую анимацию. Следующее изменение строится от целевого состояния прерванной анимации, а не от промежуточного кадра. Это предложение; если оно спорно, решить в тикете 02.
- `changeType: 'initial'` и тип `WritableViewport` убрать, если после замены они не нужны.
- Публичные сигнатуры не менять — это тикет 02.

## Проверки

- spec: `zoomTo(1.5); panTo({x:123, y:45})` → `{x:123, y:45, zoom:1.5}`.
- spec: `fitView(); zoomTo(1)` → zoom 1, translation отличается от начальной.
- spec: `viewportTo({x:0, y:0, zoom:10})` при `maxZoom=2` → zoom 2.
- spec: вызов до создания директивы применяется после неё.
- Зелёные `viewport-gestures.spec`, `minimap-navigation.spec`, `keyboard-navigation.spec`, `auto-pan.spec`, `initial-viewport.spec`.

## Answer

Сделано 2026-10-01.

- **Канал изменений.** Сигнал `writableViewport` и effect заменены на `ViewportService.change(state, duration)`. `ViewportGesturesDirective` регистрируется через `connect()` и применяет изменения синхронно. Изменения, пришедшие до регистрации, ждут в очереди и применяются по порядку. `WritableViewport`, `ViewportChangeType` и TODO про ограничения удалены; новый тип — `ViewportChange`.
- **Композиция.** Изменение строится от цели анимации в процессе или от текущего viewport. Пропущенные `x`/`y` берутся оттуда же, zoom всегда проходит `clamp`. Zoom без `x`/`y` масштабирует вокруг центра pane, как раньше. Изменение без `duration`, запрошенное в той же задаче, что и анимация, строится от её цели ещё до первого кадра.
- **Без лишних подписок.** Применение читает viewport и лимиты zoom `untracked`. Иначе `zoomTo()` из пользовательского `effect` подписывал бы этот effect на viewport, и тот зацикливался. Проверено мутацией: без `untracked` новый тест вешает браузер.
- **Публичные сигнатуры не менялись.** `viewportTo`/`zoomTo`/`panTo` получили JSDoc про лимиты и порядок.
- **Migration guide** (раздел «Gestures without d3»): `viewportTo` ограничивает zoom; вызовы складываются.
- **Отклонение от тикета.** Отдельного spec `fitView(); zoomTo(1)` нет. Тот же механизм покрыт двумя specs: `zoomTo(1.5); panTo(…)` и «анимация → `zoomTo` от её цели». Spec «вызов до создания директивы» написан на уровне сервиса (`services/viewport.service.spec.ts`): в компоненте директива создаётся вместе с `vflow`.

Тесты: `viewport-gestures.spec.ts` — 4 новых или изменённых, `services/viewport.service.spec.ts` — 2 новых. Полный набор `ngx-vflow` (372 spec) зелёный, кроме нестабильного `stacking-context.spec.ts` (см. ниже). Eslint и prettier по изменённым файлам чистые.

Вне тикета, на `origin/3.0`:

- **Сборка.** Production-сборка `ngx-vflow` сломана до этих изменений: NG3001 — `ViewportCullingDirective` подключён как host directive, но не экспортирован. С временным экспортом `ngx-vflow` и `ngx-vflow/testing` собираются; починка — отдельной задачей.
- **Нестабильный тест.** `stacking-context.spec.ts` падает от порядка тестов, на чистой базе — 1 прогон из 3; тоже отдельной задачей.
