// Control room entry point (index.html).
import { createRoot } from 'react-dom/client';
import '../styles.css';
import { ControlRoom } from './ControlRoom';

createRoot(document.getElementById('root')!).render(<ControlRoom />);
