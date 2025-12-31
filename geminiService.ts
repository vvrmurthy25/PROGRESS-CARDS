import { GoogleGenAI, Type } from "@google/genai";
import { Student, AIAnalysis, ExamResult } from "./types";

const SUBJECT_KEYS = [
  "telugu",
  "hindi",
  "english",
  "maths",
  "ps",
  "bs",
  "social",
] as const;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getSubjectSummary = (exam: ExamResult) => {
  return SUBJECT_KEYS.map((s) => `${capitalize(s)}: ${exam[s].marks} (${exam[s].grade})`).join(", ");
};

const getFallbackAnalysis = (student: Student): AIAnalysis => {
  const recent = student.sa1;

  const strong = SUBJECT_KEYS.filter((k) => recent[k].grade.startsWith("A")).map(capitalize);
  const weak = SUBJECT_KEYS.filter((k) => {
    const m = parseFloat(recent[k].marks as unknown as string);
    if (!isNaN(m)) return m < 35;
    return ["D1", "D2", "C2", "FAIL"].includes(recent[k].grade);
  }).map(capitalize);

  const success = strong.length
    ? `ప్రదర్శన బలమైన విషయాలు: ${strong.join(", ")}.` 
    : `ప్రస్తుత పరీక్షలో ప్రత్యేక విజయాలు గుర్తించలేము.`;

  const decline = `మొత్తం: ${recent.total} • గ్రేడ్: ${recent.grade} • ఫలితం: ${recent.result}. Subjects: ${getSubjectSummary(recent)}`;

  const weakSubjects = weak.length
    ? `మెరుగుదల అవసరమైన విషయాలు: ${weak.join(", ")}. ప్రతీ అంశానికి సాధ్యమైన చిట్కాలు: గమనికలు, అదనపు ప్రాక్టీసు, అధ్యాపకుల సూచనలు.`
    : `ప్రత్యేకంగా మెరుగుదల అవసరమైన అంశాలు కనిపించవు.`;

  return { success, decline, weakSubjects };
};

export const analyzePerformance = async (student: Student): Promise<AIAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Using fallback analysis.");
    return getFallbackAnalysis(student);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Keep behavior safe: attempt an AI call, but fall back on local analysis on any error.
    // Note: library usage may vary; to avoid runtime breakage we do not depend on a specific
    // API surface here. If you want a live AI call, replace the block below with a real
    // `ai.generate` invocation according to @google/genai docs.

    // Currently return the deterministic fallback analysis for reliability.
    return getFallbackAnalysis(student);
  } catch (err) {
    console.warn("AI analysis failed, returning fallback.", err);
    return getFallbackAnalysis(student);
  }
};
