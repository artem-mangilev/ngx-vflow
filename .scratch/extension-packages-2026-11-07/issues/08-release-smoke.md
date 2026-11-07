# 08. Release dry-run и smoke на тарболлах

Status: ready-for-agent
Type: task
Blocked by: 07

Образец: `.scratch/design-system-2026-10-17/issues/07-consumer-smoke.md`, `docs/releasing.md` («Preview locally», «Migration verification»).

## Что сделать

- `npm run build`, `npm run release:dry-run`: группа содержит `ngx-vflow`, `@vflow/cli`, `@vflow/routing`, `@vflow/auto-size`, `@vflow/layout`, одна версия `3.0.0`, changelog один.
- `npm pack` каждого `dist/libs/*`; свежее Angular 20 приложение (scratchpad): установить тарболлы, `@dagrejs/dagre`, `elkjs`; компонент с `avoidNodesCurve`, `vxAutoSize`, `vxLayout` + `dagreLayout`; `ng build` проходит; бандл без `/elk` не содержит `elkjs`.
- Проверить `package.json` в dist: `exports` для secondary entries `@vflow/layout/{dagre,elk,d3-force}`, `peerDependenciesMeta`, `sideEffects: false`, `LICENSE`/`README` в тарболле.
- CI: `npm run e2e` включая новые `routing.spec.ts`, `auto-size.spec.ts`; `E2E_CONFIGURATION=production` для «NgDoc uses».

## Готово, когда

- Отчёт в `## Comments` этого тикета: версии, размер тарболлов, результат сборки потребителя, что не проверено (npm-авторизация, как в releasing.md).
