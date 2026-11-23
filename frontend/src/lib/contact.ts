// The logic behind the contact form, kept separate from the UI so it's easy to test.
// The site has no server yet, so sending = opening the visitor's email app with the
// message already filled in (a "mailto:" link). They just press send there.

export type ContactValues = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<'name' | 'email' | 'message', string>>;

export const MESSAGE_MAX = 1000;
const MESSAGE_MIN = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Check the form. Returns the translation key of each problem, e.g. { email: 'contact.errors.email' }. */
export function validateContact({ name, email, message }: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (name.trim().length < 2) errors.name = 'contact.errors.name';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'contact.errors.email';
  const length = message.trim().length;
  if (length < MESSAGE_MIN || length > MESSAGE_MAX) errors.message = 'contact.errors.message';
  return errors;
}

/** The mailto: link that opens an email to `to`, with subject and body filled in. */
export function buildMailto(to: string, values: ContactValues) {
  const name = values.name.trim();
  const subject = `SolarSkin · message from ${name}`;
  const body = `${values.message.trim()}\n\n— ${name} (${values.email.trim()})`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
