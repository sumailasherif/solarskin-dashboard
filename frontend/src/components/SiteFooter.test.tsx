import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';
import { buildMailto } from './ContactForm';

describe('<SiteFooter />', () => {
  it('shows the contact email as a mailto link, and the contact form', () => {
    render(<SiteFooter email="team@example.org" />);
    const link = screen.getByRole('link', { name: 'team@example.org' });
    expect(link).toHaveAttribute('href', 'mailto:team@example.org');
    expect(screen.getByRole('form', { name: 'Say hello.' })).toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toHaveAttribute('type', 'email');
  });

  it('hides the email and the form when no email is set', () => {
    render(<SiteFooter email="" />);
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByText('SolarSkin © 2026')).toBeInTheDocument();
  });
});

describe('buildMailto', () => {
  it('fills in the subject and body, safely encoded', () => {
    const url = buildMailto('team@example.org', {
      name: 'Aziza',
      from: 'aziza@example.org',
      text: 'Hello & thanks!',
    });
    expect(url.startsWith('mailto:team@example.org?subject=')).toBe(true);
    expect(decodeURIComponent(url.split('subject=')[1]!.split('&body=')[0]!)).toBe(
      'SolarSkin: message from Aziza',
    );
    expect(decodeURIComponent(url.split('&body=')[1]!)).toBe(
      'Hello & thanks!\n\n— Aziza (aziza@example.org)',
    );
  });
});
