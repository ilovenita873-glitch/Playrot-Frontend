# Brainrot Cases — Telegram Mini App (React + TS + Tailwind + Axios)

## Ishga tushirish
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev              # http://localhost:5173
npm run build
```
Telegram ichida ochish uchun dev serverni HTTPS tunnel (ngrok / cloudflared) orqali oching va URL ni @BotFather → Menu Button / Web App ga qo'ying.
Backend `.env` da `CORS_ORIGINS` ga shu frontend URL ni qo'shing (yoki `*`).

## Autentifikatsiya
Har so'rovda: `Authorization: tma <window.Telegram.WebApp.initData>`
(backend CORS faqat `Content-Type` va `Authorization` headerlariga ruxsat beradi.)
Javob formati: `{ success: true, data: ... }`.

## Ishlatiladigan endpointlar (hammasi src/services/api.ts da)
| Method | URL | Body | Javob (data) |
|---|---|---|---|
| GET | /user/me | – | User |
| PATCH | /user/settings | {sound?,streamerMode?,hideStats?,language?,theme?} | – |
| GET | /cases | – | CaseBox[] |
| GET | /cases/:id | – | CaseBox (items bilan) |
| GET | /cases/live | – | LiveDrop[] |
| POST | /cases/open | {caseId} | {item, balance} |
| POST | /games/upgrade | {bet, multiplier} | {win, payout, balance, chance} |
| POST | /games/crash | {bet, autoCashout} | {win, payout, balance, crashPoint} |
| POST | /games/mines/start | {bet, minesCount} | {gameId, balance} |
| POST | /games/mines/reveal | {gameId, index} | {safe, multiplier, mines?, balance?} |
| POST | /games/mines/cashout | {gameId} | {payout, balance, mines?} |
| POST | /games/tower/start | {bet} | {gameId, balance} |
| POST | /games/tower/step | {gameId, column} | {safe, level, multiplier, balance?} |
| POST | /games/tower/cashout | {gameId} | {payout, balance} |
| POST | /games/battle | {bet} | {win, payout, balance, yourRoll, opponent:{username,roll}} |
| GET | /farm | – | FarmState |
| POST | /farm/collect | – | {collected, balance, energy} |
| GET | /shop · POST /shop/buy | {itemId} | ShopItem[] · {balance} |
| GET | /quests · POST /quests/claim | {questId} | Quest[] · {balance} |

Backend route/maydon nomlari farq qilsa — faqat `src/services/api.ts` va `src/types/index.ts` ni moslang.
