
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Sale, Expense, ChatMessage, QatCategory, AppError } from "../types";
import { logger } from "./loggerService";

// الالتزام بالقاعدة: استخدام process.env.API_KEY مباشرة وعدم تعريف محلي للمفتاح
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

let isQuotaExhausted = false;
let quotaResetTime = 0;

export const SYSTEM_INSTRUCTION = `
أنت "المحاسب الذكي" لوكالة الشويع للقات. خبير محاسبي يمني يدير النظام كاملاً بالصوت والنص.
تحدث بلهجة سوق يمنية محترمة ومختصرة جداً.
`;

export const aiTools: FunctionDeclaration[] = [
  {
    name: 'recordSale',
    description: 'تسجيل عملية بيع جديدة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING },
        qat_type: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        unit_price: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['customer_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  }
];

async function retryAI<T>(fn: () => Promise<T>, retries = 1, delay = 2000): Promise<T> {
  if (isQuotaExhausted && Date.now() < quotaResetTime) {
    throw new AppError("المحاسب الذكي استنفد طاقته حالياً. يرجى الانتظار دقيقة.", "QUOTA_LOCK", 429, true);
  }
  
  try {
    const result = await fn();
    isQuotaExhausted = false; 
    return result;
  } catch (error: any) {
    if (error.status === 429) {
      isQuotaExhausted = true;
      quotaResetTime = Date.now() + 60000;
      throw new AppError("المحاسب استنفد طاقته، انتظر دقيقة.", "QUOTA_EXHAUSTED", 429, true);
    }
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return retryAI(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getChatResponse = async (message: string, history: ChatMessage[], context: any) => {
  const ai = getAIClient();
  const ctxStr = `السياق: ${context.customers?.length || 0} عملاء، ${context.suppliers?.length || 0} موردين.`;

  try {
    const response = await retryAI(async () => {
      // الالتزام بالقاعدة: استخدام ai.models.generateContent مباشرة
      const chatResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION + "\n" + ctxStr,
          tools: [{ functionDeclarations: aiTools }],
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return { text: chatResponse.text, toolCalls: chatResponse.functionCalls || [] };
    });
    return response;
  } catch(e: any) {
    logger.error("AI Error:", e);
    throw e;
  }
};

export const getFinancialForecast = async (sales: Sale[], expenses: Expense[], categories: QatCategory[]) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بيانات: مبيعات:${sales.length}, مصاريف:${expenses.length}. هات نصيحة سوقية واحدة بلهجة يمنية.`,
      config: { systemInstruction: SYSTEM_INSTRUCTION, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "السوق طيب يا مدير، واصل العمل بجد.";
  } catch { return "ركز على تحصيل الديون ومراقبة المصاريف."; }
};
