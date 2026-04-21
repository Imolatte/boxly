# Boxly — Telegram Mini App Merge Game

## What this is

Telegram Mini App — упрощённый клон Gift Fest 2 (merge-игра с подарками). Делается как подарок-игра для автора и его девушки. Масштабирование в прод — возможно, но без рефералок/платежей/антифрода в MVP.

- **Бот:** [@boxly_game_bot](https://t.me/boxly_game_bot) (ID 8705283199)
- **Токен:** в `.env.local` (не коммитить)
- **Директория:** `/Users/andrejpetrusihin/develop/personal/boxly`
- **Репозиторий:** https://github.com/Imolatte/boxly
- **Прод:** https://imolatte.github.io/boxly/ (GitHub Pages, авто-деплой через Actions по push в main)
- **Бывший прод (Vercel):** https://boxly-sigma.vercel.app (частично блочится РКН, не используем)

## Game design (финальное ТЗ, согласовано)

### Поле и ресурсы
- Поле **5×5 = 25 клеток**, drag&drop (игрок сам двигает)
- Энергия: cap **100** в начале, регенерация **+1 каждые 5 минут**. Cap растёт **+5 за каждый lvl игрока**
- Тап "Создать" = **1 энергия** = падает 1 **часть** подарка в свободную клетку
- Кнопка "Создать" **disabled если:** `energy < 1` ИЛИ на поле 0 пустых клеток
- Edge-case: при последней пустой клетке тап сработал, часть упала, empty стало 0, рулетка выдала подарок/коллекционку → **fallback +50 энергии** + toast

### Цепочка мёрджа (10 уровней)
- **Части (kind='part') выпадают при тапе "Создать"** с весами:

  | lvl | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  |-----|---|---|---|---|---|---|---|---|---|----|
  | %   | 35| 22| 15| 10| 7 | 5 | 3 | 2 |0.8|0.2 |

- **Lvl 1-5:** 2 части одного lvl → готовый подарок (`complete`) этого lvl
- **Lvl 6-10:** 2 части → **промежуточный** (`intermediate`, хранит свой lvl), 2 промежуточных одного lvl → готовый подарок этого lvl
- **Мёрдж готовых:** 2 `complete` lvl N<10 → 1 `complete` lvl N+1 (классический 2048-мёрдж)
- **Lvl 10 мёрдж:** 2 `complete` lvl 10 → случайная `collectible` из пула 10 (равные шансы) + **10 энергии**
- **Мёрдж коллекционок:** 2 одинаковых `collectible` → **+50 энергии** (обе исчезают)
- Коллекционка на поле остаётся до встречи со второй такой же

### Удаление ("Продать")
- `complete` любого lvl → **+1 энергия** (единая цена, чтобы игрок думал)
- `part` / `intermediate` → бесплатно, просто освобождение клетки
- `collectible` → **нельзя продавать** (защита от случайного удаления редкого)

### Рулетка
- При каждом тапе "Создать" — **шанс 2%** запустить рулетку (независимый ролл после падения части)
- 10 секторов (сумма весов = 100, т.е. проценты явные):

  | Приз | % |
  |------|---|
  | +10 энергии | 30 |
  | +25 энергии | 22 |
  | +50 энергии | 13 |
  | +100 энергии | 6 |
  | +200 XP | 10 |
  | +500 XP | 5 |
  | `complete` lvl 1-5 (веса 40/30/20/7/3) | 8 |
  | `complete` lvl 6-8 (веса 40/35/25) | 4 |
  | `complete` lvl 9-10 (веса 70/30) | 1.5 |
  | случайная коллекционка | 0.5 |

- Если выпал gift/collectible, а места нет → **+50 энергии** (fallback)

### XP и уровни игрока
- **XP даёт ТОЛЬКО мёрдж (не тап):**

  | Действие | XP |
  |----------|-----|
  | 2 части → `complete` lvl 1-5 | N² (1/4/9/16/25) |
  | 2 части → `intermediate` lvl 6-10 | N (6-10) |
  | 2 промежуточных → `complete` lvl 6-10 | N² (36/49/64/81/100) |
  | 2 `complete` lvl N → `complete` lvl N+1 | (N+1)² × 2 |
  | 2 lvl10 → коллекционка | 500 |
  | 2 одинаковые коллекционки | **2000** |
  | Продажа | 0 |

- **Формула уровня (накопительно):** `totalXpToReach(N) = N² × 100`
  - lvl2 = 400, lvl5 = 2500, lvl10 = 10000, lvl20 = 40000
  - Переход (N-1)→N требует `(2N-1) × 100` XP дополнительно
- **За ап уровня:** +`N × 10` энергии разово (может перелить cap) + `+5 к cap энергии`

## Архитектура (полная — см. детали в plan ниже)

```
src/
├── types/        # gift, board, player, game, events
├── config/       # balance.ts (ВСЕ цифры), gifts, collectibles, roulette
├── store/        # Zustand (slices: board, energy, xp, ui) + persistence
├── engine/       # ЧИСТАЯ логика: weightedPick, dropPart, merge, roulette, energy, xp, sell
├── storage/      # storage.ts (адаптер: TG CloudStorage или LocalStorage)
├── telegram/     # sdk, haptics, theme
├── hooks/        # useEnergyTick, useAutoSave, useTelegramBackButton, useHaptic
├── pages/        # GamePage, CollectionPage, ProfilePage
├── components/
│   ├── layout/   # TabBar, TopHud
│   ├── board/    # Board, Cell, GiftSprite, MergeFx
│   ├── controls/ # CreateButton, SellButton
│   ├── roulette/ # RouletteModal, RewardToast
│   ├── levelup/  # LevelUpOverlay
│   ├── collection/
│   └── common/   # Modal, ProgressBar, Button, Icon
└── utils/        # rng, clamp, format, coord
```

### Tech
- Vite + React 18 + TypeScript (strict) + Tailwind 3
- **Zustand** (state), **dnd-kit** (drag&drop)
- **framer-motion** (анимации мёрджа/рулетки) — с E3
- **vitest** (unit-тесты engine)
- Telegram SDK: прямой `<script>` (не @twa-dev/sdk)
- Хранение: LocalStorage (dev) / Telegram CloudStorage (prod) с адаптером

## Этапы реализации

| Этап | Содержание | Статус | Часы |
|------|-----------|--------|------|
| **E1** | Скелет + engine + тесты + базовый UI | ✅ DONE | 8-10 |
| **E2** | TopHud, TabBar, 3 страницы-скелета, Modal, toasts, SellButton | ✅ DONE | 4-5 |
| **E3** | Иконки (Iconify), палитра warm-pastel, micro-анимации падения/мёрджа | ✅ DONE | 5-7 |
| **E4** | Рулетка с крутящимся колесом + LevelUpOverlay с конфетти + haptics | ✅ DONE | 4-5 |
| **E5** | Telegram SDK (theme, haptics, CloudStorage, BackButton) | ✅ DONE | 3-4 |
| **E6** | CollectionPage (tap-модалка + прогресс-бар), ProfilePage (XP-бар, иконки) | ✅ DONE | 3 |
| **E7** | Vercel deploy + BotFather menu button | ✅ DONE | 2-3 |
| **E8** | Визуальная полировка + UX-тюнинг (без баланса) | ✅ DONE | 3-5 |
| **E9** | Баланс + SFX (Web Audio API, 7 звуков, mute toggle) | ✅ DONE | 2-3 |
| **E10** | Bug-bash: дрэг, персистентность, рулетка, XP display, инфра | ✅ DONE | 2-3 |
| **E11** | Красивые подарки — эмодзи-стиль вместо плоских иконок | → NEXT | 3-5 |

**MVP играбельный.** Production URL: https://imolatte.github.io/boxly/ — в боте [@boxly_game_bot](https://t.me/boxly_game_bot) кнопка "Играть" в menu.

Репо: https://github.com/Imolatte/boxly (public). Auto-deploy на push в `main` через GitHub Actions.

Webhook на `/start` (server-to-server, РКН не мешает): https://boxly-webhook.vercel.app/api/telegram (отдельный Vercel-проект, токен в env).

## Текущий статус (2026-04-21)

### E1 ✅
- 41 файл, engine/, Zustand store, dnd-kit drag&drop, все 6 видов мёрджа, рулетка 2%, регенерация энергии, XP с level-up, LocalStorage persistence
- 35/35 vitest зелёные, `tsc --noEmit` exit 0

### E2 ✅
- palette `boxly.*` в `tailwind.config.js` (bg/peach/mint/text/border)
- `src/components/layout/`: TopHud (level badge + ProgressBar XP + energy pill с mm:ss таймером), TabBar (3 вкладки fixed bottom, safe-area)
- `src/components/common/`: Modal (portal + backdrop blur + ESC), ProgressBar, Toast (portal, auto 3s, типы info/success/reward)
- `src/store/toastStore.ts` - Zustand: push/remove
- `src/components/roulette/RouletteModal.tsx` - stub (реальное колесо в E4)
- `src/pages/CollectionPage.tsx` - сетка 5×2 с иконками коллекционок
- `src/pages/ProfilePage.tsx` - статы + reset с Modal-confirm
- `src/vite-env.d.ts`, `vite.config.ts` добавлен `/// <reference types="vitest" />`
- все `alert()` заменены на toast/modal; gameStore.ts публикует события через toast().push()

### E3 ✅
- зависимости: `@iconify/react ^6.0.2`, `framer-motion ^12.38.0`
- `src/config/gifts.ts` - у каждого из 10 уровней `icon` (phosphor ph:*) и `color` (hex)
- `src/config/collectibles.ts` - 10 коллекционок с уникальной иконкой + русское `name`
- `src/components/board/GiftSprite.tsx` переписан - варианты part/intermediate/complete/collectible, framer-motion drop-in spring
- `src/components/board/MergeFx.tsx` - вспышка при мёрдже и продаже
- `src/types/game.ts` - добавлено `ui.fx: Array<{id, type, cellIdx}>`
- `src/store/gameStore.ts` - `pushFx` / `removeFx`, триггеры в merge/sell
- `whileTap scale-95` на CreateButton / SellButton / TabBar
- safe-area-inset-bottom для iPhone

### Финальные иконки

**Gifts lvl 1..10:** `ph:bell-simple`, `ph:gift`, `ph:heart`, `ph:flower-lotus`, `ph:star-four`, `ph:medal`, `ph:crown-simple`, `ph:diamond`, `ph:trophy`, `ph:sparkle`

**Collectibles col_1..col_10:** `ph:moon-stars` (Луна), `ph:sun-horizon` (Солнце), `ph:cat` (Кот), `ph:butterfly` (Бабочка), `ph:mushroom` (Гриб), `ph:feather` (Перо), `ph:leaf` (Листик), `ph:snowflake` (Снежинка), `ph:planet` (Планета), `ph:compass` (Компас)

### Метрики билда после E3
- `npm test` — 35/35 passed
- `npx tsc --noEmit` — exit 0
- `npm run build` — JS 359.76 kB / CSS 12.17 kB, built ~1.5s

### E4 ✅
- `canvas-confetti ^1.9.4` + `@types/canvas-confetti`
- `src/components/roulette/RouletteModal.tsx` - SVG-колесо, 10 секторов с пастельными цветами, framer-motion easeOut ~3.6s, стрелка сверху, остановка точно на выпавшем секторе, кнопка "Забрать"
- `src/components/levelup/LevelUpOverlay.tsx` - полноэкранный backdrop + spring-анимация карточки + canvas-confetti. Триггер через `ui.levelUp` в gameStore
- `src/telegram/haptics.ts` - `impact` / `notification` / `selection`, no-op в браузере. Подключено в CreateButton/merge/level-up/roulette spin-start/stop/collectible

### E5 ✅
- `<script src="https://telegram.org/js/telegram-web-app.js">` в index.html
- `src/telegram/sdk.ts` - `initTelegram()` / `getTelegramUser()` / `isTelegramEnv()`
- `src/telegram/theme.ts` - `applyTelegramTheme()` копирует `themeParams` в CSS-переменные `--tg-*`, подписка на `themeChanged`
- `StorageAdapter` переведён на async: `src/storage/cloudStorage.ts` (TG CloudStorage через Promise-wrapper, лимит 4096 байт), свитчер в `storage.ts` по `isTelegramEnv()`
- `src/hooks/useTelegramBackButton.ts` - show/hide + onClick/offClick cleanup. Подключён в `App.tsx` для не-GamePage вкладок
- `ProfilePage` - реальный аватар и имя из TG, fallback "Гость"
- tailwind `tg.*` палитра с `var(--tg-*, <warm-pastel-fallback>)`, `html/body` использует `--tg-bg` / `--tg-text`
- `main.tsx` - async init: SDK → theme → loadSave → mount React

### E6 ✅
- `CollectionPage`: ProgressBar сверху (`collected / 10`), ячейки-кнопки с `active:scale-95`, tap → Modal с крупной иконкой 64px + название + счётчик + подсказка ("2 одинаковых → +50 ⚡ и 2000 XP" / "Получить: объедини два подарка lvl 10")
- `ProfilePage`: XP-бар под "Уровень N" с разбивкой `curXp / xpNeeded` и лейблами `Lvl N → Lvl N+1`, stat rows получили иконки `ph:star` / `ph:lightning` / `ph:gift`

### E7 ✅
- `vercel.json` - framework vite, rewrites → index.html
- Deploy через `vercel --prod --scope imolattes-projects`
- Проект: `imolattes-projects/boxly`, алиас `https://boxly-sigma.vercel.app`
- Menu button: `setChatMenuButton` через Bot API, text="Играть", web_app.url=production URL

### Метрики после E7
- `npm test` — 35/35 passed
- `npx tsc --noEmit` — exit 0
- `npm run build` — JS 379.87 kB / CSS 13.98 kB

### E8 ✅
- `src/index.css` — 7 keyframes (`breathe`, `breathe-mint`, `collectible-glow`, `sparkle-spin`, `shimmer`, `energy-pulse`, `splash-pulse`), переиспользуются через inline `animation`
- `GiftSprite`: collectible — золотой glow-ring + крутящийся `ph:sparkle-fill` badge; complete≥lvl7 — breathing shadow; part — diagonal striping (repeating-linear-gradient); intermediate — `ph:circle-half-fill` вместо текстового `½`
- `Cell`: пустые клетки — radial-gradient inset ("лунка"); merge-preview glow-prop
- `Board`: многослойный фон (2 radial-gradient peach/mint + frosted glass + inset shadow)
- `TopHud`: Level badge iOS-style (gradient + inner highlight); XP-bar shimmer; Energy pill с `ph:lightning-fill`, при <20% — красный pulse
- `CreateButton`: breathing idle glow, `ph:sparkle-fill` иконка; при полном поле + энергия >0 — throttled toast "Поле заполнено..."
- `SellButton`: два состояния (complete → mint depth + `ph:hand-coins-fill`, free → neutral + `ph:trash-simple`)
- `TabBar`: Phosphor иконки над лейблами; animated pill через `layoutId`; frosted glass
- `Modal`: glass-card (gradient bg + inset highlight + deep shadow); spring open/close
- `CollectionPage`: animated shimmer progress; empty-hint `ph:compass`; unlocked с radial glow; sparkle badge; детальная модалка с glowing иконкой
- `ProfilePage`: аватар peach→mint gradient ring; XP-карточка; цветные StatRow badges; understated reset button
- `main.tsx`: splash screen (иконка подарка + "Boxly" + 3 пульсирующие точки, 300ms fade-out)
- `OnboardingOverlay.tsx` (новый): 3-шаговый онбординг, step-dots, blur backdrop, spring; persist через `ui.onboardingStep` в Zustand
- `types/game.ts`: `onboardingStep: number` в ui
- `gameStore.ts`: `advanceOnboarding` action; fallback toast text → "Поле полное — награду конвертировали в +50 ⚡"

### Метрики после E8
- `npm test` — 35/35 passed
- `npx tsc --noEmit` — exit 0
- `npm run build` — JS 396.86 kB (gzip 130.69 kB) / CSS 13.51 kB (gzip 3.59 kB)
- Deploy: `https://boxly-sigma.vercel.app`

### E9 ✅

**Баланс (`src/config/balance.ts`):**
- `ENERGY_REGEN_MS`: 5 min → 4 min (регенерация чуть щедрее)
- `ENERGY_CAP_PER_LEVEL` / `LEVEL_UP_CAP_BONUS`: 5 → 10 (cap растёт быстрее с уровнем)
- `LEVEL_UP_ENERGY`: `n*10` → `n*15` (энергия при левел-апе +50%)
- `gameStore.ts`: хардкод `lv * 10` заменён на `LEVEL_UP_ENERGY(lv)`

**SFX (`src/audio/sfx.ts`):**
- 7 синтезированных звуков через Web Audio API: `tap`, `merge`, `levelUp`, `rouletteSpin`, `rouletteStop`, `sell`, `collectible`
- Ленивая инициализация `AudioContext` - только на первый user gesture (iOS Safari)
- Проверяет `ui.soundEnabled` + `prefers-reduced-motion` перед воспроизведением
- Все методы обёрнуты в try/catch
- Wire-up: CreateButton (tap), SellButton (sell), LevelUpOverlay (levelUp), RouletteModal (rouletteSpin каждые 80ms + rouletteStop + collectible через 400ms), gameStore.tryMerge (merge / collectible)

**ProfilePage:** toggle-кнопка звука (`ph:speaker-high` / `ph:speaker-slash`) в стиле stat rows, связана с `ui.soundEnabled` / `toggleSound()`

**Метрики после E9:**
- `npm test` — 35/35 passed
- `npx tsc --noEmit` — exit 0
- `npm run build` — JS 400.51 kB (gzip 131.64 kB) / CSS 13.58 kB (prирост +3.65 kB, чистый Web Audio)

### E10 ✅ (2026-04-21)

Пост-плейтест баг-баш + миграция инфры.

**Инфраструктура:**
- Репозиторий: https://github.com/Imolatte/boxly (public, `main` branch)
- Hosting: **GitHub Pages** — https://imolatte.github.io/boxly/ через GH Actions (`.github/workflows/deploy.yml`), авто-деплой на push в main
- `vite.config.ts`: `base: '/boxly/'` для корректных путей ассетов
- `vercel.json` остался — можно задеплоить параллельно через `vercel --prod --yes --scope imolattes-projects`, но старый https://boxly-sigma.vercel.app используется **только** для webhook, не для mini app
- Webhook бота: отдельный Vercel-проект `/tmp/boxly-webhook/` → https://boxly-webhook.vercel.app/api/telegram
  - Edge runtime, отвечает на `/start` и `/play` приветствием + inline-кнопкой "Играть в Boxly"
  - `TELEGRAM_BOT_TOKEN` в Vercel env (prod-scope)
  - Server-to-server: Telegram-серверы из Амстердама зовут Vercel напрямую — РКН не мешает
  - Регистрация: `curl -G "https://api.telegram.org/bot$TOKEN/setWebhook" --data-urlencode "url=https://boxly-webhook.vercel.app/api/telegram"`
- Bot meta через Bot API:
  - `setMyShortDescription`: "Уютная мерж-игра с подарками и коллекционками"
  - `setMyDescription`: "Boxly — уютная мерж-игра с подарками..."
  - `setMyCommands`: `/start`, `/play`
  - `setChatMenuButton`: text="Играть", url=https://imolatte.github.io/boxly/

**Исправленные баги:**
1. **Драг на мобилке** — `Board.tsx` перешёл с `TouchSensor(delay:120ms)` на `PointerSensor(distance:6px)` — драг запускается сразу при сдвиге 6px. `GiftSprite.tsx` получил `touchAction: 'none'` в inline-стиль.
2. **Telegram WebView перехват свайпов** — `telegram/sdk.ts::initTelegram()` зовёт `wa.disableVerticalSwipes?.()` (Bot API 7.7+). Без этого вертикальные тач-движения на мобильной Telegram перехватывались как "свернуть приложение".
3. **Перезапуск = новая игра** — `SAVE_VERSION` был бампнут 1→2 (из-за смены 5×6 → 5×5), но все `debouncedSave` писали `v: 1`. Отрефакторил: `writeSave` сама проставляет `SAVE_VERSION` из одного места, `SaveData` больше не содержит `v`. Все call-sites чистые.
4. **XP -100 из 300 при первом запуске** — `totalXpToReach(1) = 100`, но игрок стартует с 0 XP. В `TopHud.tsx` и `ProfilePage.tsx` — спецкейс для level 1: `xpPrev = player.level <= 1 ? 0 : totalXpToReach(player.level)`. Плюс `Math.max(0, ...)` для страховки.
5. **Рулетка — gift/collectible награды терялись** — в `applyRouletteReward` не было веток для `kind: 'gift'` и `kind: 'collectible'` при наличии места на поле. Добавил `placeInFirstEmpty(board, item)` helper. Все ветки теперь дёргают `debouncedSave`. Если XP-награда вызывает level-up — показывается overlay.
6. **AudioContext на iOS WebView** — `sfx.ts::getCtx()` теперь проверяет `window.AudioContext || window.webkitAudioContext` (нужно для старых iOS Safari < 14.5).

**Поле:** `BOARD_H`: 6 → 5. Поле теперь `5×5 = 25 клеток`.

**Debug-панель:** `src/components/common/DebugPanel.tsx` — видна при `?debug=1` в URL, показывает последние 50 событий (tg version/platform, disableVerticalSwipes, dragStart/dragEnd, viewport, userAgent). Логи пишут: `sdk.ts`, `App.tsx`, `Board.tsx`. Сигнатура: `debugLog(message)` / `isDebugMode()`.

**Известная проблема, не чиним:**
Mini App не грузится на мобильных операторах РФ (МТС/Мегафон/Билайн) без системного VPN, даже если `imolatte.github.io` открывается в браузере. Ресёрч: Telegram WebView идёт в сеть **в обход MTProto-прокси**, использует системный DNS + системный TLS, из-за чего оператор режет ClientHello по SNI `github.io`. Решения: миграция на Яндекс Облако Object Storage (в белом списке Минцифры) — скорее всего понадобится, но пользователь сейчас мирится с включённым VPN. См. отчёт ресёрчера в сессии 2026-04-21.

**Метрики после E10:**
- `npm test` — 35/35 passed
- `npx tsc --noEmit` — exit 0
- `npm run build` — JS 404.54 kB (gzip 133.24 kB) / CSS 13.61 kB (prирост +4 kB, DebugPanel + логи)
- Deploy: https://imolatte.github.io/boxly/

---

### E11 (NEXT) — Красивые подарки "эмодзи-стиль"

**Проблема:** сейчас подарки в `GiftSprite.tsx` — это **плоские цветные плашки** с одной Phosphor-иконкой в центре (`ph:bell-simple`, `ph:gift`, `ph:heart`...). Смотрится как демо-иконпак, не как игровые подарки. Хочется **объёмные, живые, "эмодзи-стиль"** — как в Gift Fest 2 / Candy Crush / подобных — с блеском, объёмом, тенями, распознаваемой формой.

**Три возможных пути:**

1. **3D-style CSS + SVG композиция**  
   - Каждый подарок = композиция из нескольких SVG-слоёв: base shape + highlight + shadow + shine. Цвета градиентами, не плоские.  
   - Пример: подарок lvl1 = коробка с бантом (3 слоя: коробка peach-gradient + бант персик-темнее + белый highlight 15deg).  
   - Полностью контролируется кодом, легко тюнится, работает офлайн, вес ~0 KB.  
   - Минус: дорого по времени — 10 подарков × 4-6 слоёв каждый.

2. **Готовые эмодзи-style иконпаки (Fluent, Noto, OpenMoji, Twemoji)**  
   - Свободные лицензии: Fluent Emoji (Microsoft, MIT), Noto Emoji (Google, Apache 2), OpenMoji (CC BY-SA).  
   - Подключение: `@iconify/react` с `fluent-emoji:gift` / `noto:gift` / итп. Iconify покрывает все эти наборы.  
   - Вес: каждая иконка inline SVG, ~2-5 KB.  
   - Плюс: готово, объёмно, узнаваемо, быстро.  
   - Минус: стиль эмодзи (обычно Apple/Google-style), не совсем "наш" — нужно подобрать набор с подходящим warm-vibe.

3. **Нарисовать через AI (DALL-E / Midjourney / Figma + экспорт в SVG/PNG)**  
   - Полная кастомность, фирменный стиль.  
   - Минус: нужно время на генерацию, итерации, экспорт, оптимизация.  
   - Bundle сильно толще (PNG 10×100 KB = 1 MB или SVG по 30 KB × 10 = 300 KB).

**Рекомендация:** старт с пути 2 (Fluent Emoji), fallback на путь 1 для 10 ключевых коллекционок если Fluent не подходит. Быстро, дёшево, сразу "играбельный вид". Пользователю понравится или нет — за 20 минут увидим.

**Требования к итогу:**
- Каждый lvl 1-10 визуально **распознаваем за 0.5 сек** (не нужно читать "lvl 3" чтобы понять).
- Прогрессия цвета/редкости: lvl1-3 — тёплые/простые (коробка, мишка, цветок), lvl4-6 — средние (драгоценности, сладости), lvl7-10 — "вау" (корона, сундук сокровищ, звезда, радуга).
- Сохранить существующие **механики сияния**: collectible — золотой glow-ring + крутящийся sparkle; complete lvl>=7 — breathing; part — diagonal stripes; intermediate — half-fill badge.
- 10 коллекционок (`col_1` .. `col_10`) тоже обновить под тот же стиль.
- Bundle прирост — ожидаемо не более +100 KB (на всё про всё).

**Файлы для правки:**
- `src/config/gifts.ts` — `icon` менять на emoji-style вариант
- `src/config/collectibles.ts` — аналогично
- `src/components/board/GiftSprite.tsx` — возможно обновить `resolveStyle` если эмодзи заменят текущее отображение
- Если путь 1 (SVG-композиция): новый `src/components/board/gifts/GiftArt.tsx` с композициями на lvl

**Как проверить:**
1. `npm run dev` на localhost:5173 — визуальная проверка на Board
2. На мобилке через https://imolatte.github.io/boxly/?debug=1 — убедиться что лог dragStart/dragEnd работает
3. Тест мёрджа: lvl1 + lvl1 → lvl2 — анимация остаётся, просто меняется спрайт
4. Sell → спрайт улетает вниз с fade

---

## Архивные заметки по этапам

### Что должно получиться после E4

1. **Рулетка с настоящим крутящимся колесом.** При 2%-ролле из engine (сейчас уже срабатывает и открывает `RouletteModal`-stub) - показать модалку с SVG/CSS колесом на 10 секторов, ротация с easeOut ~3-4 секунды, стрелка наверху, остановка на выпавшем секторе. После остановки - кнопка "Забрать" (и применение награды через уже существующий action в store).
   - Сектора уже определены в `src/config/roulette.ts` (веса суммой 100, 10 секторов). Для отрисовки секторов нужен массив с цветами + иконкой/лейблом на сектор.
   - Сохранить логику fallback (если gift/collectible, а поля нет → +50 энергии) - она уже в engine/roulette.ts.

2. **LevelUpOverlay с конфетти.** Полноэкранный (или крупный центрированный) overlay: "Уровень N!", строки "+X ⚡ энергии", "+5 к cap", конфетти-анимация (canvas-confetti или CSS keyframes с ~30 частицами). Закрывается кнопкой "Ура!" или тапом. Триггер - событие level_up из gameStore (сейчас идёт toast-ом, нужно поднять до overlay; toast оставить только на мелких наградах).

3. **Haptics-заготовки.** `src/telegram/haptics.ts` с функциями `impact('light'|'medium'|'heavy')`, `notification('success'|'warning'|'error')`, `selection()`. Внутри - no-op если `window.Telegram?.WebApp?.HapticFeedback` недоступен (как в браузере), иначе - реальный вызов. Подключить в:
   - CreateButton tap → impact('light')
   - Merge → impact('medium')
   - Level up → notification('success')
   - Рулетка spin start → selection, остановка → impact('heavy')
   - Коллекционка → notification('success')

   Фактический Telegram SDK wire-up (скрипт, theme, BackButton) - в E5. В E4 только слой абстракции haptics с моком.

### Что должно получиться после E8

**E8 = визуальная полировка + UX-тюнинг.** MVP уже играбельный, задача — довести до "красиво и приятно играть".

**Приоритет 1 — дизайн (чего не хватает):**
1. **Собственный look, не generic Tailwind.** Подумать про стиль: warm-pastel живой + тени / градиенты / мягкие свечения. Можно попробовать `frontend-design` или `nothing-design` скил через `coder`/`designer` субагент — главное, чтобы UI не выглядел как AI-дефолт.
2. **Полировка Board.** Сейчас сетка + иконки — сухо. Нужно: лёгкий gradient фон клеток, тень/glow у complete-предметов выше lvl N, может быть рамка-ореол у collectible (редкие — светятся).
3. **Полировка TopHud.** Level badge, XP-бар, энергия-pill — есть, но плоские. Можно добавить тонкие анимации (например, pulse у энергии когда <20).
4. **CreateButton.** Сейчас это простая круглая/прямоугольная кнопка. Нужно что-то характерное: мягкая тень, press-down эффект, disabled-состояние явнее.
5. **Splash / первый экран.** Сейчас main.tsx показывает "Загрузка…" текстом. Сделать splash с логотипом Boxly / иконкой подарка + плавным fade-out.

**Приоритет 2 — UX-тюнинг:**
1. **Onboarding.** Первый запуск — 3 tap-to-continue подсказки: "Тапай 'Создать' → на поле падают части", "Перетаскивай 2 одинаковые части друг на друга → мёрдж", "Собери 10 подарков lvl10 → получи все коллекционки".
2. **Merge-preview.** Когда таскаешь item над совместимой клеткой — визуальная подсказка (рамка/glow), что произойдёт мёрдж.
3. **Пустая коллекция.** На CollectionPage сейчас просто сетка с 🔒. Добавить фразу "Здесь будут редкие находки — сливай подарки 10-го уровня".
4. **Тост о полном поле.** Когда field=full и кнопка disabled — показать тост-подсказку "Поле заполнено, продай что-нибудь или сделай мёрдж".
5. **Подсказка на fallback +50.** Когда сработал fallback (последняя клетка / некуда пристроить рулетку) — явно сказать это в тосте, а не просто "+50 ⚡".

**Приоритет 3 — баланс (после реального теста):**
- Сыграй сам 15-30 минут, запиши где скучно / где слишком быстро / где стопор.
- Цифры в `src/config/balance.ts` и `src/config/roulette.ts` — всё там, одно место.

**Опционально:**
- Звуки (эффекты drop/merge/level-up/roulette). `howler.js` или plain Audio API. Важно: mute-кнопка в ProfilePage + уважение `prefersReducedMotion`.
- Лёгкая анимация перехода между табами.

### Ограничения для E8
- Не ломать тесты (35/35)
- Не раздувать bundle сверх ~500kB (сейчас 380)
- Все цвета из палитры `boxly.*` или `tg.*` — никакого хардкода hex
- Без новых серверных зависимостей (нет бэка — игра 100% клиентская)

### Deploy после каждого значимого изменения
```bash
cd /Users/andrejpetrusihin/develop/personal/boxly
npm run build && vercel --prod --yes --scope imolattes-projects
```

## Ключевые решения (зафиксированы)

| Решение | Что выбрано | Почему |
|---------|-------------|--------|
| XP-формула | `totalXpToReach(N) = N²×100` | Сходится с примерами заказчика |
| Место под рулетку-награду | Fallback +50 энергии если места нет | Без инвентаря в MVP |
| Продажа коллекционки | Запрещено | Защита от случайного удаления |
| Рулетка vs падение части | Часть падает первой, рулетка — независимый ролл | Проще UX |
| Swap при drag | Разрешён (на пустую или несовместимую клетку) | Стандарт для 2048-like |
| Палитра | **Warm Pastel** (молочный фон, персик/мята акценты) | Не cringe, уютно, не клон Gift Fest |
| Иконки | Iconify (tabler/lucide/phosphor), по одной semantic-иконке на lvl | Бесплатно, качественно |
| Bot name | **Boxly** (`@boxly_game_bot`) | Короткое, бренд, не клон |

### Команды для быстрого старта новой сессии

```bash
cd /Users/andrejpetrusihin/develop/personal/boxly
cat HANDOFF.md
source .env.local && curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
npm run dev   # локальный дев на 5173
```

## Deploy (E10+)

Автодеплой: `git push origin main` → GitHub Actions → GH Pages.
Ручной: `npm run build` (проверить локально), далее push.

Быстро проверить прод отвечает: `curl -sI https://imolatte.github.io/boxly/`

Webhook (отдельный проект): `/tmp/boxly-webhook/` → правка → `cd /tmp/boxly-webhook && vercel --prod --yes --scope imolattes-projects`

---

## Промт для новой сессии (E11 — красивые подарки)

```
Продолжи работу над Telegram Mini App Boxly в /Users/andrejpetrusihin/develop/personal/boxly.

ПЕРВЫМ ДЕЛОМ прочитай HANDOFF.md целиком — там вся механика, инфра, история багов, и
подробный план на E11 в секции "E11 (NEXT) — Красивые подарки эмодзи-стиль".

Кратко: E1–E10 готовы, MVP играбельный на https://imolatte.github.io/boxly/ (GH Pages, auto-deploy
из main через GitHub Actions). Бот @boxly_game_bot, webhook на /start крутится
на https://boxly-webhook.vercel.app. Репо https://github.com/Imolatte/boxly.

Задача E11: заменить плоские Phosphor-иконки подарков на объёмные "эмодзи-стиль" визуалы —
с блеском, градиентами, распознаваемой формой. Сейчас в src/config/gifts.ts у каждого
из 10 уровней просто { icon: 'ph:gift', color: '#hex' }. Выглядит как демо-иконпак.

План из HANDOFF (кратко):
- Путь 1 — Fluent Emoji через iconify (@iconify/react поддерживает fluent-emoji:* и noto:*) — рекомендуемый старт.
- Путь 2 — SVG-композиция с градиентами и highlight-слоями — для уникальности.
- Путь 3 — AI-генерация PNG/SVG — дорого.

Делай путь 1 сначала: подбери 10 эмодзи для lvl1–lvl10 с нарастанием редкости/вау-фактора,
подставь их в gifts.ts, убедись что GiftSprite.tsx корректно рендерит (возможно надо
адаптировать фон, чтобы не перекрывал эмодзи), прогони локально через `npm run dev`,
снимай скрины, сравнивай. Аналогично для 10 коллекционок в collectibles.ts.

Сохрани существующие механики сияния (collectible ring, complete lvl>=7 breathing, part stripes,
intermediate half-badge) — они в GiftSprite.tsx в variants part/intermediate/complete/collectible.

После визуала — быстрый тест:
- npm test (35/35)
- npx tsc --noEmit (exit 0)
- npm run build (bundle ~+50-100 KB ожидаемо, потолок ~500 KB)
- git push (GH Pages задеплоит сам за ~40 сек)
- открой https://imolatte.github.io/boxly/ через Telegram бота, сравни с предыдущим

Для дизайнерских решений и SVG-композиций используй `designer` или `coder` субагент
с frontend-design/nothing-design скилом. Main thread НЕ зовёт frontend-design напрямую
(см. global rules про Skill Scoping).

Думай на Opus (main), делай на Sonnet (субагент). Автомод, автономно.
Не трогай hosting/webhook/bot config — всё рабочее. Только визуал подарков + коллекционок.

Бот @boxly_game_bot (ID 8705283199), токен в .env.local (`TELEGRAM_BOT_TOKEN`).
```

---

## Команды для быстрого старта новой сессии

```bash
cd /Users/andrejpetrusihin/develop/personal/boxly
cat HANDOFF.md
source .env.local && curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
git pull
npm run dev   # локальный дев на 5173 (или 5174)
```
