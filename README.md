# SSI Log Importer

A small self-hostable web app that imports dive-computer log files into your
[SSI](https://www.divessi.com/) (Scuba Schools International) logbook.

The official SSI app can only pull dives from computers it integrates with
directly. If you export your dives as JSON from your computer's own software,
this tool converts that export into the format SSI's backend expects and pushes
it straight into your logbook — depth profile, temperature, tank pressure,
gradient factors, GPS and all.

Right now it understands **Suunto** dive-log JSON exports. Other computers can
be added without touching the rest of the app — see
[Adding another dive computer](#adding-another-dive-computer). PRs welcome.

> **Unofficial.** This project is not affiliated with SSI or Suunto. It talks to
> the same private API the SSI mobile app uses (`api.divessi.com`). Your SSI
> email and password are sent directly to SSI to obtain a session token; the
> token is what this app stores. Use it at your own risk.

## How it works

1. **Log in** with your SSI account. The app authenticates against SSI and keeps
   the returned token in an encrypted, `httpOnly` session cookie. Credentials
   are never stored.
2. **Your existing logbook** is fetched from SSI and shown on the home screen
   with per-dive stats.
3. **Import a dive.** Drop in a Suunto `.json` export. The file is validated,
   parsed, and converted to an SSI dive record.
4. **Pick the site.** If the export contains GPS coordinates, the nearest known
   SSI dive site (within 5 km) is preselected automatically. Otherwise, search
   SSI's global site database by name.
5. **Submit.** The dive is written to your SSI logbook via the `save_divelog`
   RPC and shows up everywhere the SSI app does.

Dive-site and dive-center lookups run against SSI's public data dumps, which the
server downloads and caches on first boot (see [Data directory](#data-directory)),
so site search stays fast and works offline after the initial fetch.

### What gets converted

The Suunto → SSI converter (`src/lib/integrations/suunto/converter.ts`) maps:

- Max / average depth, dive time, date & entry time
- Water temperature min/max (from per-sample readings, nearest-neighbour filled)
- Start/end tank pressure and the full tank-pressure profile
- Depth, temperature and gradient-factor (surface GF) sample datasets at 5 s resolution
- Surface interval before the dive
- GPS start position (from the first `DiveRouteOrigin` sample)
- Dive computer metadata (model, serial, firmware)

The Suunto schema (`src/lib/integrations/suunto/schema.ts`) is deliberately
**permissive**: Suunto exports carry hundreds of fields per sample and firmware
updates add more over time, so only the fields the converter actually reads are
validated. Unknown keys are ignored rather than rejected.

## Tech stack

- **[TanStack Start](https://tanstack.com/start)** (React 19, SSR, file-based
  routing, server functions) on **[Nitro](https://nitro.build/)**
- **[TanStack Query](https://tanstack.com/query)** / Form / Pacer for data,
  forms and debouncing
- **Tailwind CSS v4** with **shadcn/ui** + **Base UI** components
- **[Bun](https://bun.sh/)** as the runtime, **Vite 8** for building
- **[Biome](https://biomejs.dev/)** for linting/formatting, **Vitest** for tests
- **[Zod](https://zod.dev/)** for schema validation

## Getting started

Requires [Bun](https://bun.sh/) (v1+).

```sh
bun install
```

Create a `.env` with a session secret (any random string of at least 32 chars):

```sh
SESSION_SECRET=$(openssl rand -hex 32)
```

### Dev mode

```sh
bun run dev
```

Starts the app at http://localhost:3000 with hot-module reloading. On first
start the server downloads and caches the SSI site/center data into `./data`
(a few tens of MB); this only happens once.

### Build

```sh
bun run build       # production build into .output/
bun run preview     # serve the production build locally
```

The production server entrypoint is `.output/server/index.mjs`, run with
`bun run .output/server/index.mjs`.

### Tests, linting, types

```sh
bun test            # run the Vitest suite (converter + schema tests)
bun run check       # Biome lint + format check
bun run format      # Biome autoformat
bun run typecheck   # tsc --noEmit
```

The converter is covered by snapshot tests against real sample exports in
`samples/`, so changes to the mapping logic are easy to review.

## Configuration

| Variable         | Required | Default   | Description                                                        |
| ---------------- | -------- | --------- | ------------------------------------------------------------------ |
| `SESSION_SECRET` | yes      | —         | Secret used to encrypt the session cookie. Minimum 32 characters.  |
| `DATA_DIR`       | no       | `./data`  | Where the cached SSI site/center JSON is stored.                   |
| `NODE_ENV`       | no       | —         | `production` enables the `secure` cookie flag (HTTPS only).        |

Bun loads `.env` automatically — no `dotenv` needed.

### Data directory

On startup a Nitro plugin (`src/server/plugins/ssi-data.ts`) ensures SSI's
public dive-site and dive-center caches are present in `DATA_DIR`, downloading
and unzipping them if missing. These power the offline site search and
nearest-site lookup. Persist this directory across restarts to avoid
re-downloading (and to survive if SSI's public endpoints are ever unavailable).

## Self-hosting

A prebuilt image is published to Docker Hub as
[`agrippa1994/divessi-log-importer`](https://hub.docker.com/r/agrippa1994/divessi-log-importer)
on every push to `main` (`latest`) and every `v*` tag (the version number).

### Docker

```sh
docker run -d \
  --name ssi-log \
  -p 3000:3000 \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  -v ssi-log-data:/data \
  -e DATA_DIR=/data \
  agrippa1994/divessi-log-importer:latest
```

### Docker Compose

An example `compose.yaml` for self-hosting the published image:

```yaml
services:
  ssi-log:
    image: agrippa1994/divessi-log-importer:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # Generate once with: openssl rand -hex 32
      SESSION_SECRET: "change-me-to-a-random-32+-char-secret"
      DATA_DIR: /data
      NODE_ENV: production
    volumes:
      - ssi-log-data:/data

volumes:
  ssi-log-data:
```

```sh
docker compose up -d
```

Then open http://localhost:3000 and log in with your SSI account. Put it behind
a reverse proxy with TLS for anything beyond localhost — the session cookie is
only marked `secure` when `NODE_ENV=production`, so it should always be served
over HTTPS in that case.

> The `docker-compose.yaml` checked into the repo is for **building** the image
> locally (`docker compose --profile build build`), not for running the published
> one. Use the compose file above for self-hosting.

### Building the image yourself

```sh
docker build -t ssi-log .
```

The [`Dockerfile`](./Dockerfile) is a multi-stage Bun build: install
dependencies, `bun run build`, then ship only `.output` on top of `oven/bun`.

### Kubernetes

A minimal Helm chart lives in [`deployment/`](./deployment). It deploys the
image with a `PersistentVolumeClaim` for `DATA_DIR`, a health-checked
`Deployment` (`/api/health`), a `Service`, and a cert-manager-annotated
`Ingress`.

```sh
helm upgrade --install ssi-log ./deployment \
  --set app.host=dives.example.com \
  --set app.env.SESSION_SECRET=$(openssl rand -hex 32) \
  --set app.version=latest
```

Adjust `deployment/values.yaml` (image, hostname, storage size, session secret)
to your cluster.

## Adding another dive computer

The importer is structured so that a new computer is a self-contained addition
under `src/lib/integrations/<vendor>/`. To add one:

1. **Schema** — describe the export format with a permissive Zod schema
   (`schema.ts`). Only validate the fields your converter reads; allow unknown
   keys so firmware changes don't break parsing.
2. **Converter** — write a function that turns a parsed export into a
   `CreateDive` (the SSI dive record defined in
   `src/lib/integrations/ssi/create-dive.ts`). The Suunto converter is a
   complete reference for which fields matter and how depth/temperature/pressure
   datasets are serialized.
3. **Tests** — add a sample export under `samples/` and a snapshot test, like
   `converter.test.ts`, so the mapping is verifiable.
4. **Wire it up** — extend the import dialog
   (`src/components/dives/import-dive-dialog.tsx`) to detect and accept the new
   format.

Open a PR — support for more computers is exactly the kind of contribution this
project is meant to grow through.

## Project layout

```
src/
  routes/                      TanStack Start file routes (/, /login, /api/health)
  components/
    dives/                     Logbook UI + the import dialog
    ui/, reui/                 shadcn/ui and Base UI components
  lib/
    integrations/
      ssi/                     SSI API client, auth, logbook, site search, CreateDive type
      suunto/                  Suunto schema + converter (+ tests)
    session*.ts                Encrypted session handling
    units.ts                   Unit conversions + haversine distance
    env.ts                     Validated environment config
  server/plugins/ssi-data.ts   Boot-time SSI data cache download
deployment/                    Helm chart
samples/                       Real dive-log exports used by tests
```

## License

[MIT](./LICENSE) © Manuel Leitold
