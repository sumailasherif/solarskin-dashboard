// Screen 2 entry point: the real website's look, with simulated readings.
import { createRoot } from 'react-dom/client';
import '../../styles.css';
import '@site/i18n'; // the website's own text (frontend/src/locales/en.json)
import { ScreenShell } from '../../ui/ScreenShell';
import { WebsiteScreen } from './WebsiteScreen';

createRoot(document.getElementById('root')!).render(
  <ScreenShell>{(state) => <WebsiteScreen state={state} />}</ScreenShell>,
);
