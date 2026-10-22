# DEFENSE — LAB 2: прототип → інтеграція з БД

**1. Що я просив у AI** (1–2 речення). Промпти: `ai/`.

Я попросив AI реалізувати API для перегляду героїв, матчів та синергії героїв однієї команди згідно з `spec.md`: спочатку на статичних даних, потім інтеграція з PostgreSQL+Prisma з транзакціями, валідацією, ідемпотентністю по `externalId` та захистом від гонок, підрахунком синергії лише для союзників без N+1, та коректною обробкою помилок БД.

**2. Топ-3 розбіжності, які я знайшов і виправив** (spec ↔ вихід AI):

| # | Що було не так (проти якого пункту spec) | Мій слід (промпт / фідбек / дод. spec) | Виправлення (коміт) |
| - | ---------------------------------------- | -------------------------------------- | ------------------- |
| 1 | **Фолбек синергії відсутній.** Проти пункту `spec.md` "Статика спочатку: GET /heroes/:id/synergy має повертатись на статичні дані якщо БД порожня АБО недоступна". AI реалізував лише читання з `HeroPair`, без розрахунку зі `STATIC_MATCHES`. | `ai/02-validation-fallback-fixes.md` · Фідбек: "Синергія - коли БД порожня або кидає помилку - використовувати розрахунок зі STATIC_MATCHES. Рахувати ТІЛЬКИ пари героїв на ОДНІЙ стороні (a.side === b.side)." | [`88920a0`](https://github.com/vitkovskiiy/alsa_dota2_analyzer/commit/88920a0) |
| 2 | **Проблеми з ESM-збіркою.** Проти вимог по відтворюваній збірці (`npm run build`) у `spec.md`. При Node16/ESM бракував `.js` розширення у відносних імпортах, через що `tsc`/запуск падали. | `ai/02-validation-fallback-fixes.md` · Фідбек: "Перевір збірку `npm run build` після змін. Додай .js до відносних імпортів для ESM." | [`88920a0`](https://github.com/vitkovskiiy/alsa_dota2_analyzer/commit/88920a0) |
| 3 | **Неповна валідація та слабка обробка ідемпотентності.** Проти пунктів `spec.md`: "Валідація через Fastify JSON Schema", "Ідемпотентність/гонка: при повторному externalId повертати існуючий запис з created: false. Обробляти P2002 при конкурентному вставленні". Бракувало JSON Schema для params/query/body, перевірок унікальності heroId, наявності обох сторін, та коректної обробки P2002 з повторним пошуком. | `ai/02-validation-fallback-fixes.md` · Фідбек: "Додай Fastify JSON Schema для всіх маршрутів. У POST /matches перевір унікальність heroId та наявність обох сторін. При P2002 перехопи, зроби повторний findUnique по externalId і поверни {id, created: false}. Статуси 201/200 відповідно." | [`85241e4`](https://github.com/vitkovskiiy/alsa_dota2_analyzer/commit/85241e4) |

**3. Ключове рішення:** Вибір **PostgreSQL + Prisma** — обґрунтовано в [`adr/0002-use-postgresql-prisma.md`](docs/standards/adr/0002-use-postgresql-prisma.md) та [`adr/0003-use-prisma-orm.md`](docs/standards/adr/0003-use-prisma-orm.md). Обрано через транзакційність, зовнішні ключі, унікальні обмеження для захисту від дублікатів та версіоновані міграції з типізованим клієнтом.

**4. Перевірка:**
- Критерії з [`spec.md`](spec.md) перевірено через тести: `npm test` (25 passed). Інтеграційні тести в [`src/tests/integration.test.ts`](src/tests/integration.test.ts) перевіряють роботу на реальній БД при `RUN_DB_INTEGRATION=1`.
- Відповідність моделі даних перевірено через [`prisma/schema.prisma`](prisma/schema.prisma) та міграції в [`prisma/migrations/`](prisma/migrations/). Відтворюваність: `npm run build`, `docker compose up -d postgres`, `npx prisma migrate deploy`, `npx tsx src/seed.ts`.
