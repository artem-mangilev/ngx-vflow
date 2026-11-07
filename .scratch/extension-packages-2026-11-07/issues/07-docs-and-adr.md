# 07. Docs «Packages», замена STUDIO-страниц, ADR и releasing.md

Status: ready-for-agent
Type: task
Blocked by: 03, 04, 05, 06

## Что сделать

- Категория `Packages` (создана в 03): страницы Routing, Auto size, Layout (с подстраницами или секциями dagre/elk/d3-force). Структура страницы: установка (`npm i @vflow/<name>` + peer), минимальный пример, API-таблица, ограничения (из spec), ссылка на исходники.
- Cookbook: `smart-curves`, `group-auto-scaling`, `expand-collapse`, `node-position-animation` — снять `@status:primary STUDIO`, убрать `PaidIframeComponent` и текст «part of Vflow Studio», подключить демо из пакетов (или удалить страницу и оставить ссылку из Packages — решить по месту; `node-position-animation` становится секцией `animate` в Layout). `mermaid-clone` остаётся STUDIO. Если `PaidIframeComponent` больше нигде не используется — удалить.
- `README.md` корня и `libs/ngx-vflow/README.md`: таблица пакетов экосистемы.
- ADR-0008: абзац про префикс `vx` у пакетов-расширений. Новый ADR-0010 «First-party extensions ship as separate `@vflow/*` packages in one fixed release group» (почему не secondary entries ядра, optional peers, только публичный API).
- `docs/releasing.md`: список пакетов группы, optional peers `@vflow/layout`, обновить «Add a package» по опыту 03.
- CONTEXT.md: термины «Layout algorithm», «Auto-size parent» (или уточнить «First-party extension»), если `/domain-modeling` их потребует.

## Готово, когда

- `nx build docs` (production и hybrid) зелёные; ng-doc не ломается на keyword-ссылках (память: `*word` в инлайн-коде — ссылка).
- Ни одна страница не ссылается на `vflow-studio.com/embed/{smart-curves,group-auto-scaling,expand-collapse,node-position-animation}`.
