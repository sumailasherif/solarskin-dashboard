// Screen 3 entry point: the home owner's portal.
import { createRoot } from 'react-dom/client';
import '../../styles.css';
import { ScreenShell } from '../../ui/ScreenShell';
import { OwnerScreen } from './OwnerScreen';

createRoot(document.getElementById('root')!).render(
  <ScreenShell>{(state) => <OwnerScreen state={state} />}</ScreenShell>,
);
