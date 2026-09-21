import { useTranslation } from 'react-i18next';

/** 考试中心 —— 占位页。 */
export default function ExamsPage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-primary">{t('pages.exams.title')}</h1>
      <p className="text-muted-foreground">{t('pages.exams.placeholder')}</p>
    </section>
  );
}