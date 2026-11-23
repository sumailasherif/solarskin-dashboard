// The contact form: name, email, message, and a thank-you state after sending.
// Checking and building the email live in lib/contact.ts (tested there).
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildMailto,
  MESSAGE_MAX,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from '../lib/contact';

const EMPTY: ContactValues = { name: '', email: '', message: '' };

const INPUT =
  'peer w-full rounded-2xl border bg-white/[0.04] px-4 pt-6 pb-2 text-white outline-none transition placeholder:text-transparent focus:bg-white/[0.07]';

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (props: {
    id: string;
    className: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
};

/** A text field with a floating label and (optional) error message below it */
function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="relative">
        {children({
          id,
          className: `${INPUT} ${error ? 'border-orange-400' : 'border-white/15 focus:border-solar'}`,
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? errorId : undefined,
        })}
        <label
          htmlFor={id}
          className="pointer-events-none absolute top-2 left-4 text-xs text-white/50 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-solar"
        >
          {label}
        </label>
      </div>
      <div className="mt-1 flex justify-between gap-4 px-1 text-xs">
        <p id={errorId} className="text-orange-300">
          {error}
        </p>
        {hint}
      </div>
    </div>
  );
}

export function ContactForm({ to }: { to: string }) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sentBy, setSentBy] = useState<string | null>(null); // name of the sender after "Send"

  const update = (field: keyof ContactValues) => (value: string) =>
    setValues((v) => ({ ...v, [field]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    window.location.href = buildMailto(to, values);
    setSentBy(values.name.trim());
  };

  // Thank-you state
  if (sentBy) {
    return (
      <div role="status" className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10">
        <p className="font-serif text-3xl italic">{t('contact.thanks', { name: sentBy })}</p>
        <p className="mt-2 text-sm text-white/70">{t('contact.opened')}</p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setSentBy(null);
          }}
          className="mt-4 text-sm text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white"
        >
          {t('contact.again')}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-label={t('contact.title')} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('contact.name')} error={errors.name && t(errors.name)}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              placeholder={t('contact.name')}
              value={values.name}
              onChange={(e) => update('name')(e.target.value)}
            />
          )}
        </Field>
        <Field label={t('contact.email')} error={errors.email && t(errors.email)}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              placeholder={t('contact.email')}
              value={values.email}
              onChange={(e) => update('email')(e.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        label={t('contact.message')}
        error={errors.message && t(errors.message)}
        hint={
          <span className="shrink-0 text-white/40 tabular-nums">
            {values.message.length}/{MESSAGE_MAX}
          </span>
        }
      >
        {(props) => (
          <textarea
            {...props}
            rows={4}
            maxLength={MESSAGE_MAX}
            placeholder={t('contact.message')}
            value={values.message}
            onChange={(e) => update('message')(e.target.value)}
            className={`${props.className} resize-none`}
          />
        )}
      </Field>

      <div className="flex justify-end">
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
          <svg
            viewBox="0 0 16 16"
            className="relative h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
          </svg>
        </button>
      </div>
    </form>
  );
}
