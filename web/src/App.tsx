import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function App() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground">
          知
        </span>
        <h1 className="text-2xl font-semibold">{t("common.brand")}</h1>
        <p className="text-muted-foreground">{t("common.motto")}</p>
      </div>
      <Button>{t("common.start")}</Button>
    </main>
  )
}

export default App
