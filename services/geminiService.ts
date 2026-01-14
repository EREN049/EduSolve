
import { GoogleGenAI, Type } from "@google/genai";
import { ExerciseSolution, Subject, EducationLevel, SolveMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

export const solveExercise = async (base64Image: string, mode: SolveMode): Promise<ExerciseSolution> => {
  const prompt = `
    Act as a high-precision Moroccan High School Teacher.
    TASK: Analyze the image, detect EVERY question, and provide a formal exam-style solution.
    MATH RULES: Wrap ALL math in $...$ or $$...$$. Never use raw LaTeX like \\boxed outside delimiters.
    OUTPUT JSON: Ensure valid JSON structure as requested.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            subject: { type: Type.STRING },
            level: { type: Type.STRING },
            language: { type: Type.STRING },
            mainIdea: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING },
                  text: { type: Type.STRING },
                  status: { type: Type.STRING },
                  examAnswer: { type: Type.STRING }
                },
                required: ["number", "text", "status", "examAnswer"]
              }
            },
            verificationStatus: { type: Type.STRING },
            totalQuestionsFound: { type: Type.INTEGER },
            allSolved: { type: Type.BOOLEAN }
          },
          required: ["originalText", "subject", "level", "language", "mainIdea", "questions", "verificationStatus", "totalQuestionsFound", "allSolved"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as ExerciseSolution;
  } catch (error) {
    throw new Error("حدث خطأ في قراءة الصورة. يرجى محاولة التقاط صورة أوضح.");
  }
};

export const explainConcept = async (concept: string): Promise<ExerciseSolution> => {
  const prompt = `
    Act as a Moroccan High School Teacher.
    TASK: Explain the following concept: "${concept}".
    STRUCTURE: Provide a definition, key formulas (if any), and a practical example.
    MATH RULES: Wrap ALL math/formulas in $...$ or $$...$$.
    JSON FORMAT:
    {
      "originalText": "${concept}",
      "subject": "Explication de Concept",
      "level": "Tous les niveaux",
      "language": "ar",
      "mainIdea": "شرح مفهوم: ${concept}",
      "questions": [
        {
          "number": "الشرح",
          "text": "ما هو ${concept}؟",
          "status": "solved",
          "examAnswer": "Detailed pedagogical explanation with LaTeX."
        }
      ],
      "verificationStatus": "Concept explained successfully",
      "totalQuestionsFound": 1,
      "allSolved": true
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text.trim()) as ExerciseSolution;
  } catch (error) {
    throw new Error("فشل في شرح المفهوم. حاول صياغة السؤال بشكل أوضح.");
  }
};
