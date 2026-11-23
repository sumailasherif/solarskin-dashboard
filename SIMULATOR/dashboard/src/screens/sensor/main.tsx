// Screen 1 entry point: the sensor kit's console.
import { createRoot } from 'react-dom/client';
import '../../styles.css';
import { ScreenShell } from '../../ui/ScreenShell';
import { SensorScreen } from './SensorScreen';

createRoot(document.getElementById('root')!).render(
  <ScreenShell>{(state) => <SensorScreen state={state} />}</ScreenShell>,
);
