"use client"
import { useState, useEffect } from "react"
import { X, Play, Pause, RotateCcw, Music, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FocusSession({ task, onClose }: any) {
  const [seconds, setSeconds] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000)
    } else if (seconds === 0) {
      clearInterval(interval)
      alert("انتهى وقت التركيز! خذ استراحة قصيرة.")
    }
    return () => clearInterval(interval)
  }, [isActive, seconds])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-4">
      <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-white">
        <X size={32} />
      </button>

      <div className="text-center space-y-6 max-w-md w-full">
        <span className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold tracking-widest uppercase">
          Focusing on
        </span>
        <h2 className="text-3xl font-bold">{task.title}</h2>
        
        <div className="text-8xl font-black font-mono py-10 text-blue-500">
          {formatTime(seconds)}
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setIsActive(!isActive)} 
            className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            {isActive ? <Pause size={30} /> : <Play size={30} />}
          </Button>
          <Button 
            onClick={() => {setIsActive(false); setSeconds(25 * 60)}} 
            variant="outline" 
            className="h-16 w-16 rounded-full border-slate-700 text-slate-300"
          >
            <RotateCcw size={24} />
          </Button>
        </div>

        {/* مشغل موسيقى Lo-fi بسيط */}
        <div className="pt-10 flex items-center justify-center gap-4 text-slate-400">
          <Music size={20} />
          <span className="text-sm italic">Lo-fi Study Beats Playing...</span>
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {isActive && !isMuted && (
            <iframe 
              className="hidden" 
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&controls=0" 
              allow="autoplay"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  )
}