import { useTranslation } from 'react-i18next';

/** 文档中心 —— 占位页。 */
export default function DocumentsPage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-primary">{t('pages.documents.title')}</h1>
      <p className="text-muted-foreground">{t('pages.documents.placeholder')}</p>
    </section>
  );
}