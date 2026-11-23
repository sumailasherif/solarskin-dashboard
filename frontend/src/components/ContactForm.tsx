// A small contact form. The site has no server yet, so "Send" opens the visitor's own email
// app with a message to our address, already filled in. They just press send there.
// (When the backend is live, this can post to it instead.)
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type Message = { name: string; from: string; text: string };

/** Build the mailto: link that opens an email to `to`, with subject and body filled in. */
export function buildMailto(to: string, { name, from, text }: Message) {
  const subject = `SolarSkin: message from ${name}`;
  const body = `${text}\n\n— ${name} (${from})`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** One text field with a label that floats up when you type (the "peer" trick in Tailwind). */
function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  const id = `contact-${name}`;
  const isMessage = name === 'text';
  const input =
    'peer w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 pt-6 pb-2 text-white outline-none transition placeholder:text-transparent focus:border-solar focus:bg-white/[0.07]';

  return (
    <div className="relative">
      {isMessage ? (
        <textarea id={id} name={name} required rows={3} placeholder={label} className={`${input} resize-none`} />
      ) : (
        <input id={id} name={name} type={type} required placeholder={label} className={input} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-2 left-4 text-xs text-white/50 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-solar"
      >
        {label}
      </label>
    </div>
  );
}

export function ContactForm({ to }: { to: string }) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    window.location.href = buildMailto(to, {
      name: String(data.get('name')),
      from: String(data.get('from')),
      text: String(data.get('text')),
    });
    setOpened(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label={t('contact.title')}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="name" label={t('contact.name')} />
        <Field name="from" label={t('contact.email')} type="email" />
      </div>
      <Field name="text" label={t('contact.message')} />

      <div className="flex flex-wrap items-center gap-4 pt-1">
        {/* Same slide-up panel as the "See the live wall" button */}
        <button
          type="submit"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-solar px-6 py-3 text-sm font-semibold text-forest-950 transition hover:shadow-[0_0_24px_-4px] hover:shadow-solar"
        >
          <span
            aria-hidden
            className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
          />
          <span className="relative">{t('contact.send')}</span>
          <svg viewBox="0 0 16 16" className="relative h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
          </svg>
        </button>

        <p role="status" className="text-sm text-white/60">
          {opened ? t('contact.opened') : null}
        </p>
      </div>
    </form>
  );
}
