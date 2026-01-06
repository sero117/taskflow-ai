"use client"

import { Archive, RotateCcw, Trash2, Calendar, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface ArchiveViewProps {
  tasks: any[]
  onRefresh: () => void
}

export function ArchiveView({ tasks, onRefresh }: ArchiveViewProps) {
  
  // وظيفة استعادة المهمة من الأرشيف
  const unarchiveTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_archived: false })
      .eq('id', id)
    
    if (!error) onRefresh()
  }

  // وظيفة الحذف النهائي من قاعدة البيانات
  const deletePermanently = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المهمة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (!error) onRefresh()
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Archive size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">الأرشيف فارغ</h3>
        <p className="text-slate-400 mt-2">المهام التي تؤرشفها ستظهر هنا لاحقاً.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="p-6 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] group relative overflow-hidden">
            {/* زخرفة جانبية تدل على الأرشفة */}
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500 transition-colors" />
            
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg uppercase">
                  {task.project || "عام"}
                </span>
                <CheckCircle2 size={20} className="text-green-500 opacity-50" />
              </div>

              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 line-through opacity-60">
                {task.title}
              </h3>

              <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
                <Calendar size={14} />
                <span>أرشفت في: {new Date(task.created_at).toLocaleDateString('ar-EG')}</span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t dark:border-slate-800">
                <Button 
                  onClick={() => unarchiveTask(task.id)}
                  variant="outline" 
                  className="flex-1 rounded-xl font-bold border-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all gap-2"
                >
                  <RotateCcw size={16} /> استعادة
                </Button>
                
                <Button 
                  onClick={() => deletePermanently(task.id)}
                  variant="ghost" 
                  className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}