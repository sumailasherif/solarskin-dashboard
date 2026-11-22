// Component test: render the page in a fake browser and check what a person would see.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('<App />', () => {
  it('shows the four KPI cards', () => {
    render(<App />);

    expect(screen.getByText('Energy generated')).toBeInTheDocument();
    expect(screen.getByText('CO₂ avoided')).toBeInTheDocument();
    expect(screen.getByText('Wall cooling')).toBeInTheDocument();
    expect(screen.getByText('Peak irradiance')).toBeInTheDocument();
  });

  it('says "No data yet" instead of inventing numbers', () => {
    render(<App />);

    expect(screen.getAllByText('No data yet')).toHaveLength(4);
  });
});
