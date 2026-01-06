"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { 
  Trash2, Calendar, AlertCircle, Archive, 
  RotateCcw, Edit3, CheckCircle2, X, Timer // تم إضافة Timer هنا
} from "lucide-react"
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { supabase } from "@/lib/supabase"

// تم إضافة onStartFocus في الـ Props هنا
export function TaskCard({ task, onDelete, onUpdateStatus, onStartFocus }: any) {
  const { lang } = useLanguage()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [editedPriority, setEditedPriority] = useState(task.priority)

  const t = {
    ar: { 
      high: "أولوية قصوى", medium: "متوسطة", low: "عادية", 
      added: "أُضيفت في", archive: "أرشفة", restore: "استعادة", 
      delete: "حذف", editTitle: "تعديل المهمة", editSub: "قم بتحديث تفاصيل مهمتك الحالية",
      labelTitle: "عنوان المهمة", labelPriority: "الأولوية",
      save: "حفظ التغييرات", cancel: "إلغاء", locale: 'ar-EG'
    },
    en: { 
      high: "High Priority", medium: "Medium", low: "Low", 
      added: "Added on", archive: "Archive", restore: "Restore", 
      delete: "Delete", editTitle: "Edit Task", editSub: "Update your current task details",
      labelTitle: "Task Title", labelPriority: "Priority",
      save: "Save Changes", cancel: "Cancel", locale: 'en-US'
    }
  }[lang === 'ar' ? 'ar' : 'en']

  const priorityStyles: any = { 
    High: "border-r-4 border-red-500 bg-red-50/30 text-red-700 dark:bg-red-900/10 dark:text-red-400", 
    Medium: "border-r-4 border-amber-500 bg-amber-50/30 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400", 
    Low: "border-r-4 border-green-500 bg-green-50/30 text-green-700 dark:bg-green-900/10 dark:text-green-400" 
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('tasks').delete().eq('id', task.id)
    if (!error) onDelete()
  }

  const handleArchiveToggle = async () => {
    const { error } = await supabase.from('tasks').update({ is_archived: !task.is_archived }).eq('id', task.id)
    if (!error) onDelete()
  }

  const handleUpdateTask = async () => {
    if (editedTitle.trim() === "") return
    const { error } = await supabase
      .from('tasks')
      .update({ title: editedTitle, priority: editedPriority })
      .eq('id', task.id)
    
    if (!error) {
      setIsEditDialogOpen(false)
      onDelete() 
    }
  }

  return (
    <>
      <Card className={`group p-5 transition-all duration-300 hover:shadow-xl border ${priorityStyles[task.priority]} relative overflow-hidden flex flex-col justify-between h-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div>
          <div className={`flex justify-between items-start mb-4 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
              <AlertCircle size={12} />
              {task.priority === 'High' ? t.high : task.priority === 'Medium' ? t.medium : t.low}
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-bold">
              {task.project || (lang === 'ar' ? 'عام' : 'General')}
            </span>
          </div>
          
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-2">{task.title}</h3>
          
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <button 
              onClick={() => onUpdateStatus(task.id, task.status)}
              className="text-xs px-3 py-1 rounded-full border font-semibold bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            >
              {task.status}
            </button>
          </div>
        </div>

        <div className="mt-auto">
          <div className={`flex items-center gap-1 text-[10px] text-slate-400 border-t pt-3 mb-3 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <Calendar size={12} />
            <span>{t.added}: {new Date(task.created_at).toLocaleDateString(t.locale)}</span>
          </div>

          <div className="flex gap-2">
            <button onClick={handleArchiveToggle} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold">
              {task.is_archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {task.is_archived ? t.restore : t.archive}
            </button>

            {/* زر وضع التركيز */}
            <button 
              onClick={() => onStartFocus(task)} 
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
              title="وضع التركيز"
            >
              <Timer size={16} />
            </button>

            <button onClick={() => setIsEditDialogOpen(true)} className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
              <Edit3 size={16} />
            </button>

            <button onClick={handleDelete} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* نافذة التعديل (Dialog) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
          <div className="bg-blue-600 p-6 text-white">
            <DialogHeader className={lang === 'en' ? 'text-left' : 'text-right'}>
              <DialogTitle className={`text-2xl font-bold flex items-center gap-2 ${lang === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
                {t.editTitle}
                <div className="bg-white/20 p-2 rounded-lg"><Edit3 size={24} /></div>
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-sm mt-1">{t.editSub}</DialogDescription>
            </DialogHeader>
          </div>

          <div className={`p-6 space-y-6 ${lang === 'en' ? 'text-left' : 'text-right'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" /> {t.labelTitle}
              </label>
              <input 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)} 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" /> {t.labelPriority}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[ {v:'High', l:t.high}, {v:'Medium', l:t.medium}, {v:'Low', l:t.low} ].map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setEditedPriority(p.v)}
                    className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${editedPriority === p.v ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 dark:border-slate-700 dark:text-slate-400'}`}
                  >
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpdateTask} className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold">{t.save}</Button>
              <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="px-6 py-6 rounded-xl dark:text-slate-400">{t.cancel}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}