import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('<SiteFooter />', () => {
  it('shows the contact form (and no visible email address)', () => {
    render(<SiteFooter email="team@example.org" />);
    expect(screen.getByRole('form', { name: 'Say hello.' })).toBeInTheDocument();
    expect(screen.queryByText('team@example.org')).not.toBeInTheDocument();
  });

  it('shows clear errors when the form is sent empty', () => {
    render(<SiteFooter email="team@example.org" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hides the form when no email is set', () => {
    render(<SiteFooter email="" />);
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByText('SolarSkin © 2026')).toBeInTheDocument();
  });
});
