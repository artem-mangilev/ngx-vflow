# 03. `withAccessibility`, инпут `ariaLabelConfig` удаляется

Status: resolved
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

## Comments

2026-11-08, сделано:

- `features/with-accessibility.ts`: токен `VFLOW_ARIA_LABELS: InjectionToken<Signal<Partial<AriaLabelConfig>>>` и `withAccessibility(labels: FeatureValue<AriaLabelConfig>)` поверх `provideMergedFeatureValue`; экспорт из `public-api`.
- Инпут `ariaLabelConfig` удалён из `VflowComponent`; `bindVflowInputs` биндит `settings.ariaLabels` на `computed(() => withDefaults(DEFAULT_ARIA_LABEL_CONFIG, labels?.()))`. Читатели не менялись.
- Спеки: `accessibility.spec.ts` и `keyboard-navigation.spec.ts` держат сигнал меток на хосте и отдают его через `providers: [provideVflow(withAccessibility(() => inject(HostComponent).labels))]` — фабрика в контексте инжектора хоста видит сам хост-компонент, forwardRef не нужен; `settings-inputs.spec.ts` без метки-инпута (его тест переехал в новый спек).
- Новый `provided-accessibility.spec.ts` — 4 теста: английские дефолты без провайдера; корень как дефолты + ключи; хост поверх корня по ключам (`aria-roledescription`); фабрика с `inject()` и живой сигнал — меняются `aria-label` флоу, роль ноды и инструкция клавиатуры в описании.
- Docs: `accessibility-demo` (поле `labels` стало public, провайдер читает его через `inject(AccessibilityDemoComponent)`), `shortcuts-configuration-demo` (статичная метка в providers), раздел Localization страницы Accessibility переписан на `withAccessibility`. Страница Migration — тикет 05.
- Побочная находка: `vuiControls` читал `flow().minZoom()`/`maxZoom()` из инпутов — см. дополнение в тикете 02 (`VflowComponent.settings`).
- Проверено: `nx test ngx-vflow` 478 + 44 (node-dom) зелёные; `nx lint ngx-vflow`, `nx lint ui`, `nx lint docs` чистые; `nx build ngx-vflow` — `ariaLabelConfig` в `index.d.ts` отсутствует, `withAccessibility`/`VFLOW_ARIA_LABELS` есть, `ɵ` не прибавилось; `nx build docs` проходит.
