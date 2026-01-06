"use client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

export function AddTaskDialog({ isOpen, setIsOpen, newTitle, setNewTitle, newPriority, setNewPriority, onAdd }: any) {
  const { lang } = useLanguage()
  
  const t = {
    ar: { 
      btn: "إضافة مهمة جديدة", title: "مهمة جديدة", subtitle: "نظّم وقتك وأضف تفاصيل مهمتك",
      label1: "ما هي المهمة؟", placeholder: "مثلاً: تسجيل الدخول...",
      label2: "درجة الأهمية", high: "عالية", med: "متوسطة", low: "عادية",
      save: "حفظ المهمة", cancel: "إلغاء"
    },
    en: { 
      btn: "Add New Task", title: "New Task", subtitle: "Organize your time and add details",
      label1: "What is the task?", placeholder: "e.g. Design the logo...",
      label2: "Priority Level", high: "High", med: "Medium", low: "Low",
      save: "Save Task", cancel: "Cancel"
    }
  }[lang === 'ar' ? 'ar' : 'en']

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg gap-2 px-6 py-6 rounded-xl transition-all hover:scale-105">
          <Plus size={20} />
          <span className="font-bold text-base">{t.btn}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-none p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
        <div className="bg-blue-600 p-6 text-white text-right">
          <DialogHeader className={lang === 'en' ? 'text-left' : 'text-right'}>
            <DialogTitle className={`text-2xl font-bold flex items-center gap-2 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
              {t.title}
              <div className="bg-white/20 p-2 rounded-lg"><Plus size={24} /></div>
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1">{t.subtitle}</p>
          </DialogHeader>
        </div>

        <div className={`p-6 space-y-6 ${lang === 'en' ? 'text-left' : 'text-right'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" /> {t.label1}
            </label>
            <input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" 
              placeholder={t.placeholder}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" /> {t.label2}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[ {v:'High', l:t.high}, {v:'Medium', l:t.med}, {v:'Low', l:t.low} ].map((p) => (
                <button
                  key={p.v}
                  onClick={() => setNewPriority(p.v)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${newPriority === p.v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 dark:border-slate-700 dark:text-slate-400'}`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onAdd} className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold">{t.save}</Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="px-6 py-6 rounded-xl dark:text-slate-400">{t.cancel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}