// Runs before every frontend test.
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import type {} from '@testing-library/jest-dom/vitest'; // only the types for toBeInTheDocument() etc.
import './i18n'; // so components can use translations in tests

// Add matchers like toBeInTheDocument() to the SAME `expect` the tests use.
// (The usual `import '@testing-library/jest-dom/vitest'` shortcut sometimes added them to a
// different copy of `expect`, and the tests failed with "Invalid Chai property".)
expect.extend(matchers);

// Remove whatever the previous test rendered, so tests don't see each other's output.
afterEach(cleanup);
