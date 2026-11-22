// The whole dashboard page, top to bottom:
//   header + menu → hero → ticker → live → impact numbers → KPI cards → method → footer.
// SolarSkin's own look: forest greens (sustainability) + solar yellow (energy),
// Unbounded + Sora fonts, an animated solar-façade skyline, leaf-shaped cards,
// outlined count-up numbers and sections that rise into view as you scroll.
// Live values are null until the API exists (Milestone 7). We show "No data yet"
// rather than fake numbers.
import { useTranslation } from 'react-i18next';
import { CountUp } from './components/CountUp';
import { HeroScene } from './components/HeroScene';
import { KpiCard } from './components/KpiCard';
import { LiveSection } from './components/LiveSection';
import { Marquee } from './components/Marquee';
import { OrbitBadge } from './components/OrbitBadge';
import { Reveal } from './components/Reveal';
import { SiteHeader } from './components/SiteHeader';

// The four big planning numbers from the project brief. Each is labelled as an estimate.
const IMPACT = ['size', 'yield', 'factor', 'scale'] as const;

// The four live KPI cards. `note` = an optional key for a small explanation line.
const KPIS = [
  { key: 'energy', note: false },
  { key: 'co2', note: true },
  { key: 'cooling', note: true },
  { key: 'irradiance', note: false },
] as const;

type MethodItem = { h: string; p: string };

export default function App() {
  const { t } = useTranslation();
  const noData = t('noData');
  const methodItems = t('method.items', { returnObjects: true }) as MethodItem[];
  const ticker = t('ticker', { returnObjects: true }) as string[];

  return (
    <div id="top" className="overflow-x-clip">
      <SiteHeader />

      <main>
        {/* 1. HERO: the animated skyline fills the screen; text sits on the left */}
        <section className="relative flex min-h-svh items-center overflow-hidden px-4 pt-28 pb-16 sm:px-8">
          <HeroScene className="absolute inset-0 h-full w-full" />

          {/* Darker on the left so the text is easy to read over the drawing */}
          <div
            aria-hidden
            className="absolute inset-0 bg-forest-950/55 lg:bg-transparent lg:bg-gradient-to-r lg:from-forest-950/95 lg:via-forest-950/60 lg:to-transparent"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex animate-rise items-center gap-2 rounded-full bg-leaf/15 px-4 py-2 text-xs font-semibold text-leaf-300 ring-1 ring-leaf/30 backdrop-blur">
                <span aria-hidden className="h-2 w-2 rounded-full bg-leaf" />
                {t('hero.eyebrow')}
              </p>
              <h1 className="font-display text-[clamp(2.2rem,6.5vw,5.25rem)] leading-[1.02] font-bold uppercase">
                <span className="block animate-rise [animation-delay:120ms]">
                  {t('hero.line1')}
                </span>
                <span className="block animate-rise text-solar [animation-delay:260ms]">
                  {t('hero.line2')}
                </span>
              </h1>
              <p className="mt-6 max-w-lg animate-rise text-base leading-relaxed text-white/80 [animation-delay:400ms] sm:text-lg">
                {t('hero.lead')}
              </p>
              <a
                href="#live"
                className="mt-8 inline-flex animate-rise items-center gap-3 rounded-full bg-solar px-6 py-3.5 text-sm font-semibold text-forest-950 transition-all [animation-delay:540ms] hover:gap-5 hover:bg-solar-300"
              >
                {t('hero.cta')}
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>

          {/* Spinning badge, bottom left of the building */}
          <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 md:block lg:right-auto lg:left-[52%]">
            <OrbitBadge text={t('hero.orbit')} href="#live" label={t('hero.cta')} />
          </div>
        </section>

        {/* Yellow ticker band */}
        <Marquee items={ticker} />

        {/* 2. LIVE: clock, sun path, range chips, chart */}
        <LiveSection />

        {/* 3. IMPACT: giant gradient numbers from the plan that count up, each labelled as an estimate */}
        <section id="impact" className="bg-forest-950 px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="text-xs font-semibold tracking-widest text-solar uppercase">
                {t('impact.kicker')}
              </p>
            </Reveal>
            <div className="mt-12 grid gap-x-12 gap-y-16 md:grid-cols-2">
              {IMPACT.map((key, i) => (
                <Reveal key={key} delayMs={(i % 2) * 150} className="border-t border-white/15 pt-8">
                  <p className="flex flex-wrap items-baseline gap-x-4">
                    <CountUp
                      value={t(`impact.${key}.value`)}
                      className={`bg-gradient-to-b bg-clip-text pb-2 font-display text-[clamp(3rem,10vw,8.5rem)] leading-none font-bold text-transparent tabular-nums ${
                        i % 2 ? 'from-leaf-300 to-leaf/40' : 'from-solar-300 to-solar/40'
                      }`}
                    />
                    <span className="font-display text-lg text-white sm:text-2xl">
                      {t(`impact.${key}.unit`)}
                    </span>
                  </p>
                  <p className="mt-4 max-w-sm text-lg text-white/80">{t(`impact.${key}.text`)}</p>
                  <span className="mt-4 inline-block rounded-full px-3 py-1 text-xs text-white/60 ring-1 ring-white/20">
                    {t('impact.estimate')}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. MEASURE: solid yellow section with the four KPI cards */}
        <section id="measure" className="bg-solar px-4 py-24 text-forest-950 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <h2 className="text-center font-display text-[clamp(2.2rem,7.5vw,6rem)] leading-[1.02] font-bold uppercase">
                {t('measure.title1')} {t('measure.title2')}
                <br />
                {t('measure.title3')}
              </h2>
              <p className="mx-auto mt-6 max-w-md text-center text-base">{t('measure.lead')}</p>
            </Reveal>

            {/* 1 column on phones, 2 on tablets, 4 on desktops */}
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {KPIS.map(({ key, note }, i) => (
                <Reveal key={key} delayMs={i * 120}>
                  <KpiCard
                    index={`0${i + 1}`}
                    label={t(`kpi.${key}.label`)}
                    value={null}
                    unit={t(`kpi.${key}.unit`)}
                    note={note ? t(`kpi.${key}.note`) : undefined}
                    noDataText={noData}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. METHOD: how the numbers are made */}
        <section id="method" className="bg-forest px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <h2 className="font-display text-[clamp(1.8rem,5vw,3.75rem)] leading-none font-bold uppercase">
                {t('method.title')}
              </h2>
            </Reveal>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {methodItems.map((item, i) => (
                <li key={item.h}>
                  <Reveal delayMs={i * 150} className="border-t border-white/20 pt-6">
                    <span className="font-display text-sm text-leaf">0{i + 1}</span>
                    <h3 className="mt-4 text-lg font-semibold">{item.h}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{item.p}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="bg-forest-950 px-4 py-10 text-center text-xs text-white/50 sm:px-8">
        {t('footer')}
      </footer>
    </div>
  );
}
