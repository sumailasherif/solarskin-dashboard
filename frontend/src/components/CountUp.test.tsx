// Regression test: a counter that hasn't scrolled into view must still show the real
// number. (Bug found before sharing: "8 GWh/yr" was shown as "0 GWh/yr".)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountUp } from './CountUp';

// A fake IntersectionObserver that never reports anything: the element is "off screen".
class NeverVisibleObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<CountUp />', () => {
  it('shows the real value before it scrolls into view (never "0")', () => {
    vi.stubGlobal('IntersectionObserver', NeverVisibleObserver);

    render(<CountUp value="8" />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('keeps thousands separators in the final value', () => {
    vi.stubGlobal('IntersectionObserver', NeverVisibleObserver);

    render(<CountUp value="8,000" />);

    expect(screen.getByText('8,000')).toBeInTheDocument();
  });
});
