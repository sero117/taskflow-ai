"use client"
import { useState, useEffect, useRef } from "react"
import { Bot, Send, Loader2, AlertCircle } from "lucide-react"

export function AIChat({ tasks, lang }: { tasks: any[], lang: string }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: lang === 'ar' ? 'مرحباً! أنا متصل بذكاء Gemini. كيف أساعدك اليوم؟' : 'Hi! I am connected to Gemini. How can I help today?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // 1. استبدل هذا المتغير بمفتاحك الذي ينتهي بـ vC24
      const API_KEY = "AIzaSyDEnwZzYXY1-mG4-xpwgnXJbxJnyr1Ax4E"; 
      
      // 2. الرابط الصحيح لموديل gemini-1.5-flash (الأسرع والمجاني)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: You are a helpful assistant for TaskFlow app. 
              User Tasks: ${JSON.stringify(tasks)}. 
              Rule: Be brief and answer in ${lang === 'ar' ? 'Arabic' : 'English'}.
              User Question: ${currentInput}`
            }]
          }]
        })
      });

      const data = await response.json();

      // 3. فحص الأخطاء التقنية (مثل تخطي الكوتا أو مفتاح خاطئ)
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.candidates && data.candidates[0].content) {
        const aiText = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'bot', content: aiText }]);
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `❌ خطأ: ${error.message}` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border dark:border-slate-800 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-2 border">
              <Loader2 className="animate-spin text-blue-500" size={18} />
              <span className="text-xs text-slate-500">جاري معالجة طلبك...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border focus-within:ring-2 ring-blue-500 transition-all">
          <input 
            className="flex-1 bg-transparent px-3 py-2 outline-none dark:text-white text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن مهامك..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}