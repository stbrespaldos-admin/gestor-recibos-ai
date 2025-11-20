import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, ReceiptStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a base64 image string using Gemini to extract receipt data.
 */
export const analyzeReceiptImage = async (base64Image: string): Promise<Partial<ReceiptData>> => {
  // Extract mime type dynamically
  const mimeTypeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/webp'; // Default to webp as we compress to it

  // Strip data url prefix
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: `Analiza esta imagen de recibo y extrae los siguientes detalles en formato JSON:
            - Nombre del Comercio/Vendedor (merchantName)
            - Monto Total (totalAmount - numérico)
            - Código de Moneda (currency - ej. USD, EUR, COP)
            - Fecha (date - formato YYYY-MM-DD)
            - Categoría (category - Elige una: Alimentación, Transporte, Servicios, Software, Oficina, Otros)
            - Documento/Cédula del cliente si aparece (customerDocument)
            - Lista de ítems (items) con description y price
            
            Si no encuentras un dato, usa null o valores vacíos razonables.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            customerDocument: { type: Type.STRING, nullable: true },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ['merchantName', 'totalAmount', 'date', 'category']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    
    return {
      merchantName: data.merchantName,
      totalAmount: data.totalAmount,
      currency: data.currency || 'USD',
      date: data.date,
      category: data.category,
      customerDocument: data.customerDocument || '',
      items: data.items || [],
      status: ReceiptStatus.VERIFIED,
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error Full Details:", error);
    // Check for common quota or permission errors
    if (error.message?.includes('403')) throw new Error("Error 403: API Key inválida o sin permisos.");
    if (error.message?.includes('429')) throw new Error("Error 429: Cuota excedida en Gemini.");
    throw error;
  }
};