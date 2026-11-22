// Entry point: builds the app and starts listening for HTTP requests.
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`☀️  SolarSkin API running at http://localhost:${env.PORT}/api/v1/health`);
});
