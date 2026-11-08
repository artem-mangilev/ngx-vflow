# 10. Инпут `view` удаляется

Status: resolved
Type: task
Blocked by: 08

Решение пользователя 2026-11-08. `view` только пишет inline `width`/`height` на корень флоу (`FlowSizeControllerDirective`), а размер, которым пользуются минимапа, автопан и клавиатура, всегда приходит из ResizeObserver; в jsdom он не помогает (ADR-0009). Это CSS через инпут, вразрез с headless-принципом.

## Что сделать

- Удалить инпут `view` из `VflowComponent`, `view` из `FlowSettingsService` и `FlowSettingsSources`, биндинг в `bindVflowInputs`. `FlowSizeControllerDirective` теряет host-биндинги `style.width`/`style.height` (остаётся измерение); корень держит `width: 100%; height: 100%` в стилях компонента, как сейчас при `'auto'`.
- Спеки: `[view]="[w, h]"` → `style="width: wpx; height: hpx"` на элементе `vflow`; `view="auto"` и `[view]="'auto'"` просто убрать. Тест «fills the parent element by default» проверяет стили корня без `settings.view()`.
- Docs: `view="auto"` в демо убрать; где демо задаёт размер — стиль на `vflow` или в `styles` хоста; страница Viewport → View size (`view-size`) переписывается как «размер задаётся CSS» (демо auto/fixed остаются, но на стилях); Migration: раздел Settings inputs (абзац про `view`) заменить на «`[view]` удалён — задайте размер стилями», строка в Removed APIs; Configuration — убрать упоминание `view` в `withSettings`.
- `@vflow/ui`, пакеты: проверить grep.

## Готово, когда

- `grep -rn "\[view\]\|view=\"auto\"\|settings.view\|\.view()" libs apps` пуст, кроме страницы миграции.
- `nx test ngx-vflow`, lint, `nx build ngx-vflow` (`view` нет в `index.d.ts`), `nx build docs` зелёные; e2e страниц с размером (`resizer.spec`, `minimap-navigation`, design-system) — в тикете 06.

## Comments

2026-11-08, сделано:

- Инпут `view` удалён из `VflowComponent`, `view` — из `FlowSettingsService`; `FlowSizeControllerDirective` только измеряет корень; корень получил `width: 100%; height: 100%` в стилях компонента.
- 95 файлов переведены регулярными заменами: `[view]="[w, h]"` → `style="width: wpx; height: hpx"`, `view="auto"` убран, `setInput('view', …)` → стиль на `nativeElement`; `minimap-navigation.spec` биндит `[style.width.px]`/`[style.height.px]` от сигнала размера; `auto-pan.spec` — статичный стиль; тест «fills the parent element by default» сравнивает размеры корня и элемента `vflow`. Один спек получил два атрибута `style` — слиты; две ошибки `attributes-order` в демо поправлены `nx lint docs --fix`.
- Docs: страница View size переписана («размер — это CSS», демо на стилях), Migration (абзац и строка Removed APIs), Configuration (`withSettings` без оговорки про `view`).
- Проверено: `nx test` для ngx-vflow (492 + 44), layout, auto-size; lint ngx-vflow/docs/layout/auto-size; `nx build ngx-vflow` (`view` в `index.d.ts` нет); `nx build docs`. e2e — тикет 06.
