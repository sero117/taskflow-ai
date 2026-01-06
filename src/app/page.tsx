"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { 
  LayoutDashboard, Search, Loader2, Settings as SettingsIcon, 
  FileDown, LogOut, BarChart3, PieChart as PieIcon, 
  ShieldCheck, Trash2, Eye, EyeOff, Moon, Sun, Languages, 
  Archive, RotateCcw, Mic, CheckCircle2, BrainCircuit, Timer,
  MessageSquare, Send, Bot, Sparkles 
} from "lucide-react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts'
import { StatsCards } from "@/components/dashboard/StatsCards"
import { TaskCard } from "@/components/dashboard/TaskCard"
import { AddTaskDialog } from "@/components/dashboard/AddTaskDialog"
import { FocusSession } from "@/components/dashboard/FocusSession"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "next-themes"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import SettingsPage from "./settings/page"
// --- المساعد الذكي (AIChatSection) ---
function AIChatSection({ tasks, lang }: { tasks: any[], lang: string }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: lang === 'ar' ? 'مرحباً! أنا مساعدك الذكي المرتبط بـ Gemini. كيف يمكنني مساعدتك؟' : 'Hi! I am your Gemini-powered assistant. How can I help?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
  
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `بيانات المهام: ${JSON.stringify(tasks)}. سؤال المستخدم: ${currentInput}`
        })
      });
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) {
        setMessages(prev => [...prev, { role: 'bot', content: aiText }]);
      } else {
        throw new Error("لم يتم استلام نص من الذكاء الاصطناعي");
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', content: `❌ خطأ: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Bot size={24} />
          <span className="font-bold">{lang === 'ar' ? 'مساعد تاسك فلو' : 'TaskFlow AI'}</span>
        </div>
        <Sparkles size={20} className="animate-pulse text-yellow-300" />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border dark:border-slate-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="flex gap-2 items-center text-indigo-500 animate-pulse text-xs font-bold"><Loader2 size={14} className="animate-spin" /> Gemini Thinking...</div>}
      </div>
      <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input 
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={lang === 'ar' ? 'اسأل المساعد عن مهامك...' : 'Ask about your tasks...'}
          className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl outline-none dark:text-white text-sm"
        />
        <Button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 w-12 p-0 transition-transform active:scale-90">
          <Send size={20} />
        </Button>
      </div>
    </Card>
  );
}

// --- الصفحة الرئيسية (DashboardPage) ---
export default function DashboardPage() {
  const { lang, toggleLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"tasks" | "charts" | "settings" | "archive" | "chat">("tasks")
  const [selectedProject, setSelectedProject] = useState("الكل")
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState("Medium")
  const [userInitials, setUserInitials] = useState("US")
  const [focusTask, setFocusTask] = useState<any>(null)
  const [isChangingPass, setIsChangingPass] = useState(false)

  const t = useMemo(() => {
    const translations = {
      ar: {
        logo: "تاسك فلو", dashboard: "المهام اليومية", archive: "الأرشيف",
        reports: "التقارير الذكية", settings: "الإعدادات", searchPlaceholder: "ابحث عن مهمة...",
        tasksTitle: "المهام", exportBtn: "تحميل PDF", pdfTitle: "تقرير المهام",
        logout: "تسجيل الخروج", welcome: "مرحباً بك", analytics: "تحليل الأداء",
        statusDist: "توزيع حالات المهام", priorityDist: "توزيع الأولويات (Bar Chart)",
        security: "الأمان", managePass: "إدارة كلمة المرور", changePass: "تغيير كلمة المرور",
        appearance: "المظهر", themeDesc: "تبديل مظهر التطبيق", langTitle: "اللغة",
        smartSort: "ترتيب ذكي", aiChat: "المساعد الذكي"
      },
      en: {
        logo: "TaskFlow", dashboard: "Daily Tasks", archive: "Archive",
        reports: "Smart Analytics", settings: "Settings", searchPlaceholder: "Search tasks...",
        tasksTitle: "Tasks", exportBtn: "Export PDF", pdfTitle: "Tasks Report",
        logout: "Logout", welcome: "Welcome back", analytics: "Performance Analytics",
        statusDist: "Task Status", priorityDist: "Priority Analysis",
        security: "Security", managePass: "Manage password", changePass: "Change Password",
        appearance: "Appearance", themeDesc: "Switch Theme", langTitle: "Language",
        smartSort: "Smart Sort", aiChat: "AI Assistant"
      }
    }
    return translations[lang as keyof typeof translations] || translations.ar
  }, [lang])

  const priorityData = useMemo(() => [
    { name: lang === 'ar' ? 'مرتفع' : 'High', count: tasks.filter(t => t.priority === "High").length },
    { name: lang === 'ar' ? 'متوسط' : 'Medium', count: tasks.filter(t => t.priority === "Medium").length },
    { name: lang === 'ar' ? 'منخفض' : 'Low', count: tasks.filter(t => t.priority === "Low").length },
  ], [tasks, lang]);

  useEffect(() => { 
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/login")
      else {
        setUserInitials(session.user.email?.substring(0, 2).toUpperCase() || "US")
        fetchTasks()
      }
    }
    checkUser()
  }, [router])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  const handleSmartSort = () => {
    const sorted = [...tasks].sort((a, b) => {
      const pOrder: any = { High: 3, Medium: 2, Low: 1 };
      if (pOrder[b.priority] !== pOrder[a.priority]) return pOrder[b.priority] - pOrder[a.priority];
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    setTasks(sorted);
  };

  const displayTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProject = selectedProject === "الكل" || task.project === selectedProject
      if (activeTab === "archive") return task.is_archived && matchesSearch
      if (activeTab === "tasks") return !task.is_archived && matchesProject && matchesSearch
      return matchesSearch
    })
  }, [tasks, activeTab, selectedProject, searchQuery])

  async function handleAddTask() {
    if (!newTitle) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tasks').insert([{ 
      title: newTitle, priority: newPriority, status: "مخطط له", 
      user_id: user?.id, is_archived: false,
      project: selectedProject === "الكل" ? "عام" : selectedProject 
    }])
    setNewTitle(""); setIsDialogOpen(false); fetchTasks()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const tableData = displayTasks.map(task => [task.title, task.status, task.priority, new Date(task.created_at).toLocaleDateString()])
    doc.text(t.pdfTitle, 14, 15)
    autoTable(doc, { head: [['Task', 'Status', 'Priority', 'Date']], body: tableData, startY: 20 })
    doc.save("Report.pdf")
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {focusTask && <FocusSession task={focusTask} onClose={() => setFocusTask(null)} />}

      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 p-6 hidden md:flex flex-col border-slate-200 dark:border-slate-800 border-x">
        <div className="flex items-center gap-3 px-2 mb-10 font-bold text-2xl text-blue-600">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30"><LayoutDashboard size={22} /></div>
          <span>{t.logo}</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab("tasks")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "tasks" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <LayoutDashboard size={20}/> <span>{t.dashboard}</span>
          </button>
          <button onClick={() => setActiveTab("archive")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "archive" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <Archive size={20}/> <span>{t.archive}</span>
          </button>
          <button onClick={() => setActiveTab("charts")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "charts" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <BarChart3 size={20}/> <span>{t.reports}</span>
          </button>
          <button onClick={() => setActiveTab("chat")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "chat" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <MessageSquare size={20}/> <span>{t.aiChat}</span>
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse ml-auto"></span>
          </button>
          <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "settings" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <SettingsIcon size={20}/> <span>{t.settings}</span>
          </button>
        </nav>

        <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl font-bold mt-auto transition-colors">
          <LogOut size={20} /> <span>{t.logout}</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* شريط البحث المعاد إضافته */}
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 ring-blue-500/20 dark:text-white transition-all font-medium" 
              />
            </div>
            {/* زر الميكروفون المعاد إضافته */}
            <Button variant="ghost" className="rounded-2xl w-12 h-12 p-0 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600">
              <Mic size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.welcome}</p>
                <p className="text-sm font-black dark:text-white">{userInitials}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border-2 border-white dark:border-slate-800">{userInitials}</div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {/* قسم المهام */}
          {(activeTab === "tasks" || activeTab === "archive") && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex gap-2 mb-8 items-center flex-wrap">
                {["الكل", "عمل", "دراسة", "شخصي"].map((proj) => (
                    <button key={proj} onClick={() => setSelectedProject(proj)} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedProject === proj ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500"}`}>{proj}</button>
                ))}
                <Button onClick={handleSmartSort} variant="ghost" className="mr-auto gap-2 text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20"><BrainCircuit size={18} /> {t.smartSort}</Button>
              </div>
              
              <StatsCards stats={{ 
                total: tasks.filter(t=>!t.is_archived).length, 
                inProgress: tasks.filter(t => t.status === "قيد التنفيذ" && !t.is_archived).length, 
                completed: tasks.filter(t => t.status === "مكتمل" && !t.is_archived).length 
              }} />

              <div className="flex justify-between items-center my-8">
                <h2 className="text-3xl font-black dark:text-white">{activeTab === "archive" ? t.archive : t.tasksTitle}</h2>
                <div className="flex gap-3">
                    <Button onClick={exportToPDF} variant="outline" className="rounded-xl font-bold border-2"><FileDown size={18} /> {t.exportBtn}</Button>
                    {activeTab === "tasks" && <AddTaskDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} newTitle={newTitle} setNewTitle={setNewTitle} newPriority={newPriority} setNewPriority={setNewPriority} onAdd={handleAddTask} />}
                </div>
              </div>

              {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-blue-600" size={40} /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayTasks.map(task => (<TaskCard key={task.id} task={task} onDelete={fetchTasks} onUpdateStatus={fetchTasks} onStartFocus={(t: any) => setFocusTask(t)} />))}
                </div>
              )}
            </div>
          )}

          {/* قسم الشات */}
          {activeTab === "chat" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
              <AIChatSection tasks={tasks} lang={lang} />
            </div>
          )}

          {/* قسم التقارير */}
          {activeTab === "charts" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2 dark:text-white"><PieIcon className="text-blue-500" /> {t.statusDist}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[ 
                            { name: 'Planned', value: tasks.filter(t => t.status === "مخطط له").length }, 
                            { name: 'Progress', value: tasks.filter(t => t.status === "قيد التنفيذ").length }, 
                            { name: 'Done', value: tasks.filter(t => t.status === "مكتمل").length } 
                          ]} 
                          innerRadius={80} outerRadius={105} paddingAngle={8} dataKey="value"
                        >
                          <Cell fill="#6366f1" /><Cell fill="#3b82f6" /><Cell fill="#10b981" />
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2 dark:text-white"><BarChart3 className="text-indigo-500" /> {t.priorityDist}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
            </div>
          )}

         {/* قسم الإعدادات المحدث */}
{activeTab === "settings" && (
  <div className="animate-in slide-in-from-right-4 duration-500">
    <SettingsPage /> 
  </div>
)}
        </div>
      </main>
    </div>
  )
}