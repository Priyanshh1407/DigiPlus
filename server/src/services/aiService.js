import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// The GoogleGenAI SDK uses GEMINI_API_KEY environment variable automatically
// if passed empty constructor, but we'll pass it explicitly to be sure.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function testConnection() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: 'Respond with a single word: Hello'
    });
    console.log("AI Test Response:", response.text);
    return response.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
export async function analyzeIncident(title, description) {
  try {
    const prompt = `Analyze this IT support incident and extract the required information in JSON format.
Title: ${title}
Description: ${description}

Strictly return a JSON object with this exact schema:
{
  "category": "String. One of: Network, Infrastructure, Hardware, Software, Database, UI/UX, Security, Other",
  "priority": "String. One of: low, medium, high",
  "summary": "String. A concise 1-2 sentence technical summary of the issue.",
  "suggestedSteps": "String. A list of 2-3 troubleshooting steps formatted as bullet points (use standard dashes '-' for bullets, separated by newlines)."
}

IMPORTANT: If the incident title or description is vague, unclear, or too short to diagnose the actual problem, set category to 'Other', priority to 'low', and use the summary and suggestedSteps to explicitly ask the user to provide more clarification and specific details about the issue.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Service Error during analysis:", error);
    // Return a safe fallback if AI fails
    return {
      category: "Other",
      priority: "medium",
      summary: "AI Analysis failed to generate a summary.",
      suggestedSteps: "- Manually review the incident."
    };
  }
}

export async function suggestKBArticles(title, description, kbArticles) {
  try {
    const kbContext = kbArticles.map(kb => `ID: ${kb.id} | Title: ${kb.title} | Content: ${kb.content}`).join('\n');
    
    const prompt = `You are an IT support assistant. Your task is to find the most relevant Knowledge Base (KB) articles for an incoming incident.
    
Incoming Incident:
Title: ${title}
Description: ${description}

Available KB Articles:
${kbContext}

Strictly return a JSON object with this exact schema:
{
  "suggestedArticles": [
    {
      "id": integer (the ID of the matched KB article),
      "reason": "String. A 1-2 sentence explanation of why this article helps solve the incident.",
      "matchPercentage": integer (1 to 100 representing confidence)
    }
  ]
}

If no articles are relevant, return an empty array for suggestedArticles.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Service Error during KB suggestion:", error);
    return { suggestedArticles: [] };
  }
}

export async function detectDuplicate(title, description, recentIncidents) {
  try {
    if (!recentIncidents || recentIncidents.length === 0) {
      return { isDuplicate: false, duplicateOfId: null };
    }

    const context = recentIncidents.map(inc => `ID: ${inc.id} | Title: ${inc.title} | Description: ${inc.description}`).join('\n\n');
    
    const prompt = `You are an IT Support AI. Your task is to detect if an incoming incident is a duplicate of a recent open incident.
    
Incoming Incident:
Title: ${title}
Description: ${description}

Recent Open Incidents:
${context}

Analyze the incoming incident. Does it describe the exact same underlying issue as one of the recent open incidents?
(For example: multiple users reporting the same WiFi outage, or the same server being down).

Strictly return a JSON object with this exact schema:
{
  "isDuplicate": Boolean (true if a duplicate is found, false otherwise),
  "duplicateOfId": Integer (the ID of the matched recent incident, or null if not a duplicate),
  "reason": "String (a short 1 sentence explanation of your decision)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Service Error during duplicate detection:", error);
    return { isDuplicate: false, duplicateOfId: null, reason: "Error detecting duplicate" };
  }
}
