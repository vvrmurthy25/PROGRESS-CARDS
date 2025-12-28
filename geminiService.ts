
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AIAnalysis, ExamResult } from "./types";

export const analyzePerformance = async (student: Student): Promise<AIAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Using fallback analysis.");
    return getFallbackAnalysis();
  }

  const ai = new GoogleGenAI({ apiKey });

  const getSubjectSummary = (exam: ExamResult) => {
    const subjects = ['telugu', 'hindi', 'english', 'maths', 'ps', 'bs', 'social'] as const;
    return subjects.map(s => `${s}: ${exam[s].marks} (${exam[s].grade})`).join(', ');
  };

  const prompt = `
    You are a Senior Educational Consultant and Pedagogical Expert for S.P.P.Z.P.P. High School. 
    Analyze the academic performance of Grade 10 student: ${student.name}.
    
    DETAILED ACADEMIC DATA:
    - FA-1: ${getSubjectSummary(student.fa1)} (Total: ${student.fa1.total}, Rank: ${student.fa1.rank})
    - FA-2: ${getSubjectSummary(student.fa2)} (Total: ${student.fa2.total}, Rank: ${student.fa2.rank})
    - SA-1: ${getSubjectSummary(student.sa1)} (Total: ${student.sa1.total}, Rank: ${student.sa1.rank})
    - Attendance: ${student.attendance.totalAttendedDaysUntilNov} attended out of ${student.attendance.totalWorkingDaysUntilNov} working days.
    
    INSTRUCTIONS FOR ANALYSIS:
    1. Language: Use formal yet encouraging TELUGU.
    2. Comparison: Compare FA results with SA-1 results.
    3. JSON Structure: 
       "success": Strength paragraph
       "decline": Trend paragraph
       "weakSubjects": Action plan
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.STRING },
            decline: { type: Type.STRING },
            weakSubjects: { type: Type.STRING },
          },
          required: ["success", "decline", "weakSubjects"]
        }
      },
    });

    const text = response.text || "";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return getFallbackAnalysis();
  }
};

const getFallbackAnalysis = (): AIAnalysis => ({
  success: "మీ విద్యా ప్రదర్శన కొన్ని సబ్జెక్టులలో చాలా బాగుంది. ముఖ్యంగా లాంగ్వేజెస్ మరియు సోషల్ స్టడీస్ లో మీ పట్టు అభినందనీయం. మీ కృషిని ఇలాగే కొనసాగించండి.",
  decline: "ఎఫ్ఏ పరీక్షలతో పోలిస్తే ఎస్ఏ-1 పరీక్షలలో మార్కులు కొంత తగ్గుముఖం పట్టాయి. వివరణాత్మక సమాధానాలు రాయడంలో ఏకాగ్రత పెంచాలి.",
  weakSubjects: "మెరుగుదల కోసం కార్యాచరణ ప్రణాళిక: \n1. గణితం: ప్రతిరోజూ కనీసం 10 లెక్కలను ప్రాక్టీస్ చేయండి. \n2. సైన్స్: డయాగ్రమ్స్ ప్రాక్టీస్ చేయండి. \n3. ఇంగ్లీష్: గ్రామర్ పై దృష్టి పెట్టండి."
});
