# 04. `will-change: transform` на вьюпорте

Status: wontfix
Type: prototype
Blocked by: —

Гипотеза: композитный слой для `.vflow-viewport` уберёт перерисовку узлов при pan и перенесёт движение в compositor.

## Answer

Отвергнуто замером (stress-test, 1 024 видимых узла, headed, DPR 2): pan 1 → 78 потерянных кадров, `Layerize` 29 → 980 мс за 2 с. Каждый узел — `position: absolute` с собственным `transform` и `z-index`; внутри композитного предка Chrome перерешает слоение всех этих paint chunk'ов на каждом кадре. Без `will-change` pan и так дешёв: смещение применяется через paint offset без перезаписи display list (885 Paint за фазу против 78 000 в zoom). Не применять.
