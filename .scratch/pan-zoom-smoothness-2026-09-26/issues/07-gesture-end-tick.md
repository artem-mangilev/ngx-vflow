# 07. Конец zoom-жеста: tick 22 мс и пауза 25–39 мс

Status: needs-triage
Type: research
Blocked by: —

Во всех прогонах `zoomoutpan` (spec.md) через ~700–900 мс после начала zoom-out, то есть в конце жеста, есть один `TimerFire → FunctionCall` (tick планировщика Angular по setTimeout) на 22 мс и рядом интервал 25–39 мс между кадрами, в котором главный поток, растр и GPU пусты. На 144 Гц это 3–5 кадров, но движение к этому моменту уже остановилось. Кандидаты: `sync()` culling по таймеру 300 мс, запись `--vflow-zoom` через host-биндинг и связанный с ней recalc видимых элементов, CD оболочки docs. В headed CPU-профиле (`profile.mjs` с `HEADED=1 DPR=2 BIG=1`, сценарии `out13,settle`) tick такого размера не воспроизвёлся (максимальный кадр 24 мс, длинных нет), поэтому нужна трасса с JS-стеками (CDP `Profiler` внутри `frametrace.mjs`) на реальном вводе.
