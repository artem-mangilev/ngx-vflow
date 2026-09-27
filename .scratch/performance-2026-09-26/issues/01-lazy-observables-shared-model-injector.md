# 01. Ленивые `toObservable` в моделях и общий инжектор вместо `createModelInjector` на модель

Status: resolved
Type: task
Blocked by: —

`NodeModel` создаёт пять `toObservable` (`point$`, `width$`, `height$`, `selected$`, `handles$`) и `EdgeModel` один (`detached$`) eagerly, каждый — эффект + `ReplaySubject` + `Observable`. Снапшот кучи демо Virtualization (dev): 34 314 `ReplaySubject`, 44 406 `Observable`, ~20 000 `OperatorSubscriber`. Кроме того `createModelInjector()` создаёт `EnvironmentInjector` на каждую модель: 9 806 `R3Injector` с `Map` записей и хуками уничтожения.

Предложение:

- `point$`/`width$`/… сделать геттерами, создающими `toObservable` при первом обращении (или заменить внутренних потребителей — `NodeHandlesControllerDirective.handles$`, `ChangesControllerDirective`, `DraggableService` — на прямые сигналы/эффекты).
- Один `EnvironmentInjector` на flow (`FlowEntitiesService`) с `DestroyRef`, привязанным к модели через `onDestroy`-реестр, вместо инжектора на модель.

Ожидаемый эффект: заметная часть 0.23 с GC при загрузке и ~10–20 MB кучи в prod; меньше эффектов, которые Angular обходит на каждом tick. Перемерить `heap.mjs` и `profile.mjs load`.

## Answer

Сделано: observables моделей (`point$`, `width$`, `height$`, `selected$`, `handles$`, `selected$` ребра) создаются при первом обращении через `observeSignal` (`utils/signals/observe-signal.ts`); неиспользуемый `EdgeModel.detached$` удалён; `createModelInjector` создаёт `EnvironmentInjector` только при первом `get()`.

Ленивый `toObservable` терял изменение, сделанное сразу после подписки (первый прогон эффекта отдавал уже изменённое значение как начальное, и `skip(1)` его съедал; упал unit-тест keyboard-navigation). `observeSignal` читает текущее значение при создании (`BehaviorSubject`) и отбрасывает повтор первого прогона эффекта `distinctUntilChanged`.

Общий инжектор на flow не понадобился: ленивого создания достаточно.

Замер `bench.mjs`, prod, 7 прогонов, медиана [min..max]:

| Метрика         | До                    | После                   |
| --------------- | --------------------- | ----------------------- |
| Куча после GC   | 321 MB [319.7..321.5] | 304.9 MB [304.1..305.5] |
| load.allNodesMs | 1937 [1849..2506]     | 1784 [1744..1897]       |
| load.readyMs    | 2411 [2316..3120]     | 2285 [2232..2668]       |
| pan.taskMs      | 573 [559..621]        | 529 [525..685]          |
| drag.taskMs     | 426 [410..435]        | 388 [381..412]          |

Оставлено: куча −16 MB при разбросе ±1 MB, взаимодействия −8–9%.
