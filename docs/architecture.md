# SolarSkin Dashboard: architecture

The plan agreed in Milestone 1 (22 Nov 2026).

## Overview

```text
 ESP32 sensor kit ──HTTPS POST (API key)──┐
 Simulator (same API) ────────────────────┤
                                          ▼
                              ┌──────────────────────┐
                              │ Backend (Express+TS) │
                              │  /ingest  (devices)  │
 Admin browser ──login──────▶ │  /admin   (JWT)      │──▶ PostgreSQL
 Public / judges / AR app ──▶ │  /sites…  (read)     │
                              │  impact/ module      │◀── config/impact.ts
                              └──────────────────────┘
                                          ▲
                     React dashboard ─────┘ polls every 30 s
```

- **Monitoring only.** Devices only send data out. They never receive commands and never switch equipment.
- **One impact module.** Every number (dashboard, CSV, API) comes from `backend/src/impact/`. Constants such as emission factors and tariffs live in one config file.
- **Times are stored in UTC** and shown in Asia/Tashkent (UTC+5).

## Stack

| Part     | Choice                                                                                | Why                                                                       |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Frontend | React + Vite + TypeScript, Tailwind, Recharts, react-i18next                          | Popular, well documented, fast dev server                                 |
| Backend  | Node.js + Express 5 + TypeScript (run with `tsx`), zod                                | Familiar Express; zod checks every input                                  |
| Database | PostgreSQL on Neon (free tier) for both development and production, Prisma migrations | No local install needed; readable schema file, auto-generated migrations  |
| Auth     | Our own JWT in an httpOnly cookie; device keys stored as hashes                       | Small, understandable, no vendor lock-in                                  |
| Tests    | Vitest + Supertest + Testing Library                                                  | One test runner everywhere                                                |
| CI       | GitHub Actions: lint, typecheck, test, build                                          | Runs on every push                                                        |
| Hosting  | Frontend: Netlify/Vercel; backend: Render; DB: Neon                                   | Free tiers (Render's free Postgres expires after 30 days, so we use Neon) |

## Folder structure

```text
/backend     Express API: routes/, impact/, db/, auth/, config/
/frontend    React dashboard (locales/en.json; uz and ru later)
/shared      zod reading schema + types used by backend and simulator
/SIMULATOR   Fergana data generator → POST /ingest, plus the visual test dashboard
/firmware    ESP32 Arduino sketch
/docs        architecture, payload format, hardware BOM, methodology
```

## Database tables

| Table             | Key columns                                                                             |
| ----------------- | --------------------------------------------------------------------------------------- |
| `sites`           | slug, name, city, lat/lon, timezone, floors, flats, `has_building_meter`, `is_public`   |
| `arrays`          | site_id, name (e.g. "South wall"), azimuth°, tilt° (90), installed_kwp                  |
| `devices`         | array_id, name, reading_interval_s, firmware_version, last_seen_at                      |
| `device_api_keys` | device_id, key_prefix, key_hash, created_at, revoked_at, last_used_at                   |
| `readings`        | device_id, ts (UTC), received_at, sensor fields, quality_flags[], UNIQUE(device_id, ts) |
| `device_events`   | device_id, type (reboot / offline / online), ts                                         |
| `ingest_errors`   | device_id, received_at, error code, payload excerpt                                     |
| `admin_users`     | email, password_hash                                                                    |

## API (`/api/v1`, Swagger at `/api/docs`)

**Devices (API key):**

- `POST /ingest`: one reading, or a batch of up to 500
- `GET /device/config`: the device's reading interval

**Public:**

- `GET /sites`
- `GET /sites/:slug`
- `GET /sites/:slug/latest`
- `GET /sites/:slug/readings`
- `GET /sites/:slug/stats/daily`
- `GET /sites/:slug/stats/monthly`
- `GET /sites/:slug/impact`
- `GET /sites/:slug/health`
- `GET /sites/:slug/export.csv`
- `GET /methodology`

**Admin (cookie):**

- `/auth/login`, `/auth/logout`, `/auth/me`
- create, edit and delete sites, arrays and devices
- create and revoke device API keys
- view a device's ingest errors

## Data-quality rules

- **Malformed** payload (wrong types, missing timestamp): rejected with 400 and logged in `ingest_errors`.
- **Physically impossible** value (e.g. irradiance of 2,500 W/m²): stored with a quality flag and left out of calculations.
- **Duplicates** (same device + timestamp) are ignored, so retries are safe.
- **Gaps** longer than 3 × the reading interval are not bridged when integrating energy, and data completeness % is reported.

## Pilot defaults (until real details are known)

- One sensor kit on the south wall, with the unshaded reference wall on the same side.
- Fergana: 40.386 N, 71.786 E. 10 kWp.
- Shared-area meter supported, but off (self-consumption and LMI cards hidden).
- Money saved uses 650 UZS/kWh, labelled "estimate".
- Each site has a public on/off switch.
