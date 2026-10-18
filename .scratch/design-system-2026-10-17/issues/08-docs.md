# 08. Документация: установка, исходники, токены

Status: needs-triage
Type: task
Blocked by: 05

## Что сделать

- Installation по образцу spartan: предусловие Tailwind v4 (ссылка на гайд Tailwind для Angular), `npm i -D @vflow/cli`, `init`, `ui`; ручная установка (пресет + значения тем); вкладки Nx / Angular CLI.
- Страница CLI (`init`, `ui`, `ui-theme`) и страница `vflow.json`.
- У каждой части — исходник файла; тема — атрибут `data-vui-theme`, выделение — вход `selected`.
- Страница токенов (из 01) — в навигации секции.
- Обновить `libs/ui/README.md`, CONTEXT.md (термин поставки) и migration guide 3.0.
- Установка `ngx-vflow` 3 без CLI: peer `@angular/cdk` в мажоре своего Angular (иначе npm берёт последний cdk и падает на ERESOLVE). Убрать из docs `@vflow/ui/styles.css` / `styles.source.css` (overview, migration guide).
