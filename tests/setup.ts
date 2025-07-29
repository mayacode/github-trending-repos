import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import '@testing-library/dom';

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

global.jest = {
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
} as any;

vi.resetModules();
