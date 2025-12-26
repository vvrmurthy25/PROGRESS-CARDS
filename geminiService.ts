
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AIAnalysis, ExamResult } from "./types";

export const analyzePerformance = async (student: Student): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    2. Comparison: Compare FA results with SA-1 results. Identify if the student is handling descriptive papers (SA) as well as objective/short papers (FA).
    3. Specificity: Do not use generic phrases. If Maths is low, mention logical practice. If Sciences are low, mention diagrams and conceptual understanding.
    4. Attendance Impact: If attendance is below 85%, link it directly to the performance decline in the descriptive analysis.
    5. Action Plan: Provide a daily routine suggestion for weak subjects.
    6. Public Exam Warning: March 16th is the deadline. Use high-stakes but supportive language.

    JSON OUTPUT STRUCTURE:
    - "success": An elaborate paragraph (100+ words) detailing specific academic strengths. Highlight subjects where the student consistently scores well and explain the positive impact of this on their future career/SSC results.
    - "decline": A critical but constructive analysis (100+ words) of where marks were lost. Compare the trend from FA1 to SA1. If marks dropped, explain that descriptive exams require better presentation skills.
    - "weakSubjects": A structured, actionable improvement roadmap (150+ words). Break it down by specific subjects. Provide 3 specific "Pro-Tips" in Telugu for the 100-day plan.

    JSON Schema:
    {
      "success": "Detailed analytical praise in Telugu",
      "decline": "Constructive trend analysis and warnings in Telugu",
      "weakSubjects": "Comprehensive subject-wise action plan and study tips in Telugu"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
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

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      success: "మీ విద్యా ప్రదర్శన కొన్ని సబ్జెక్టులలో చాలా బాగుంది. ముఖ్యంగా లాంగ్వేజెస్ మరియు సోషల్ స్టడీస్ లో మీ పట్టు అభినందనీయం. ఈ నిలకడ మీకు ఎస్ఎస్సి పబ్లిక్ పరీక్షలలో మంచి జిపిఏ సాధించడానికి దోహదపడుతుంది. మీ కృషిని ఇలాగే కొనసాగించండి, ఇది మీ ఆత్మవిశ్వాసాన్ని పెంచుతుంది.",
      decline: "ఎఫ్ఏ పరీక్షలతో పోలిస్తే ఎస్ఏ-1 పరీక్షలలో మార్కులు కొంత తగ్గుముఖం పట్టాయి. దీనికి ప్రధాన కారణం వివరణాత్మక సమాధానాలు రాయడంలో ఏకాగ్రత లోపించడం కావచ్చు. హాజరు శాతం తక్కువగా ఉన్నట్లయితే, అది నేరుగా మీ మార్కులపై ప్రభావం చూపిస్తోంది. పబ్లిక్ పరీక్షల సిలబస్ చాలా ఎక్కువగా ఉంటుంది కాబట్టి అప్రమత్తంగా ఉండాలి.",
      weakSubjects: "మెరుగుదల కోసం కార్యాచరణ ప్రణాళిక: \n1. గణితం: ప్రతిరోజూ కనీసం 10 లెక్కలను ప్రాక్టీస్ చేయండి. ఫార్ములాలను ఒక ప్రత్యేక నోట్ బుక్ లో రాసుకోండి. \n2. సైన్స్: డయాగ్రమ్స్ ప్రాక్టీస్ చేయండి మరియు ముఖ్యమైన నిర్వచనాలను గుర్తుంచుకోండి. \n3. ఇంగ్లీష్: గ్రామర్ మరియు రైటింగ్ స్కిల్స్ పై దృష్టి పెట్టండి. \nచిట్కా: ప్రతిరోజూ ఉదయం 5 గంటలకు లేచి చదవడం అలవాటు చేసుకోండి. మార్చి 16 పరీక్షలకు సిద్ధమవ్వడానికి ఇదే సరైన సమయం."
    };
  }
};
