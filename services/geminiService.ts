
import { GoogleGenAI, Type } from "@google/genai";
import type { Schedule, Risk } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSchedule = async (
  description: string,
  duration: string,
  startDate: string
): Promise<Schedule> => {
  try {
    const prompt = `Você é um assistente de gerenciamento de projetos de construção. Crie um cronograma detalhado para o seguinte projeto: "${description}". O projeto deve durar ${duration} dias, começando em ${startDate}. O cronograma deve incluir as principais fases (ex: Planejamento, Fundação, Estrutura, Acabamentos, Entrega) e tarefas específicas para cada fase, com estimativas de duração em dias. Formate a saída como um JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phases: {
              type: Type.ARRAY,
              description: 'Lista de fases do projeto.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'Nome da fase.',
                  },
                  duration: {
                    type: Type.STRING,
                    description: 'Duração estimada da fase em dias.',
                  },
                  tasks: {
                    type: Type.ARRAY,
                    description: 'Lista de tarefas dentro da fase.',
                    items: {
                      type: Type.STRING,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Schedule;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error("Não foi possível gerar o cronograma. Tente novamente.");
  }
};

export const analyzeRisks = async (description: string): Promise<Risk[]> => {
  try {
    const prompt = `Você é um especialista em análise de riscos para projetos de construção. Para o projeto descrito como "${description}", identifique 5 riscos potenciais. Para cada risco, forneça uma breve descrição, a probabilidade de ocorrência (Baixa, Média, Alta) e uma estratégia de mitigação. Formate a saída como um JSON.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              risk: {
                type: Type.STRING,
                description: 'Descrição do risco.',
              },
              probability: {
                type: Type.STRING,
                description: 'Probabilidade de ocorrência (Baixa, Média, Alta).',
              },
              mitigation: {
                type: Type.STRING,
                description: 'Estratégia de mitigação sugerida.',
              },
            },
          },
        },
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Risk[];
  } catch (error) {
    console.error("Error analyzing risks:", error);
    throw new Error("Não foi possível analisar os riscos. Tente novamente.");
  }
};
