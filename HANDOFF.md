# Boxly — Telegram Mini App Merge Game

## What this is

Telegram Mini App — мерж-игра с подарками и коллекционками, персональный подарок для девушки, но готова масштабироваться.

- **Бот:** [@boxly_game_bot](https://t.me/boxly_game_bot) (ID `8705283199`)
- **Токен:** в `.env.local` (не коммитить)
- **Директория:** `/Users/andrejpetrusihin/develop/personal/boxly`
- **Репозиторий:** https://github.com/Imolatte/boxly
- **Прод:** https://imolatte.github.io/boxly/ (GH Pages, auto-deploy на `push main`)
- **Webhook бота:** `/tmp/boxly-webhook/` → https://boxly-webhook.vercel.app (Vercel Edge, отвечает `/start`, хранит лидерборд в Upstash Redis)

## Архитектура

Stack: Vite + React 18 + TS strict + Tailwind 3 + Zustand + dnd-kit + framer-motion + vitest.

```
src/
├── types/        # gift, board, player, game, events
├── config/       # balance.ts (ВСЕ цифры), gifts.ts, collectibles.ts, roulette.ts
├── store/        # Zustand: gameStore (board+player+ui), persistence, toastStore
├── engine/       # ЧИСТАЯ логика: weightedPick, dropPart, merge, roulette, energy, xp, sell
├── storage/      # storage.ts adapter + TG CloudStorage / localStorage fallback
├── telegram/     # sdk (init, user, initData), haptics, theme
├── leaderboard/  # client.ts (submitScore, fetchTopPlayers)
├── hooks/        # useAutoSave, useTelegramBackButton
├── pages/        # GamePage, CollectionPage, LeaderboardPage, InfoPage, ProfilePage
├── components/
│   ├── layout/   # TabBar (5 вкладок), TopHud
│   ├── board/    # Board, Cell, GiftSprite, MergeFx
│   ├── controls/ # CreateButton, SellButton
│   ├── roulette/ # RouletteModal
│   ├── levelup/  # LevelUpOverlay
│   ├── onboarding/ # OnboardingOverlay
│   └── common/   # Modal, ProgressBar, Toast
└── utils/
```

## Game design (финальное ТЗ)

### Поле и ресурсы
- Поле **5×6 = 30 клеток**, drag&drop
- Энергия: cap **100** в начале, регенерация **+1 каждые 4 минуты**. Cap **+2 за каждый lvl**
- Тап "Создать" = **1 энергия** = падает 1 часть (если не сработала рулетка)
- Кнопка disabled если `energy < 1` ИЛИ поле full
- Fallback: рулетка даёт gift/collectible но поле заполнено → **+50 энергии** + toast

### Цепочка мёрджа (10 уровней)
Веса падения частей:

| lvl | 1  | 2  | 3  | 4  | 5 | 6 | 7 | 8 | 9   | 10  |
|-----|----|----|----|----|---|---|---|---|-----|-----|
| %   | 35 | 22 | 15 | 10 | 7 | 5 | 3 | 2 | 0.8 | 0.2 |

- **Lvl 1-5:** 2 части → готовый подарок `complete`
- **Lvl 6-7:** 2 части → `intermediate stage=1`, 2 stage=1 → complete
- **Lvl 8-10:** 2 части → `intermediate stage=1`, 2 stage=1 → `intermediate stage=2`, 2 stage=2 → complete
- **Мёрдж готовых:** 2 `complete` lvl N<10 → `complete` lvl N+1
- **Lvl 10 мёрдж:** 2 `complete` lvl 10 → случайная collectible (+10 ⚡)
- **Мёрдж коллекционок:** 2 одинаковых → **+50 ⚡ +2000 XP** (обе исчезают)
- Коллекционка остаётся на поле до встречи со второй такой же

### Рулетка
- При тапе "Создать" — **шанс 2%**. Когда срабатывает: часть **НЕ падает**, открывается колесо вместо этого.
- 10 секторов, сумма весов = 100:

| Приз | %   |
|------|-----|
| +10 ⚡ | 30  |
| +25 ⚡ | 22  |
| +50 ⚡ | 13  |
| +100 ⚡ | 6  |
| +200 XP | 10 |
| +500 XP | 5 |
| gift lvl 1-5 (40/30/20/7/3) | 8 |
| gift lvl 6-8 (40/35/25) | 4 |
| gift lvl 9-10 (70/30) | 1.5 |
| случайная коллекционка | 0.5 |

- Награда применяется **только один раз** — в `applyRouletteReward` при клике "Забрать". В модалке крупно показывается эмодзи приза + лейбл.

### Продажа
- `complete` → +1 ⚡ (с клэмпом к cap)
- `part` / `intermediate` → бесплатно, очистка клетки
- `collectible` → запрещено

### XP и уровни игрока
- `totalXpToReach(N) = N² × 100`
- XP даёт **только мёрдж**:

| Действие | XP |
|----------|-----|
| 2 части → `complete` lvl 1-5 | N² (1/4/9/16/25) |
| 2 части → `intermediate` stage=1 lvl 6-10 | N |
| 2 stage=1 → `complete` lvl 6-7 или `intermediate stage=2` lvl 8-10 | N (для stage 2) / N² (для complete) |
| 2 stage=2 → `complete` lvl 8-10 | N² (64/81/100) |
| 2 `complete` → next lvl | (N+1)² × 2 |
| 2 lvl10 → collectible | 500 |
| 2 одинаковых collectible | **2000** |

- **При level-up:** `+10 ⚡` (фикс, клэмп к cap), `+2` к cap энергии. cap достигает 24ч-запаса (360) только на lvl 131 — в играбельной зоне cap растёт плавно.

## Визуал

- **Эмодзи на спрайтах — нативные unicode** (`🎁🧸💗🌸🌟🥇👑💎🏆✨` для lvl 1-10, `🌙☀️🐱🦋🍄🪶🍀❄️🪐🧭` для коллекционок) — не SVG. Рисует OS (Noto на Android / Apple на iOS), десятикратно быстрее multicolor SVG.
- **Part** — маленький эмодзи (20-24px) на тонированном фоне + штриховка + пунктирная рамка. Чем выше lvl, тем мельче (для lvl 8-10 mini, для lvl 1-5 побольше — "ближе к complete").
- **Intermediate** — средний эмодзи на плотном цветном фоне, в углу белый круглый бейдж с ½ / ¾ иконкой phosphor.
- **Complete** — крупный эмодзи (32-34px) на насыщенном градиенте (цвет lvl), цветная рамка, тень. Lvl ≥ 7 с `breathing` glow-анимацией.
- **Collectible** — крупный (36px) на радиальном bold-градиенте, золотой outline + `collectible-glow` анимация + sparkle badge в углу.

## Performance (важно для драга)

- CSS `contain: layout paint style` на каждой Cell и GiftSprite → изолирует repaint.
- `will-change: transform` на спрайтах.
- `React.memo(GiftSprite)` с custom comparator — не ререндерит при изменениях board.
- **Без framer-motion на горячем пути** (GiftSprite, MergeFx, Cell) — CSS keyframes. framer-motion ещё используется в модалках/табах/кнопках, но не в драге. Keyframes: `sprite-enter` (fade+scale, без translateY — иначе на мёрдже "трясётся"), `sprite-sell`, `merge-fx-pop`.
- `DragOverlay` с `dropAnimation={null}` — иначе default spring-back к источнику виден как "отскок" после мёрджа.
- `body.dnd-dragging` даёт `transition: none !important` на `.boxly-cell`/`.boxly-sprite` (только transition, ничего больше). Раньше было `animation: none` и `backdrop-filter: none` — оба вызывали мерцание всего поля при drop (анимация рестартилась с нуля, blur перекомпозился). Убрано.
- Drag state управляется классом на `<body>` через `handleDragStart/End` в `Board.tsx`.

## Этапы (история)

| Этап | Статус | Содержание |
|------|--------|------------|
| E1-E10 | ✅ | Скелет, engine, UI, рулетка, SDK, палитра, балансы (см. git log до `2053ca6`) |
| E11 | ✅ | Эмодзи-стиль вместо phosphor (сначала fluent-emoji SVG, потом нативные unicode для перфа) |
| E12 | ✅ | 4-я вкладка Инфо (схема мёрджа), 5-я вкладка Топ (лидерборд) |
| E13 | ✅ | Баг-баш: рулетка двойное применение, онбординг persistence, клэмп энергии, 5×6, двухстадийные intermediate для 8-10 |
| E14 | ✅ | Лидерборд: Upstash Redis, sorted set, топ-5 + твой ранг ниже; submit на level-up и на открытие вкладки |
| E15 | ✅ | Перф-драг: выпилен framer-motion из GiftSprite/MergeFx/Cell → CSS keyframes. Убран dropAnimation у DragOverlay. Убран блок body.dnd-dragging с `animation: none` / `backdrop-filter: none` (мерцание всего поля). Остался только `transition: none` на спрайтах/клетках. |
| E16 | ✅ | Энергия: фикс — `create()` больше не сбрасывает `energyUpdatedAt` на `now` при каждом тапе (таймер регенерации шёл по кругу). `useEnergyTick` теперь immediate-tick при mount + на `visibilitychange`, интервал 5s. |
| E17 | ✅ | Мёрдж: убран swap. Drop на несовместимый предмет = no-op. Только move в пустую клетку или merge. |
| E18 | ✅ | Админка: `/whoami` (свой Telegram ID) и `/stats` (всего / 24ч / 7д / top-10) команды в боте. Whitelist через env `ADMIN_USER_IDS`. Добавлен трекинг `boxly:last-seen` (ZADD в leaderboard-submit). |

## Лидерборд — детали

- **Backend:** `/tmp/boxly-webhook/` (отдельный Vercel-проект `imolattes-projects/boxly-webhook`)
- **Endpoints:**
  - `POST /api/leaderboard-submit` — `{initData, level, xpTotal}` → `ZADD boxly:leaderboard` + `HSET boxly:names` + `ZADD boxly:last-seen now`
  - `POST /api/leaderboard-top` — `{initData?}` → `{entries: Top5, me: rank если вне топа}`
  - `POST /api/debug-verify` — debug endpoint (оставлен на всякий)
  - `POST /api/telegram` — webhook: `/start`, `/play`, `/whoami`, `/stats` (последние две — админка)
- **Score:** `level * 1_000_000_000 + xpTotal` (сортировка по lvl primary, xp secondary)
- **Storage:** Upstash Redis через Vercel Marketplace, free tier (500k команд/мес, хватит x100). ENV переменные: `KV_REST_API_URL` и `KV_REST_API_TOKEN` (автодобавлены интеграцией). Дополнительно: `ADMIN_USER_IDS` (через запятую Telegram user_id админов, сейчас = `418229494`). Ключи в Redis: `boxly:leaderboard` (ZSET), `boxly:names` (HASH), `boxly:last-seen` (ZSET with timestamps).
- **InitData validation:** сейчас **trust-mode** — парсим user из initData без HMAC проверки. Reason: на Telegram Android 9.6 в 2026 в initData пришли оба поля `hash` + `signature`, и HMAC-SHA256 не сходится ни с включённым, ни с исключённым `signature`. `@telegram-apps/init-data-node@2.x` тоже не справляется (падает с пустым error). Временное решение — доверять initData. TODO: добавить Ed25519 верификацию через public key Telegram (prod key известен, Web Crypto поддерживает Ed25519 в Vercel Edge).

## Deploy

- **Mini app:** `git push origin main` → GitHub Actions → GH Pages (~40 сек). Vercel оставлен как запасной, не используется.
- **Webhook:** `cd /tmp/boxly-webhook && vercel --prod --yes --scope imolattes-projects`
- **URL-bump для обхода кэша TG WebView:** после значимых изменений меняем URL menu-button бота на `?v=N+1`:
  ```bash
  source .env.local && curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setChatMenuButton" \
    -H "Content-Type: application/json" \
    -d '{"menu_button":{"type":"web_app","text":"Играть","web_app":{"url":"https://imolatte.github.io/boxly/?v=N"}}}'
  ```
  Последняя — `?v=23`. Также в `index.html` стоят `no-store` мета-теги чтобы следующие билды не застревали.

## Bot settings (уже сделано / TODO)

Сделано:
- `setMyShortDescription`, `setMyDescription`, `setMyCommands` (/start, /play), `setChatMenuButton`
- Webhook `setWebhook` → `boxly-webhook.vercel.app/api/telegram`

TODO (**только через @BotFather интерактивно**, Bot API не поддерживает):
- **Аватарка:** `/setuserpic @boxly_game_bot` → загрузить `~/Desktop/boxly-avatar.png` (заготовленный файл 640×640, warm-pastel + 🎁 + надпись BOXLY)
- **Direct Link Mini App** (кнопка "Открыть" в списке чатов): `/newapp @boxly_game_bot` → title `Boxly`, short desc `Уютная мерж-игра с подарками`, short name `play`, URL `https://imolatte.github.io/boxly/`

## Ключевые файлы

- `src/config/balance.ts` — все цифры (BOARD, ENERGY, XP formulas, LEVEL_UP_*)
- `src/config/gifts.ts` / `src/config/collectibles.ts` — эмодзи и цвета
- `src/engine/merge.ts` — логика двухстадийных intermediate
- `src/store/gameStore.ts` — вся игровая механика
- `src/store/persistence.ts` — `SAVE_VERSION = 4`. Bump для сброса всех.
- `src/components/board/GiftSprite.tsx` — визуал спрайтов (размеры, фоны, бейджи, анимации)
- `src/components/roulette/RouletteModal.tsx` — колесо, stop-angle = `-(i * 36 + 18)` (arrow в `-90°` SVG)
- `src/leaderboard/client.ts` — `submitScore`, `fetchTopPlayers`
- `src/pages/LeaderboardPage.tsx` — top-5 + своя строка ниже если вне топа
- `/tmp/boxly-webhook/api/leaderboard-*.ts` — бэкенд

## Известные проблемы / TODO

- **Лаги драга на Android** — значительно снижены в E15 (выпилен framer-motion с горячего пути). Если что-то ещё останется — смотреть в сторону `contain-intrinsic-size` или уменьшения числа пропсов на Cell.
- **Leaderboard без HMAC** — теоретически можно подделать через curl с чужим user.id. Для MVP с друзьями ОК, но перед публичным запуском/виральным каналом нужен Ed25519 (public key Telegram prod: `e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d` hex, Web Crypto в Vercel Edge поддерживает). ~1 час работы.
- **Не сделано: пуши "энергия полная"** — обсуждалось, решили отложить. План: QStash от Upstash (500 msg/день free) — клиент при visibilitychange:hidden шлёт `{fullTime}` → бэк планирует delayed HTTP callback → callback sendMessage. ~2 часа.

## Commands

```bash
cd /Users/andrejpetrusihin/develop/personal/boxly
npm run dev            # http://localhost:5173
npm test               # 42/42 passed
npx tsc --noEmit       # strict
npm run build          # output → dist/
git push origin main   # deploy GH Pages

# webhook
cd /tmp/boxly-webhook
vercel --prod --yes --scope imolattes-projects

# set/update admin whitelist (comma-separated Telegram user_ids)
cd /tmp/boxly-webhook && echo '418229494' | vercel env add ADMIN_USER_IDS production --scope imolattes-projects
# После этого redeploy выше

# quick leaderboard check
curl -sX POST https://boxly-webhook.vercel.app/api/leaderboard-top \
  -H "Content-Type: application/json" -d '{}'

# stats (только из Telegram, отправь боту /stats — но только если твой user_id в ADMIN_USER_IDS)
# Если видишь "Команда недоступна" — проверь env var в Vercel

# remove user from leaderboard (emergency)
cd /tmp/boxly-webhook && vercel env pull .env.prod --environment production --yes
source .env.prod
curl -sX POST "$KV_REST_API_URL/zrem/boxly:leaderboard/<userId>" \
  -H "Authorization: Bearer $KV_REST_API_TOKEN"
curl -sX POST "$KV_REST_API_URL/hdel/boxly:names/<userId>" \
  -H "Authorization: Bearer $KV_REST_API_TOKEN"
rm .env.prod
```
