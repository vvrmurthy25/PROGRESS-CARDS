
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ExamCountdown: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      
      // Target: March 16th
      const targetDate = new Date(targetYear, 2, 16, 9, 0, 0); // 2 is March (0-indexed)
      
      // If today is past March 16th, target next year
      if (now > targetDate) {
        targetDate.setFullYear(targetYear + 1);
      }
      
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };

    updateCountdown();
    // Refresh at start of every new day or every hour to keep it accurate
    const interval = setInterval(updateCountdown, 60000); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center justify-center text-center space-y-4 border border-green-300/30">
      <div className="flex items-center gap-2 text-green-50 uppercase tracking-widest text-xs font-bold bg-black/10 px-3 py-1 rounded-full">
        <Clock className="w-5 h-5 animate-pulse" />
        పబ్లిక్ పరీక్షలకు సమయం
      </div>
      <div className="flex flex-col items-center">
        <span className="text-8xl font-black tracking-tighter drop-shadow-md">{daysLeft}</span>
        <span className="text-sm uppercase font-black tracking-widest opacity-90 mt-2">Days Left</span>
        <span className="text-xs font-bold opacity-75 mt-1 font-telugu">రోజులు మిగిలి ఉన్నాయి</span>
      </div>
      <p className="text-xs text-green-50 max-w-xs font-telugu leading-relaxed bg-white/10 p-3 rounded-lg">
        "పరీక్షలు మార్చి 16న ప్రారంభం కానున్నాయి. ప్రతి రోజును ప్రణాళికాబద్ధంగా ఉపయోగించుకోండి."
      </p>
    </div>
  );
};

export default ExamCountdown;
