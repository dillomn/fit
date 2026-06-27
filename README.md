# Fit — personal training journal

A single-user, mobile-first PWA for tracking workouts, body weight, and nutrition.
Built with Next.js 15 (App Router), Prisma + SQLite, and Tailwind. Designed to be
self-hosted behind a reverse proxy (e.g. at `fit.aperturelabs.au`).

## Features

- **Workout schedule & checklist** — a weekly schedule of workout templates; each
  template is an ordered exercise list you check off set-by-set.
- **Progress tracking** — log reps + weight per set; per-exercise strength charts
  (estimated 1RM via Epley, and heaviest top set over time).
- **Body weight & body fat** — log weigh-ins, see the trend toward your goal weight.
- **Calorie & macro targets** — Mifflin–St Jeor TDEE from your stats + chosen
  rate of weight change → daily calorie and protein/carb/fat targets, with a daily
  food log that tracks against them.
- **Installable PWA** — add to your phone's home screen for an app-like experience.

## Local development

```bash
cp .env.example .env        # then edit APP_PASSWORD + SESSION_SECRET
npm install
npm run db:push             # create the SQLite schema (dev.db)
npm run db:seed             # starter exercises + sample Push/Pull/Legs split
npm run dev                 # http://localhost:3000
```

Log in with the value of `APP_PASSWORD`.

## Configuration

| Variable         | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- |
| `DATABASE_URL`   | SQLite file location, e.g. `file:/data/fit.db` in Docker.     |
| `APP_PASSWORD`   | The single password used to log in.                           |
| `SESSION_SECRET` | Secret used to sign the session cookie. Use a long random string: `openssl rand -hex 32`. |
| `SEED_ON_START`  | (Docker) `true` to run the idempotent seed on boot.          |

## Deploying with Docker

1. Create a `.env` next to `docker-compose.yml`:

   ```env
   APP_PASSWORD=your-strong-password
   SESSION_SECRET=run-openssl-rand-hex-32-here
   ```

2. Build and start:

   ```bash
   docker compose up -d --build
   ```

   The container listens on `127.0.0.1:3000`. On first boot it creates the SQLite
   schema on the `fit_data` volume and seeds starter data. The database persists
   across restarts and rebuilds in the named volume.

3. Point your reverse proxy at `127.0.0.1:3000` and terminate TLS there. Example
   **Caddy**:

   ```caddy
   fit.aperturelabs.au {
       reverse_proxy 127.0.0.1:3000
   }
   ```

   Example **nginx**:

   ```nginx
   server {
       server_name fit.aperturelabs.au;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   The session cookie is `Secure` in production, so the app must be served over
   HTTPS (which your proxy provides).

## Backups

Everything lives in one SQLite file on the `fit_data` volume. To back up:

```bash
docker compose cp fit:/data/fit.db ./fit-backup-$(date +%F).db
```

## Tech notes

- Auth is a single password checked against `APP_PASSWORD`, exchanged for an
  HMAC-signed cookie verified in middleware (`src/middleware.ts`).
- All mutations are Next.js server actions in `src/lib/actions.ts`.
- Nutrition math lives in `src/lib/nutrition.ts`; the data model is in
  `prisma/schema.prisma`.
