import { Card } from "@/components/ui/card"
import { ListChecks, Activity, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export function StatsCards({ stats }: { stats: any }) {
  const { lang } = useLanguage()
  
  const t = {
    ar: { total: "إجمالي المهام", progress: "قيد التنفيذ", done: "مهام مكتملة" },
    en: { total: "Total Tasks", progress: "In Progress", done: "Completed" }
  }[lang === 'ar' ? 'ar' : 'en']

  const cards = [
    { title: t.total, value: stats.total, icon: ListChecks, color: "blue" },
    { title: t.progress, value: stats.inProgress, icon: Activity, color: "amber" },
    { title: t.done, value: stats.completed, icon: CheckCircle2, color: "green" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {cards.map((card, i) => (
        <Card key={i} className={`p-4 flex items-center gap-4 border-none shadow-sm dark:bg-slate-800 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
            <card.icon className={`text-${card.color}-600`} />
          </div>
          <div className={lang === 'en' ? 'text-left' : 'text-right'}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}