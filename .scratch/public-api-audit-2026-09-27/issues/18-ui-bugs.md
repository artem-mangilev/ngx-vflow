# 18. `@vflow/ui`: peer-зависимость, дефолты атрибутов, docs, токены

Status: ready-for-agent
Type: task
Priority: P2
Blocked by: —

Отчёт: 1.8, 5. Пути — от `libs/ui/`.

## Сделать

- **Peer-зависимость.** `"ngx-vflow": "^2.7.0 || ^3.0.0"` (`package.json`) заменить на `^3.0.0`: `VflowPort` импортирует `VflowHandleDirective` и `HandleState` (`src/lib/port.directive.ts:2`), которых в 2.x нет.
- **Голый атрибут даёт `''` вместо дефолта:**
  - `<div vflowBpmnGateway>` → `data-gateway=""`, маркера нет (`bpmn/src/lib/bpmn.directive.ts:25-30`);
  - так же `vflowBpmnEvent`, `vflowBpmnFlow`;
  - `vflowTheme` получает не `light`, и `--vflow-background` не задаётся;
  - `vflowStatus` → `data-tone=""`.
  - Исправление: `transform: (value) => value || default`.
- **Lint.** Target не покрывает `bpmn` (`project.json`).
- **Docs:**
  - overview (`apps/docs/src/app/categories/design-system/overview/index.md:116-117`) утверждает, что кроме `vflow-controls` ничего не импортирует ngx-vflow, но `VflowPort` импортирует;
  - README называет inputs порта `type`/`id` вместо `handleType`/`handleId`;
  - README пишет, что UI «never changes roles», но `VflowControls` ставит `role=group`;
  - состояние порта `connecting` не упомянуто (overview:65).
- **Стили** (находки агента, визуально не проверено):
  - `rounded-lg` у toolbar, controls и BPMN task берёт Tailwind `--vui-radius-lg` (8px) мимо `--vui-radius`;
  - части с `text-xs` и кнопка (`text-[13px]`, `rounded-[7px]`) игнорируют `--vui-font-size`/`--vui-radius`;
  - `--vflow-focus-radius` равен `--vui-radius` для всех BPMN-форм, включая круглые события и ромбы;
  - `--vui-color-*` из тёмной темы протекают во вложенную светлую область (`src/styles.css:41-68`).

## Проверки

- spec или e2e: голые атрибуты дают дефолтные data-атрибуты.
- Сборка `apps/consumer` и `check-bundles.mjs`.
- Визуальная проверка стилей на docs-странице design-system.
