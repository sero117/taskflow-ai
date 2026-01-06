"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  // دالة التحقق من الشروط
  const validate = () => {
    if (!email.endsWith("@gmail.com")) {
      alert("يجب استخدام بريد Gmail فقط");
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("كلمة المرور يجب أن تكون 8 أحرف، وتتضمن حرفاً كبيراً، صغيراً، رقماً، ورمزاً خاصاً");
      return false;
    }
    return true;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp && !validate()) return // التحقق فقط عند إنشاء حساب
    
    setLoading(true)
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push("/")
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) return alert("أدخل بريدك الإلكتروني أولاً");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    })
    if (error) alert(error.message)
    else alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Task<span className="text-blue-600">Flow</span></h1>
          <p className="text-slate-500 mt-2">{isSignUp ? "أنشئ حساباً قوياً" : "أهلاً بك مجدداً"}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute right-4 top-4 text-slate-400" size={20} />
            <input type="email" placeholder="example@gmail.com" required className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="relative group">
            <Lock className="absolute right-4 top-4 text-slate-400" size={20} />
            <input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" required className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-4 text-slate-400 hover:text-blue-500 transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isSignUp && (
            <button type="button" onClick={handleResetPassword} className="text-sm text-blue-600 hover:underline">نسيت كلمة المرور؟</button>
          )}

          <Button disabled={loading} className="w-full py-8 rounded-2xl text-xl font-bold bg-blue-600">
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "إنشاء الحساب" : "تسجيل الدخول")}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 font-bold">
            {isSignUp ? "لديك حساب؟ دخول" : "ليس لديك حساب؟ إنشاء"}
          </button>
        </div>
      </div>
    </div>
  )
}