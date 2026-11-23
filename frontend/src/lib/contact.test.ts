import { describe, expect, it } from 'vitest';
import { buildMailto, validateContact, type ContactValues } from './contact';

const GOOD: ContactValues = {
  name: 'Aziza',
  email: 'aziza@example.org',
  message: 'Can our block in Fergana join the pilot?',
};

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(GOOD)).toEqual({});
  });

  it('flags a missing name, a bad email and a too-short message', () => {
    expect(validateContact({ ...GOOD, name: ' ', email: 'aziza@', message: 'Hi' })).toEqual({
      name: 'contact.errors.name',
      email: 'contact.errors.email',
      message: 'contact.errors.message',
    });
  });
});

describe('buildMailto', () => {
  it('fills in the subject and body, safely encoded', () => {
    const url = buildMailto('team@example.org', { ...GOOD, message: 'Hello & thanks!' });
    const [address, query] = url.split('?');
    const params = new URLSearchParams(query);

    expect(address).toBe('mailto:team@example.org');
    expect(params.get('subject')).toBe('SolarSkin · message from Aziza');
    expect(params.get('body')).toBe('Hello & thanks!\n\n— Aziza (aziza@example.org)');
  });
});
