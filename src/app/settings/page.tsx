"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { 
  Moon, Sun, Languages, ArrowLeft, ArrowRight, 
  Settings as SettingsIcon, Bell, Lock, Trash2, 
  Loader2, ShieldCheck, KeyRound, Save, X, Eye, EyeOff 
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { lang, toggleLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false) 
  const [showPassword, setShowPassword] = useState(false) // حالة رؤية كلمة المرور
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  const validatePassword = (pass: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pass);
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword(newPassword)) {
      alert(lang === "ar" 
        ? "يجب أن تحتوي كلمة المرور على 8 أحرف، حرف كبير، حرف صغير، رقم ورمز خاص" 
        : "Password must be 8 characters with upper, lower, number and symbol");
      return;
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) alert(error.message)
    else {
      alert(lang === "ar" ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully")
      setNewPassword("")
      setIsChangingPass(false)
      setShowPassword(false)
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmMsg = lang === "ar" 
      ? "هل أنت متأكد تماماً؟ سيتم حذف جميع بياناتك نهائياً!" 
      : "Are you sure? This will delete all your data!";
    if (confirm(confirmMsg)) {
      setDeleteLoading(true)
      await supabase.auth.signOut()
      router.push("/login")
    }
  }

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto">
        
        {/* Header Navigation */}
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-10 transition-all font-bold">
          {lang === "ar" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          <span>{lang === "ar" ? "العودة للوحة التحكم" : "Dashboard"}</span>
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <SettingsIcon size={30} />
          </div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight">
            {lang === "ar" ? "الإعدادات" : "Settings"}
          </h1>
        </div>

        <div className="grid gap-6">
          
          {/* Card: Account Security */}
          <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">{lang === "ar" ? "الأمان" : "Security"}</h3>
                    <p className="text-sm text-slate-500">{lang === "ar" ? "إدارة كلمة المرور والخصوصية" : "Manage password and privacy"}</p>
                  </div>
                </div>
                {!isChangingPass && (
                  <Button 
                    onClick={() => setIsChangingPass(true)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-all px-6 py-6"
                  >
                    <KeyRound size={18} className={lang === "ar" ? "ml-2" : "mr-2"} />
                    {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                  </Button>
                )}
              </div>

              {/* قسم تغيير كلمة المرور المنسدل */}
              {isChangingPass && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold dark:text-white">{lang === "ar" ? "اكتب كلمة المرور الجديدة" : "Enter New Password"}</h4>
                    <button onClick={() => {setIsChangingPass(false); setShowPassword(false)}} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        autoFocus
                        placeholder="••••••••"
                        className={`w-full p-4 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500 font-mono transition-all ${lang === "ar" ? "pl-12 pr-4" : "pr-12 pl-4"}`}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      {/* أيقونة العين */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors ${lang === "ar" ? "left-4" : "right-4"}`}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-bold shadow-lg shadow-blue-500/30">
                      {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className={lang === "ar" ? "ml-2" : "mr-2"} /> {lang === "ar" ? "حفظ كلمة المرور الجديدة" : "Save New Password"}</>}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col justify-between group hover:ring-2 ring-amber-400 transition-all cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                {theme === "dark" ? <Moon size={28} /> : <Sun size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">{lang === "ar" ? "الوضع الليلي" : "Dark Mode"}</h3>
                <p className="text-sm text-slate-500 mb-4">{lang === "ar" ? "تبديل مظهر التطبيق" : "Switch Theme"}</p>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-amber-500" : "bg-slate-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lang === "ar" ? (theme === "dark" ? "right-7" : "right-1") : (theme === "dark" ? "left-7" : "left-1")}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col justify-between group hover:ring-2 ring-indigo-400 transition-all cursor-pointer" onClick={toggleLanguage}>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Languages size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">{lang === "ar" ? "اللغة" : "Language"}</h3>
                <p className="text-sm text-slate-500 mb-4">{lang === "ar" ? "العربية" : "English"}</p>
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{lang === "ar" ? "Switch to English" : "التحويل للعربية"}</span>
              </div>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="p-8 border-none bg-red-50 dark:bg-red-900/10 rounded-[2rem] border-2 border-red-100 dark:border-red-900/20">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-red-600 text-lg">{lang === "ar" ? "منطقة خطر" : "Danger Zone"}</h3>
                  <p className="text-sm text-red-500/70 leading-relaxed">{lang === "ar" ? "حذف الحساب نهائياً مع كافة البيانات" : "Delete account permanently"}</p>
                </div>
              </div>
              <Button 
                onClick={handleDeleteAccount}
                className="bg-white hover:bg-red-600 hover:text-white text-red-600 border-none shadow-xl shadow-red-500/10 rounded-xl px-8 py-6 font-bold transition-all"
              >
                {lang === "ar" ? "حذف" : "Delete"}
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}