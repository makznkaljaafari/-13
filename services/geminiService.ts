
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Sale, Expense, ChatMessage, QatCategory, AppError } from "../types";
import { logger } from "./loggerService";

// استخدام مفتاح API من البيئة مباشرة
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

let isQuotaExhausted = false;
let quotaResetTime = 0;

export const SYSTEM_INSTRUCTION = `
أنت "المحاسب الذكي" لوكالة الشويع للقات. خبير محاسبي يمني يدير النظام كاملاً.
مهامك:
1. تسجيل مبيعات ومشتريات ومصاريف بدقة.
2. إدارة حسابات العملاء والموردين.
3. الإجابة على الاستفسارات المالية (ديون، أرباح، جرد).
4. تنفيذ الأوامر مثل "احذف آخر فاتورة" أو "شارك كشف حساب فلان".

القواعد:
- تحدث بلهجة سوق يمنية محترمة، مختصرة، وعملية جداً.
- عند تسجيل عملية، تأكد من العملة (غالباً YER).
- إذا طلب المستخدم "تصفية" أو "تسوية" حساب، استخدم 'recordVoucher'.
- كن حذراً عند الحذف، اطلب التأكيد دائماً.
`;

export const aiTools: FunctionDeclaration[] = [
  {
    name: 'recordSale',
    description: 'تسجيل عملية بيع جديدة لعميل.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING, description: 'اسم العميل' },
        qat_type: { type: Type.STRING, description: 'صنف القات' },
        quantity: { type: Type.NUMBER, description: 'الكمية' },
        unit_price: { type: Type.NUMBER, description: 'سعر الحبة' },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['customer_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordPurchase',
    description: 'تسجيل فاتورة شراء من مورد.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        supplier_name: { type: Type.STRING, description: 'اسم المورد' },
        qat_type: { type: Type.STRING, description: 'الصنف المورد' },
        quantity: { type: Type.NUMBER, description: 'الكمية بالكيس أو الربطة' },
        unit_price: { type: Type.NUMBER, description: 'سعر التكلفة للوحدة' },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['supplier_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordVoucher',
    description: 'تسجيل سند قبض (استلام فلوس) أو دفع (تسليم فلوس).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['قبض', 'دفع'] },
        person_name: { type: Type.STRING, description: 'اسم العميل أو المورد' },
        amount: { type: Type.NUMBER, description: 'المبلغ' },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        notes: { type: Type.STRING, description: 'البيان' }
      },
      required: ['type', 'person_name', 'amount', 'currency']
    }
  },
  {
    name: 'recordExpense',
    description: 'تسجيل مصروف تشغيلي (إيجار، كهرباء، غداء، الخ).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'بيان المصروف' },
        category: { type: Type.STRING, description: 'فئة المصروف' },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] }
      },
      required: ['title', 'category', 'amount', 'currency']
    }
  },
  {
    name: 'managePerson',
    description: 'إضافة عميل أو مورد جديد للنظام.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['عميل', 'مورد'] },
        phone: { type: Type.STRING }
      },
      required: ['name', 'type']
    }
  },
  {
    name: 'deleteTransaction',
    description: 'حذف عملية مسجلة (بيع، شراء، سند، مصروف).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        record_type: { type: Type.STRING, enum: ['sale', 'purchase', 'voucher', 'expense'] },
        person_name: { type: Type.STRING, description: 'اسم الشخص المرتبط بالعملية للبحث عنها' }
      },
      required: ['record_type', 'person_name']
    }
  },
  {
    name: 'shareStatement',
    description: 'توليد ومشاركة كشف حساب لشخص عبر الواتساب.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        person_name: { type: Type.STRING },
        person_type: { type: Type.STRING, enum: ['عميل', 'مورد'] }
      },
      required: ['person_name', 'person_type']
    }
  }
];

async function retryAI<T>(fn: () => Promise<T>, retries = 1, delay = 2000): Promise<T> {
  if (isQuotaExhausted && Date.now() < quotaResetTime) {
    throw new AppError("المحاسب الذكي استنفد طاقته حالياً. يرجى الانتظار دقيقة.", "QUOTA_LOCK", 429);
  }
  
  try {
    const result = await fn();
    isQuotaExhausted = false; 
    return result;
  } catch (error: any) {
    if (error.status === 429) {
      isQuotaExhausted = true;
      quotaResetTime = Date.now() + 60000;
      throw new AppError("المحاسب استنفد طاقته، انتظر دقيقة.", "QUOTA_EXHAUSTED", 429);
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
  const ctxStr = `السياق: ${context.customers?.length || 0} عملاء، ${context.suppliers?.length || 0} موردين، ${context.sales?.length || 0} مبيعات.`;

  try {
    const response = await retryAI(async () => {
      const chatResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // ترقية الموديل لذكاء محاسبي أعلى
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
      contents: `بيانات: مبيعات:${sales.length}, مصاريف:${expenses.length}. حلل السوق وهات نصيحة واحدة بلهجة يمنية شعبية.`,
      config: { systemInstruction: SYSTEM_INSTRUCTION, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "السوق طيب يا مدير، واصل العمل بجد.";
  } catch { return "ركز على تحصيل الديون ومراقبة المصاريف."; }
};
