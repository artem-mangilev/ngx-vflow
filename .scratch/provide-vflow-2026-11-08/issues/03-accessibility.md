# 03. `withAccessibility`, инпут `ariaLabelConfig` удаляется

Status: ready-for-agent
Type: task
Blocked by: 01

Спецификация: [spec.md](../spec.md), решение 3.

## Что сделать

- Токен `VFLOW_ARIA_LABELS: InjectionToken<Signal<Partial<AriaLabelConfig>>>`; `withAccessibility(value: Partial<AriaLabelConfig> | (() => Partial<AriaLabelConfig> | Signal<Partial<AriaLabelConfig>>))` → `vflowFeature('accessibility', [provideMerged(VFLOW_ARIA_LABELS, value)])`.
- Удалить инпут `ariaLabelConfig` из `VflowComponent`. В `bindVflowInputs`: `settings.ariaLabels` биндится на `computed(() => withDefaults(DEFAULT_ARIA_LABEL_CONFIG, provided?.() ?? {}))`. Читатели (`EntityAccessibilityDirective`, `KeyboardLabelsService`, `LiveRegion`, минимапа) не меняются.
- Docs-демо: `accessibility-demo.component.ts` и `shortcuts-configuration-demo.component.ts` переводятся на `providers: [provideVflow(withAccessibility(...))]`; спеки, использующие `[ariaLabelConfig]` (`settings-inputs.spec.ts`, `accessibility.spec.ts`, `keyboard-navigation.spec.ts` — проверить grep), переводятся на провайдер.
- Экспорт: `VFLOW_ARIA_LABELS`, `withAccessibility`.

## Готово, когда

- Спек: корневой `withAccessibility` меняет `aria-label` флоу и `aria-roledescription` ноды; компонентный поверх корневого сливается по ключам; фабрика с `inject()`; сигнал с новыми текстами меняет атрибуты и инструкции клавиатуры без пересоздания флоу; без провайдера — английские дефолты.
- `grep ariaLabelConfig libs apps` пуст, кроме страницы миграции (тикет 05).
