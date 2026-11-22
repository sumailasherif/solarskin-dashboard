# ESP32 firmware (coming in Milestone 11)

An Arduino-style example sketch for the SolarSkin sensor kit will be added here. It will:

- connect to WiFi and send readings **out** over HTTPS with its own API key (no server runs on the device);
- read the sensors: DS18B20 temperature probes, an INA219/INA226 power monitor, and a pyranometer or reference cell for irradiance;
- store readings in flash while offline and upload them later;
- use a hardware watchdog to reboot itself if it hangs, and report `uptime_s` and `reboot_count`;
- fetch its reading interval from the API.

**Monitoring only:** the firmware never switches or controls any electrical equipment.
