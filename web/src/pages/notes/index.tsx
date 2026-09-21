import { useTranslation } from 'react-i18next';

/** 学习中心 —— 占位页。 */
export default function NotesPage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-primary">{t('pages.notes.title')}</h1>
      <p className="text-muted-foreground">{t('pages.notes.placeholder')}</p>
    </section>
  );
}