// Runs before every frontend test.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; // adds matchers like toBeInTheDocument()
import './i18n'; // so components can use translations in tests

// Remove whatever the previous test rendered, so tests don't see each other's output.
afterEach(cleanup);
