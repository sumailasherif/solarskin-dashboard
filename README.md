# SolarSkin Dashboard

Monitoring and impact dashboard for **SolarSkin**, a low-cost retrofit façade solar (PV) module for apartment blocks in Central Asia. SolarSkin generates electricity from sun-facing walls and shades those walls in summer to cut heat gain.

The pilot is one apartment block in Fergana, Uzbekistan (about 10 kWp, south wall). The project is an entry in the **Global Sustainability Challenge 2026–27** (Sustainable Energy).

> **Monitoring only.** This system reads sensors. It never switches or controls any electrical equipment.

## Project status

Work in progress. The milestones are listed in [docs/architecture.md](docs/architecture.md).

## Repository layout

```text
backend/     REST API (Node.js + Express + TypeScript)
frontend/    Dashboard (React + Vite + Tailwind)
shared/      Code used by more than one package (reading schema, constants)
SIMULATOR/   Fergana data generator + 3-MacBook test dashboard (sensor · website · home owner)
firmware/    ESP32 example sketch for the sensor kit
docs/        Architecture, payload format, hardware bill of materials
```

## Run it locally

You need **Node.js 22 or newer**.

```bash
npm install              # install everything (all packages at once)
cp .env.example .env     # then paste your Neon DATABASE_URL into .env
npm run dev              # starts API (port 4000) + dashboard (port 5173)
```

- Dashboard: <http://localhost:5173>
- API health check: <http://localhost:4000/api/v1/health>

## Useful commands

| Command             | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start backend and frontend together     |
| `npm test`          | Run all tests                           |
| `npm run lint`      | Look for likely bugs                    |
| `npm run typecheck` | Check TypeScript types in every package |
| `npm run format`    | Auto-format all files with Prettier     |
| `npm run build`     | Build the dashboard for production      |

GitHub Actions runs lint, format check, type-check, tests and build on every push (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Database

We use free hosted PostgreSQL on [Neon](https://neon.tech), so you don't need to install a database. Create a project there and put its connection string in `.env` as `DATABASE_URL`.

## Credits
Licensed under the [MIT Licence](LICENSE).
