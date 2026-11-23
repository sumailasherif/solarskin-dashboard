import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('<SiteFooter />', () => {
  it('shows the contact email as a mailto link', () => {
    render(<SiteFooter email="team@example.org" />);
    const link = screen.getByRole('link', { name: 'team@example.org' });
    expect(link).toHaveAttribute('href', 'mailto:team@example.org');
  });

  it('hides the contact line when no email is set', () => {
    render(<SiteFooter email="" />);
    expect(screen.queryByText('Get in touch')).not.toBeInTheDocument();
    expect(screen.getByText('SolarSkin © 2026')).toBeInTheDocument();
  });
});
