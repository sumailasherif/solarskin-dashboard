// The whole dashboard page. For now it's the React version of the first prototype:
// header, 4 KPI cards, an empty chart area and a footer.
// Values are null until the API exists (Milestone 7). We show "No data yet"
// rather than fake numbers.
import { useTranslation } from 'react-i18next';
import { KpiCard } from './components/KpiCard';

export default function App() {
  const { t } = useTranslation();
  const noData = t('noData');

  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. HEADER */}
      <header className="bg-navy px-4 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span aria-hidden className="h-3 w-3 rounded-full bg-solar shadow-[0_0_16px_4px] shadow-solar/60" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('header.title')}</h1>
            <p className="text-sm text-white/70">{t('header.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        {/* 2. KPI CARDS: 1 column on phones, 2 on tablets, 4 on desktops */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label={t('kpi.energy.label')} value={null} unit={t('kpi.energy.unit')} noDataText={noData} />
          <KpiCard
            label={t('kpi.co2.label')}
            value={null}
            unit={t('kpi.co2.unit')}
            note={t('kpi.co2.note')}
            noDataText={noData}
          />
          <KpiCard
            label={t('kpi.cooling.label')}
            value={null}
            unit={t('kpi.cooling.unit')}
            note={t('kpi.cooling.note')}
            noDataText={noData}
          />
          <KpiCard label={t('kpi.irradiance.label')} value={null} unit={t('kpi.irradiance.unit')} noDataText={noData} />
        </section>

        {/* 3. CHART AREA (empty until Milestone 8) */}
        <section className="mt-6 rounded-2xl border-2 border-dashed border-navy/15 bg-white/60 p-8 text-center">
          <h2 className="font-bold">{t('charts.title')}</h2>
          <p className="mt-1 text-sm text-navy/60">{t('charts.placeholder')}</p>
        </section>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-navy/60">{t('footer')}</footer>
    </div>
  );
}
