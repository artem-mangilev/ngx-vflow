# 01. Ленивые `toObservable` в моделях и общий инжектор вместо `createModelInjector` на модель

Status: needs-triage
Type: task
Blocked by: —

`NodeModel` создаёт пять `toObservable` (`point$`, `width$`, `height$`, `selected$`, `handles$`) и `EdgeModel` один (`detached$`) eagerly, каждый — эффект + `ReplaySubject` + `Observable`. Снапшот кучи демо Virtualization (dev): 34 314 `ReplaySubject`, 44 406 `Observable`, ~20 000 `OperatorSubscriber`. Кроме того `createModelInjector()` создаёт `EnvironmentInjector` на каждую модель: 9 806 `R3Injector` с `Map` записей и хуками уничтожения.

Предложение:

- `point$`/`width$`/… сделать геттерами, создающими `toObservable` при первом обращении (или заменить внутренних потребителей — `NodeHandlesControllerDirective.handles$`, `ChangesControllerDirective`, `DraggableService` — на прямые сигналы/эффекты).
- Один `EnvironmentInjector` на flow (`FlowEntitiesService`) с `DestroyRef`, привязанным к модели через `onDestroy`-реестр, вместо инжектора на модель.

Ожидаемый эффект: заметная часть 0.23 с GC при загрузке и ~10–20 MB кучи в prod; меньше эффектов, которые Angular обходит на каждом tick. Перемерить `heap.mjs` и `profile.mjs load`.
