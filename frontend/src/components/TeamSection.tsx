// "Team": the five people behind SolarSkin, in four countries.
// Each person gets a tall arch-shaped photo (like a sun rising over a wall), their name
// in Fraunces Italic, their programme and university, their position on a tag in their
// own colour, and one sentence on what they own and deliver. The cards are staggered up and down.
// The list of people lives in content/team.ts.
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { initials, TEAM, type TeamMember } from '../content/team';
import { Reveal } from './Reveal';

// The arch: a half circle on top (50% of the width; on a 3:4 card that is 37.5% of the height),
// softly rounded at the bottom. ("rounded-t-full" would squash the bottom corners to zero.)
const ARCH = 'rounded-t-[50%_37.5%] rounded-b-[2rem]';

/**
 * One person: arch photo (ringed in their colour) + name + credential + position tag + one sentence.
 */
function MemberCard({ member }: { member: TeamMember }) {
  // Their colour, used by the classes below as var(--accent)
  const accent = { '--accent': member.color } as CSSProperties;

  return (
    <article style={accent} className="group text-center">
      <div className="relative transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-translate-y-2">
        {/* Glow in their colour behind the photo on hover */}
        <div
          aria-hidden
          className={`absolute -inset-3 ${ARCH} bg-(--accent) opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60`}
        />

        {/* Coloured ring: a thin white gap, then their colour */}
        <div className={`relative ${ARCH} bg-(--accent) p-[3px]`}>
          <div className={`relative ${ARCH} bg-white p-[3px]`}>
            <div className={`relative aspect-[3/4] overflow-hidden ${ARCH}`}>
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full scale-(--zoom) object-cover transition-[scale] duration-700 group-hover:scale-(--hover-zoom)"
                  style={
                    {
                      objectPosition: member.focus,
                      transformOrigin: member.focus,
                      // resting zoom, and a little more on hover
                      '--zoom': member.zoom ?? 1,
                      '--hover-zoom': (member.zoom ?? 1) + 0.06,
                    } as CSSProperties
                  }
                />
              ) : (
                // No photo yet: their initials, big, in their colour
                <div
                  role="img"
                  aria-label={member.name}
                  className="grid h-full w-full place-items-center bg-gradient-to-b from-forest-700 to-forest-950"
                >
                  <span className="font-serif text-6xl text-(--accent) italic">
                    {initials(member.name)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-5 font-serif text-2xl leading-tight italic">{member.name}</h3>
      <p className="mx-auto mt-1.5 max-w-[16rem] text-xs leading-snug text-balance text-forest-950/50">
        {member.credential}
      </p>

      {/* Thin line, then their position on a solid tag in their colour */}
      <span aria-hidden className="mx-auto mt-3 block h-px w-12 bg-forest-950/15" />
      <p className="mt-3 inline-block rounded-md bg-(--accent) px-3 py-1 text-xs font-semibold text-forest-950">
        {member.title}
      </p>

      <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-forest-950/65">
        {member.about}
      </p>
    </article>
  );
}

export function TeamSection() {
  const { t } = useTranslation();

  return (
    <section
      id="team"
      className="relative overflow-hidden bg-white px-4 py-24 text-forest-950 sm:px-8 sm:py-32"
    >
      {/* Soft sun glow in the top corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(245,184,46,0.18),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-none italic">
            {t('team.title')}
          </h2>
          <p className="mt-5 text-lg text-forest-950/70">{t('team.intro')}</p>
        </Reveal>

        {/* Phones: 2 columns (last one centred) · tablets/laptops: 3 (middle one lower) · wide screens: all 5 (every 2nd lower) */}
        <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 md:grid-cols-3 md:pb-16 xl:grid-cols-5 xl:gap-x-6">
          {TEAM.map((member, i) => (
            <li
              key={member.name}
              className={`max-md:last:col-span-2 max-md:last:mx-auto max-md:last:w-1/2 ${i % 3 === 1 ? 'md:max-xl:translate-y-16' : ''} ${i % 2 ? 'xl:translate-y-16' : ''}`}
            >
              <Reveal delayMs={i * 120}>
                <MemberCard member={member} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
