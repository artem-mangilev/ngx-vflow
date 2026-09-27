# 05. Снап при resize

Status: needs-triage
Blocked by: 01

Двигаемые края ресайзера — к краям других узлов; draw.io ещё подбирает размер под соседа, Miro показывает направляющую при совпадении размеров. У tldraw, Excalidraw и Penpot при resize снапаются только двигаемые углы/края, без промежутков. Конвейер ресайзера отдельный (`node-resize-controller.directive.ts`, `sizeMode`); нужно решить, делить ли `utils/alignment.ts` с ним.
