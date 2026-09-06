# Ревью ngx-vflow, 2026-09-05

> Ниже сохранены результаты первоначального аудита. Все пункты исправлены: [изменения и проверки](./implementation.md). Текущие проверки находятся в `projects/ngx-vflow-lib/src/lib/vflow/audit-regressions.spec.ts`; `run.sh` запускает их напрямую. Проверка удалённого кэша заменена проверкой поведения HTML label.

Проверен рабочий HEAD `84b852e8`. Исходники библиотеки не изменены. Проверены модели, рендеринг, жизненный цикл, уведомления, взаимодействия, публичные graph helpers и история перехода с SVG/foreignObject на HTML. Исторический срез до миграции — `5f0686e2`; решения сверены с ADR-0001–0004.

Результат: **9 воспроизведённых дефектов, 2 измеренных узких места и несколько конкретных удалений/упрощений**. Это аудит с приоритетами, а не гарантия отсутствия остальных ошибок. P1 — исправить в первую очередь; P2 — исправить следующим этапом; P3 — уборка.

## Проверки

- Штатный набор: `npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless --progress=false` — **175 SUCCESS**.
- Дополнительный набор: `bash .scratch/library-audit-2026-09-05/run.sh` — **9 FAILED, 2 SUCCESS**. Падающие проверки утверждают ожидаемое корректное поведение. Две успешные — контроль уведомлений selection и бенчмарк.
- Chromium Headless 152, macOS. Дополнительный набор выполняется примерно за 1,5 секунды после сборки и запуска браузера. Реальные D3 mouse events использованы для resizer; для остальных дефектов — реальные модели/сервисы в Angular TestBed, а для кэша — управляемые часы.
- Runner временно копирует spec в дерево библиотеки и удаляет его при выходе. Он ожидаемо возвращает ненулевой код, пока ошибки не исправлены. Полный build, e2e и проверка Safari в этот аудит не входили.
- Сохранены [актуальные регрессионные проверки](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/audit-regressions.spec.ts), [результат воспроизведений](reproduction.log), [штатный прогон](baseline.log).

## Ошибки внутренней логики и API

### 1. P1 — `reparentNodes` ломает координаты узла без исходного `parentId`

[node.model.ts:226](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/models/node.model.ts:226), [graph-operations.ts:165](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/utils/graph-operations.ts:165), [reference-identity-checker.ts:14](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/utils/identity-checker/reference-identity-checker.ts:14).

Узел создан вручную без `parentId`, уже отрисован и находится в `x=150`. У нового родителя `x=100`. Helper правильно записывает локальное `x=50` и добавляет сигнал `parentId` к прежнему объекту. Однако `NodeModel` привязывает приватный `parentId` только в конструкторе, а identity checker сохраняет модель по ссылке. Модель продолжает считать узел корневым: результат `globalPoint().x=50` вместо `150`. Связи и ограничения родителя также расходятся с raw state. Это прямо нарушает поддерживаемый сценарий issue 03 и migration guide, где отсутствие `parentId` разрешено.

Исправление: согласовать появление ранее отсутствовавшего сигнала с повторным использованием модели. Одного чтения `rawNode.parentId` внутри computed недостаточно без реактивной инвалидации: добавление свойства само по себе не реактивно.

### 2. P1 — уведомление `edgesChanges.detached` теряется

[edge-changes.service.ts:25](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/edge-changes.service.ts:25).

В графе два корректных ребра. У одного удаляется handle, у другого ничего не меняется. `edge.detached()` становится `true`, но событие не приходит. `zip` ждёт следующую эмиссию каждого ребра. Дополнительно `skip(2)` безусловно отбрасывает первые два объединённых результата. Другая ветка отслеживает существование узлов, поэтому удаление handle не компенсирует.

Исправление: один реактивный расчёт текущих detached-рёбер с явным сравнением переходов вместо двух потоков, `zip`, числового skip и квадратичного сравнения мультимножеств.

### 3. P1 — завершение connection зависит от подписки на другой output

[connection-controller.directive.ts:102](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/directives/connection-controller.directive.ts:102).

Подписаться только на `(connectEnd)`, начать соединение и отпустить его над допустимым handle: событие не приходит, статус остаётся `connection-release`. Переход в `connection-release-validated` спрятан в `tap` ленивого output `connect`. Без его подписчика переход вообще не выполняется. Сброс в idle аналогично спрятан в `connectEnd`; у reconnect повторена та же конструкция.

Исправление: валидацию и переходы состояния выполнять независимо от подписчиков; outputs должны только сообщать уже произошедший результат. В тесте непосредственно подтверждён вариант «есть connectEnd, нет connect».

### 4. P2 — удалённый handle остаётся концом нарисованного ребра

[edge.model.ts:143](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/models/edge.model.ts:143).

Сначала вычислить путь, затем удалить source handle через `handles.set([])`. При выключенной виртуализации `detached()` возвращает `true`, но `path().path` остаётся прежним. `sourceHandle`/`targetHandle` безусловно возвращают previousHandle, если текущий handle отсутствует. Это смешивает временное снятие DOM при виртуализации с настоящим удалением handle. Возможны ребро-призрак и интерактивная reconnection-точка на уже отсутствующем порте.

Исправление: сохранять геометрию только при виртуальном снятии представления, отдельно обрабатывать реальное отсутствие handle.

### 5. P2 — виртуализация не отсекает рёбра вне viewport

[edge-rendering.service.ts:21](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/edge-rendering.service.ts:21).

`viewportEdges` проверяет только наличие двух handles, но не координаты viewport. В проверке все узлы перемещены в `(100000,100000)`, `viewportNodes()` пуст, а renderer всё ещё возвращает оба ребра. После снятия DOM handles также сохраняются предыдущей логикой. По мере обхода большого графа рёбра не получают ожидаемого отсечения. `virtualizationZoomThreshold` тоже применяется только к узлам.

Исправление: проверять пересечение геометрии ребра с viewport; нельзя проверять только видимость его узлов, поскольку линия между двумя невидимыми узлами может пересекать экран. Это нарушение контракта `Optimization.virtualization`, а не предложение сменить SVG-архитектуру.

### 6. P2 — кэш размеров теряет последнюю инвалидацию

[element-cache.service.ts:38](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/element-cache.service.ts:38), [edge-label.component.ts:141](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/components/edge-label/edge-label.component.ts:141).

После чтения ширины 100 элемент меняет ширину на 200 через 8 мс. `markCacheAsDirty()` игнорирует изменение. Даже через 100 мс следующее чтение возвращает 100: ни отложенного обновления, ни проверки возраста на чтении нет. Поэтому HTML label может остаться смещённым после окончательного изменения текста/размера. Это особенно достижимо на экранах с частотой выше 60 Гц.

Минимальное исправление — не отбрасывать dirty-событие. Предпочтительное упрощение после перехода на HTML — убрать измерение label целиком, см. ниже.

### 7. P2 — `shouldResize=false` всё равно меняет внутреннюю принятую геометрию

[resizer.ts:284](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/public-components/resizable/resizer.ts:284).

Начальная ширина 100. Разрешить шаг до 110, запретить следующий шаг до 120 и отпустить мышь. Фактическая ширина остаётся 110, но `resizeEnd` сообщает 120. `prevValues` и позиции детей изменяются до вызова `shouldResize`, поэтому отказ не откатывает внутреннее состояние. Приложение, сохраняющее конечный размер по событию, получает неверные данные.

Исправление: сначала вычислять кандидата, после допуска фиксировать prevValues и позиции детей.

### 8. P2 — notification положения содержит неподвижные узлы и размножает работу

[node-changes.service.ts:29](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/node-changes.service.ts:29).

Выделить B и программно передвинуть только A. Сервис сообщает position для A и B. При перетаскивании K выделенных узлов каждый из K потоков добавляет остальные выделенные узлы: до K² записей за обновление вместо K. К этому добавляются повторные проходы по всему графу и фиксированная задержка 25 мс. Неподвижные элементы ошибочно попадают в сохранение, синхронизацию или историю приложения.

Исправление: каждый поток сообщает только действительно изменившийся узел; если нужны пакеты, объединять реальные изменения один раз.

### 9. P2 — удаление модели не завершает её Angular effects

[node.model.ts:280](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/models/node.model.ts:280), [reference-identity-checker.ts:10](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/utils/identity-checker/reference-identity-checker.ts:10), [vflow.component.ts:416](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/components/vflow/vflow.component.ts:416).

Модели создают `toObservable` в injector всего vflow. При исключении узла/ребра из массива identity checker лишь перестаёт возвращать модель; отдельного dispose нет. В установленном Angular `toObservable` создаёт eager effect с cleanup через DestroyRef injector. Поэтому эти effects живут до уничтожения всего vflow, а не до удаления модели. Тест удаляет узел, меняет его прежний signal и фиксирует, что библиотечный watcher всё ещё читает его без подписчиков.

При длительном редактировании с добавлениями/удалениями или immutable-заменами число watcher и удерживаемых ими ссылок растёт. Это подтверждение незавершённой подписки/effect, не измерение retained heap в байтах.

Исправление: явный lifecycle модели и уничтожение её effects при структурном удалении; снятие DOM из-за виртуализации само по себе модель удалять не должно. Также удалить лишний первый `selected$ = toObservable(this.selected)` у EdgeModel: конструктор создаёт его повторно.

## Производительность: измеренные узкие места

Одинаковый синтетический workload в Chromium: N узлов и N рёбер для validEdges; удаление всех N независимых узлов без рёбер для removeNodes. Для validEdges — медиана 7 вычислений. Для удаления — один прогон на размер; повторные запуски набора дали близкие результаты. Рендеринг и создание NodeModel не входят в эти замеры.

|      N |         validEdges | removeNodes |
| -----: | -----------------: | ----------: |
|  1 000 |   около 0,1–0,2 мс |    17–27 мс |
|  5 000 |   около 2,8–2,9 мс |  135–143 мс |
| 10 000 | около 10,7–11,1 мс |  502–535 мс |

### 10. P2 — массовое удаление повторно строит индекс и фильтрует коллекции

[graph-operations.ts:73](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/utils/graph-operations.ts:73).

На каждый id заново сканируется массив, строится children map и фильтруются оставшиеся узлы/рёбра. Для удаления всех независимых узлов получается O(N²) и блокировка главного потока примерно на полсекунды при 10 000 узлах. В файле уже отмечено сознательное ограничение linear scans; замер показывает, где оно становится значимым. В построении children map дополнительно копируется массив siblings при каждом добавлении.

Исправление: один индекс id/children на вызов, множества обработанных/удалённых элементов и заключительная фильтрация. Сохранить заданную спецификацией обработку слева направо, неоднозначные id, циклы и порядок результатов.

### 11. P2 — проверка допустимости рёбер имеет стоимость O(E×V)

[flow-entities.service.ts:56](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/flow-entities.service.ts:56).

`validEdges` выполняет два `nodes.includes` на каждое ребро. Это около 11 мс на 10 000 узлов/рёбер до остальной работы по обновлению графа. Вычисление кэшируется Angular computed: это не утверждение о 11 мс на каждый mousemove; стоимость возникает при изменении соответствующих зависимостей.

Исправление: создать Set моделей один раз на вычисление и использовать `has`. Уже существующий nodeByIdMap также можно использовать для адресных запросов (`getNode`, выбор узлов в fitView).

## ForeignObject и необоснованная сложность

- **native:** центрирование HTML edge labels больше не требует ResizeObserver, rAF, кэша и `EdgeLabelModel.size`. Размер используется только для вычитания половины ширины/высоты. Достаточно позиционировать host в точке пути и применить `translate(-50%, -50%)` к HTML wrapper. После этого можно удалить BasicElementCacheService и базовый ElementCacheService, если удалить также два уже мёртвых наследника. История `5f0686e2` подтверждает происхождение измерений из foreignObject. [edge-label.component.ts:71](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/components/edge-label/edge-label.component.ts:71).
- **delete:** HtmlElementCacheService и SvgGraphicElementCacheService остались только как определения, imports и providers; реальных потребителей нет. В 2.x ими пользовался HandleModel, теперь он вычисляет/измеряет геометрию иначе. Удалить оба файла и DI-проводку. [html-element-cache.service.ts](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/html-element-cache.service.ts), [svg-graphic-element-cache.service.ts](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/svg-graphic-element-cache.service.ts).
- **delete:** `NodeModel.styleWidth/styleHeight` не читаются; старые foreignObject templates читали их. `ToolbarModel.transform` тоже потерял потребителя после переноса toolbar в HTML layer. `NodeRenderingService.nonGroups` не читается. Удалить эти поля. [node.model.ts:91](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/models/node.model.ts:91), [toolbar.model.ts:36](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/models/toolbar.model.ts:36), [node-rendering.service.ts:35](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/node-rendering.service.ts:35).
- **yagni:** PreviewFlowRenderStrategyService имеет единственную реализацию из `return !node.isVisible()`, одного потребителя и не является публичным extension point. Вызвать эту проверку непосредственно в preview renderer, удалить два класса и provider. [preview-flow-render-strategy.service.ts](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/preview-flow-render-strategy.service.ts).
- **native:** локальный `outputRefToObservable` повторяет `outputToObservable` из уже установленного `@angular/core/rxjs-interop`. Публичный helper подтверждён в локальном Angular 19; новой зависимости не нужно. [custom-node.component.ts:87](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/public-components/custom-node/custom-node.component.ts:87).
- **delete:** четыре неиспользуемых injected сервиса в FlowRenderingService и соответствующие imports. Они не участвуют в определении initialized: сейчас оно просто ждёт два animation frames. Удаление этих полей не исправляет возможную семантику initialized; ожидание загрузки async components отдельно не проверялось. [flow-rendering.service.ts:9](/Users/artemmangilev/Documents/dev/ngx-vflow/projects/ngx-vflow-lib/src/lib/vflow/services/flow-rendering.service.ts:9).

Оценка упрощения с CSS labels: **net: примерно −200 строк, −0 зависимостей**. Это оценка кандидатов, не измеренный diff исправления; один только набор четырёх cache-файлов содержит 111 строк.

Не удалять `NodeModel.pointTransform`: он используется SVG minimap. Отдельные SVG roots рёбер сохраняют interleaving через z-index по ADR-0001; без отдельного paint benchmark менять этот выбор оснований нет. Сами ResizeObserver для размеров HTML nodes и геометрии custom handles всё ещё нужны. Проблема с selected notifications не подтвердилась — соответствующий контрольный тест проходит.
