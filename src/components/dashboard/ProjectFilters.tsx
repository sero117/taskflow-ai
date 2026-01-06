"use client"

import { Plus, Hash, FolderOpen, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectFiltersProps {
  selectedProject: string
  setSelectedProject: (project: string) => void
  tasks: any[]
}

export function ProjectFilters({ selectedProject, setSelectedProject, tasks }: ProjectFiltersProps) {
  
  // قائمة المشاريع المتاحة
  const projects = [
    { id: "All", name: "الكل", icon: <LayoutGrid size={16} />, color: "text-blue-500" },
    { id: "دراسة", name: "دراسة", icon: <Hash size={16} />, color: "text-amber-500" },
    { id: "عمل", name: "عمل", icon: <Hash size={16} />, color: "text-indigo-500" },
    { id: "شخصي", name: "شخصي", icon: <Hash size={16} />, color: "text-emerald-500" },
  ]

  // دالة لحساب عدد المهام في كل مشروع (لإظهار الرقم بجانب الاسم)
  const getTaskCount = (projectName: string) => {
    if (projectName === "All") return tasks.filter(t => !t.is_archived).length
    return tasks.filter(t => t.project === projectName && !t.is_archived).length
  }

  return (
    <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1">
        {projects.map((project) => {
          const isActive = selectedProject === project.id
          return (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap
                ${isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-y-[-2px]" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"}
              `}
            >
              <span className={isActive ? "text-white" : project.color}>
                {project.icon}
              </span>
              {project.name}
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded-md font-black
                ${isActive ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}
              `}>
                {getTaskCount(project.id)}
              </span>
            </button>
          )
        })}
      </div>

      {/* زر إضافة مشروع جديد (كميزة مستقبلية) */}
      <Button 
        variant="ghost" 
        className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-blue-600 rounded-xl px-4"
      >
        <Plus size={18} />
        <span className="text-xs font-bold">مشروع جديد</span>
      </Button>
    </div>
  )
}