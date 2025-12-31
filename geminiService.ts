import { GoogleGenAI, Type } from "@google/genai";
import { Student, AIAnalysis, ExamResult } from "./types";

export const analyzePerformance = async (
  student: Student
): Promise<AIAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Using fallback analysis.");
    return getFallbackAnalysis();
  }

  const ai = new GoogleGenAI({ apiKey });

  const getSubjectSummary = (exam: ExamResult) => {
    const subjects = [
      "telugu",
      "hindi",
      "english",
      "maths",
      "ps",
      "bs",
      "social",
    ] as const;

    return subjects
      .map((s) => `${s}: ${exam[s].marks} (${exam[s].grade})`)
      .join
