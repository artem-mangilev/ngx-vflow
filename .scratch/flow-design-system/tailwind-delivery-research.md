# Поставка CSS и Tailwind для @vflow/ui

Дата: 2026-09-07. Исследование официальной документации Tailwind v4 и текущего MVP. Рекомендация ниже — предложение для обсуждения.

## Что поставляется сейчас

- [Сборка](../../libs/ui/project.json) сначала запускает ng-packagr, затем Tailwind CLI с `--minify`, выдавая готовый `dist/libs/ui/styles.css`.
- [Пакет](../../libs/ui/package.json) экспортирует `./styles.css`; Tailwind не является dependency/peerDependency потребителя. CSS помечен как side effect.
- [Исходный CSS](../../libs/ui/src/styles.css) импортирует theme и utilities с `prefix(vui)`, отключает автоматический поиск и задаёт `@source './'`. Preflight отсутствует.
- Однако содержимое библиотеки оформляется обычными правилами `.vui-*` внутри `@layer vui`; директивы назначают такие же статические классы. Поиск `vui:` в TypeScript UI не нашёл utility strings.
- Имеющийся артефакт CSS занимает 4904 байта до gzip; заново не собирался, поэтому это наблюдение текущего dist, не гарантированный бюджет будущей версии.

## Что даёт компиляция на стороне потребителя

| Возможность                                                 | Условия и ограничение                                                                                                                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Генерация нужных utility classes из библиотеки и приложения | Работает, когда библиотека действительно использует Tailwind utilities. Сканирование пакета видит весь зарегистрированный текст, а не только Angular-директивы, пережившие tree shaking. |
| Общий набор utilities вместо отдельных сборок               | Возможен при совместимом compiler/theme/prefix. Две независимые CSS-сборки не объединяются автоматически; разные префиксы дают разные селекторы. Экономию надо измерять.                 |
| Привязка к теме приложения                                  | Utilities могут использовать определённые приложением `@theme` tokens. Но готовый CSS с обычными custom properties тоже позволяет привязку к теме без повторной компиляции.              |
| Собственные variants и utility-оформление                   | Удобно пользователю Tailwind; собственные классы можно добавлять и поверх готового CSS при согласованном cascade order.                                                                  |

Это выводы для нашей модели из механизмов [source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files), [theme variables](https://tailwindcss.com/docs/theme) и [prefix/import options](https://tailwindcss.com/docs/preflight#disabling-preflight). Они не означают автоматического выигрыша для текущего MVP.

## Важные ограничения

Tailwind не сканирует `node_modules` автоматически: внешний пакет регистрируют через `@source`, относительно stylesheet. Ищутся полные строки классов; интерполяцию вроде `bg-${tone}-500` компилятор не вычисляет. Для отсутствующих в исходниках классов есть `@source inline()`. Следствие: source-поставка требует поддерживать обнаруживаемый список классов и проверять опубликованный пакет, а не только monorepo. [Официальный контракт](https://tailwindcss.com/docs/detecting-classes-in-source-files).

`@source` регистрирует текст для поиска utilities; оно не заменяет `@import` CSS с правилами `.vui-node` и темой. В v4 `@layer` является обычным cascade layer, а пользовательские utilities регистрируются через `@utility`. Поэтому Tailwind сам по себе не удаляет неиспользуемые правила текущего `@layer vui`. [Миграция custom utilities](https://tailwindcss.com/docs/upgrade-guide#adding-custom-utilities).

Локальная проверка через установленный `tailwindcss.compile()` с CSS `@layer vui { .vui-node { color: red } .vui-unused { color: blue } }` и `build([])` сохранила оба правила. Никакого pruning этого CSS перенос сборки потребителю не добавляет.

Передача исходного stylesheet также передаёт потребителю требования к Tailwind compiler и build integration: PostCSS/CLI в v4 имеют отдельные пакеты. Нужно согласовать версии, prefix, импорт theme и общий порядок layers. [Build integration v4](https://tailwindcss.com/docs/upgrade-guide#using-postcss), [prefix для theme и utilities](https://tailwindcss.com/docs/preflight#disabling-preflight).

## Интеграция с Tailwind без пересборки библиотечных стилей

Потребитель может импортировать готовый CSS и связать общие токены UI со своей темой обычным CSS. Для классов в собственных шаблонах можно дополнительно объявить алиасы:

```css
@import 'tailwindcss';
@import '@vflow/ui/styles.css';

@theme inline {
  --color-flow-surface: var(--vui-surface);
  --color-flow-content: var(--vui-foreground);
}
```

Тогда `bg-flow-surface` и `text-flow-content` будут читать токены текущего DOM-поддерева. `inline` важен для алиасов на другие custom properties; документация объясняет иначе возможное разрешение значения на неподходящем предке. Это иллюстрация механизма, не уже опубликованный integration API. [Referencing other variables](https://tailwindcss.com/docs/theme#referencing-other-variables).

## Предложение

Оставить готовый CSS основным способом поставки; проверить его у потребителей с Tailwind и без него. Документировать overrides обычным CSS и короткий пример `@theme inline`, сохраняя согласованные общие CSS-токены публичным контрактом.

Исходный CSS entry point добавлять при конкретной потребности в расширении на этапе сборки или подтверждённой экономии CSS. Делать Tailwind обязательным для всех потребителей сейчас не даёт доказанного преимущества: основная часть MVP — обычный семантический CSS. Если позже потребуется уменьшение специализированных стилей, сначала оценить разделение CSS по entry points, например BPMN; это отдельный вопрос от Tailwind compilation.

## Уточнение Q17b: два CSS-выхода из одного источника

Пользователь предложил поставлять оба варианта. Технически это небольшой дополнительный контракт: один Angular build и один исходник стилей, опубликованный в исходном и обработанном виде. Рабочие имена, ещё не утверждённые exports:

- `@vflow/ui/styles.css` — обработанный/minified CSS, пригодный без Tailwind у потребителя.
- `@vflow/ui/styles.source.css` — исходные общие токены и семантические CSS-правила для pipeline потребителя.

Нужные возможности подтверждены чтением установленного ng-packagr: `assets` копирует файлы в пакет (`node_modules/ng-packagr/ng-package.schema.json`), а `generatePackageExports` сохраняет дополнительные exports из package.json (`node_modules/ng-packagr/src/lib/ng-package/entry-point/write-package.transform.js`). Это проверка упаковочного механизма, не выполненная сборка нового варианта.

Минимальное устройство: общие правила хранятся в одном source CSS; небольшой entry для библиотечной сборки импортирует их и необходимые build-директивы; готовый результат генерируется, source копируется через assets. Оба CSS exports отмечаются в sideEffects. При нескольких source-файлах публикуются и все их локальные imports; ссылки на пути monorepo в опубликованном варианте недопустимы.

Текущий `src/styles.css` нельзя считать готовым универсальным source-export без проверки: он сам импортирует Tailwind theme/utilities и содержит относительный `@source './'`. Нужно отделить собственные CSS-правила от запуска генератора utilities. При нынешнем ordinary-CSS подходе source-потребление не требует Tailwind и не обязано само импортировать его. Если библиотечные директивы позднее станут использовать utilities, для обоих режимов потребуется единый документированный список сканируемых class sources. [Source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files), [директива import](https://tailwindcss.com/docs/functions-and-directives#import).

Польза source-варианта — обработка CSS средствами/версиями pipeline приложения, единая минификация и bundling. Он не обещает автоматически поменять тему через конфиг Tailwind, удалить неиспользуемые `.vui-*` правила или сэкономить CSS. Пользователь выбирает один CSS-вход; подключение обоих дублирует правила.

Предложение после уточнения: поддержать два CSS-выхода, сохранив compiled-вариант default. Добавить один проверочный consumer в двух конфигурациях импорта: source и compiled должны сохранять семантические части, темы и overrides при одинаковых условиях. Отдельные npm-пакеты, две реализации стилей и два Angular builds для этого не нужны. Решение пользователя ещё ожидается.
