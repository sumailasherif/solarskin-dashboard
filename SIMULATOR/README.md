# SolarSkin Simulator

Test the whole system before the pilot wall is installed. One page shows **three MacBooks**:

| Screen                 | What it shows                                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 · Sensor kit**     | The ESP32's own console: every sensor's live value, where each sensor sits on the wall, the serial monitor and the exact JSON payload it POSTs every minute.                 |
| **2 · Public website** | The real SolarSkin website (its own components from `frontend/src`) filled with readings: live power curve, KPI cards, measured impact, device health and the offline alert. |
| **3 · Home owner**     | A friendly portal for residents: power right now, kWh, ≈ UZS value, CO₂, wall cooling, week chart, notifications and pop-ups.                                                |

Everything is **simulated data**, clearly labelled. Nothing here is a real reading.

## Run it

```bash
npm install            # once, from the repo root
npm run simulator      # opens http://localhost:5180
```

Use **Open full size ↗** above a MacBook to open that screen in its own tab at real size.
It keeps updating as long as the control-room tab stays open.

## Controls

- **Time:** pause/play and speed, from real time up to 3600× (one hour per second). At 60× the kit sends one reading per second.
- **Weather:** clear, partly cloudy (clouds come and go) or overcast.
- **Faults:**
  - **Wi-Fi off:** the kit keeps measuring and stores readings. After 30 minutes the website and owner app raise the offline alert. When Wi-Fi returns, the stored readings are back-filled, so no data is lost.
  - **Kit power off:** nothing is measured, which leaves a real gap in the chart. Power coming back counts as a reboot.
  - **Reboot kit:** the kit skips one reading and the reboot counter goes up.
  - **Wi-Fi outage, 45 min:** the whole offline → alert → back-fill story in one click.
- **Start at:** any date and time, or a preset such as summer day, winter day, spring sunrise or night. The day so far and the previous 13 days are filled in for you.

## Folder layout

```text
src/model/        Fergana "physics": sun position, sunlight on the south wall, temperatures, power
                  (pure functions, shared with the Milestone 5 command-line simulator)
src/index.ts      Command-line simulator: `npm start -w SIMULATOR [-- 2026-06-21]`
dashboard/
  index.html      Control room (src/control): the controls + the 3 MacBooks
  sensor.html     Screen 1 (src/screens/sensor)
  website.html    Screen 2 (src/screens/website), built from the website's own components via "@site"
  owner.html      Screen 3 (src/screens/owner)
  src/engine/     The simulation: kit + server, stats (kWh, CO₂, UZS), BroadcastChannel to the screens
  src/ui/         Charts, number/time formatting, the screen wrapper
```

## How realistic is it?

- **Sun:** NOAA solar-position equations for Fergana (40.38° N, 71.78° E), with times in Asia/Tashkent.
- **Sunlight on the wall:** clear-sky model × cloudiness, projected onto a vertical south wall. A south wall gets more sun in winter, when the sun is low, than in summer.
- **Power:** 10 kWp × sunlight × a temperature loss of −0.4 %/°C × 70 % system efficiency. The 70 % is **tuned** so a typical year lands near the brief's 800 kWh/kWp planning yield (the test checks 800 ± 20 %).
- **Walls:** the bare wall heats up with sunlight (with a 1-hour lag). The shaded wall behind the modules stays close to the air temperature by day and is slightly warmer at night.
- **CO₂:** 0.55 kg/kWh (UNFCCC CDM ASB0003), with 0.47 as a sensitivity check. Money uses 650 UZS/kWh (tariff from 1 June 2026) and is shown as an estimate.

## Tests

```bash
npm test -w SIMULATOR
```

These check the model (local time, sun position, no power at night, clear beats overcast, shaded wall cooler, annual yield near plan) and the engine (Wi-Fi outage with back-fill, power-cut gap with reboot, midnight rollover).
