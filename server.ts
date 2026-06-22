import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import "dotenv/config";
import express from "express";
import dns from "node:dns";
import path from "path";
import { createServer as createViteServer } from "vite";

// Fix Node.js DNS resolving preference for localhost in development environments
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client instantiator
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn(
        "WARNING: GEMINI_API_KEY is not defined in the environment. AI features will fail with explicit error responses.",
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// SEC/FINRA Compliance Marketing Content Reviewer Endpoint
// -------------------------------------------------------------
app.post("/api/compliance/review", async (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ error: "Content field is required for compliance review." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY is missing. Please add your Gemini API Key in the Settings > Secrets configuration panel to use this feature.",
      });
    }

    const systemInstruction = `
      You are an expert Chief Compliance Officer (CCO) specialized in SEC (Investment Advisers Act Rule 206(4)-1) and FINRA (Rule 2210) advertising rules.
      Analyze the provided marketing content (category: ${category || "General Advice"}) and flag specific compliance issues.
      You must evaluate for:
      1. Promissory Claims: Guarantees of returns, "risk-free", "double your money", "ensure success", or oversimplified wealth creation.
      2. Omissions of Risk Disclosures: High returns stated without a corresponding notice that investing involves substantial risk of loss.
      3. Prominent Praise / Testimonials: Unbalanced testimonials or third-party ratings without showing the source, date, and conditions, or claiming past performance predicts future results.
      4. Required Advisor Disclosures: Crucial warning labels and disclosure copy that MUST be added to make this piece compliant.
      
      Classify results and calculate a safety compliance score from 0 to 100.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform a compliance review on the following text:\n\n"${content}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "promissoryClaims",
            "omissionsOfRisk",
            "prominentPraise",
            "requiredDisclosures",
            "complianceScore",
            "overallSummary",
          ],
          properties: {
            complianceScore: {
              type: Type.INTEGER,
              description:
                "Overall safety score from 0 (extremely non-compliant) to 100 (fully compliant).",
            },
            overallSummary: {
              type: Type.STRING,
              description:
                "Brief professional summary of the marketing copy from a compliance perspective.",
            },
            promissoryClaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: [
                  "textSegment",
                  "explanation",
                  "severity",
                  "suggestedRewrite",
                ],
                properties: {
                  textSegment: {
                    type: Type.STRING,
                    description: "The violating phrase or sentence.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Why this violates SEC/FINRA rules.",
                  },
                  severity: {
                    type: Type.STRING,
                    description: "HIGH, MEDIUM, or LOW.",
                  },
                  suggestedRewrite: {
                    type: Type.STRING,
                    description: "A compliant alternative phrase.",
                  },
                },
              },
            },
            omissionsOfRisk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["explanation", "suggestedDisclaimer"],
                properties: {
                  explanation: {
                    type: Type.STRING,
                    description: "Why risk warning is omitted here.",
                  },
                  suggestedDisclaimer: {
                    type: Type.STRING,
                    description:
                      "Specific disclaimer copy that must be appended.",
                  },
                },
              },
            },
            prominentPraise: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["textSegment", "explanation", "suggestedFix"],
                properties: {
                  textSegment: {
                    type: Type.STRING,
                    description:
                      "The testimonial, award, or past-performance claim.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Requirement violation description.",
                  },
                  suggestedFix: {
                    type: Type.STRING,
                    description:
                      "How to balance this praise (e.g. adding dates, criteria).",
                  },
                },
              },
            },
            requiredDisclosures: {
              type: Type.ARRAY,
              description:
                "A list of standard legal disclaimers recommended based on the file content.",
              items: {
                type: Type.STRING,
              },
            },
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No output generated from compliance reviewer model.");
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Compliance review endpoint error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal compliance engine failure." });
  }
});

// -------------------------------------------------------------
// SEC & FINRA Interactive Rule Search (with Google Search Grounding)
// -------------------------------------------------------------
app.post("/api/compliance/sec-search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY is missing. Please configure your API key to enable Search Grounding.",
      });
    }

    // Google Search Grounding is enabled by adding { googleSearch: {} } as a tool.
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search and summarize real, up-to-date SEC or FINRA rules regarding this query: "${query}". Provide the corresponding rule numbers and official guidance. Ensure search grounding is activated.`,
      config: {
        systemInstruction:
          "You are an AI Compliance Counsel. Provide precise details, rule references, dates, and citation labels. State points clearly with markdown.",
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract grounding metadata to output search links on client side
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return res.json({
      answer: response.text,
      sources: groundingMetadata?.groundingChunks || [],
      metadata: groundingMetadata,
    });
  } catch (error: any) {
    console.error("Regulatory rule search error:", error);
    return res.status(500).json({
      error: error.message || "Failed to complete search grounding query.",
    });
  }
});

// -------------------------------------------------------------
// Location-Based Compliance Advisor (with Google Maps context/Search)
// -------------------------------------------------------------
app.post("/api/compliance/jurisdiction-maps", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "Address is required." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY is missing. Please configure your key in Secrets.",
      });
    }

    // This query requests details on nearest FINRA and SEC offices, state regulators, and local state Blue Sky laws.
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Identify the SEC regional offices, FINRA district offices, and state-level Blue Sky authorities near or governing the address: "${address}". 
                 Outline specific regional registration requirements or Blue Sky constraints for investment advisors or broker-dealers in this state.`,
      config: {
        systemInstruction:
          "Identify official geographic regulatory bodies, regional office details, addresses, and important Blue Sky rule codes.",
        tools: [{ googleSearch: {} }], // Combine with search as state constraints vary!
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return res.json({
      advice: response.text,
      sources: groundingMetadata?.groundingChunks || [],
      metadata: groundingMetadata,
    });
  } catch (error: any) {
    console.error("Jurisdiction lookup error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process location compliance details.",
    });
  }
});

// -------------------------------------------------------------
// High Thinking Executive Guide Endpoint (gemini-3.1-pro-preview with HIGH thinking config)
// -------------------------------------------------------------
app.post("/api/compliance/think-guide", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY is missing. High Thinking reasoning cannot progress without a valid API key.",
      });
    }

    // Call gemini-3.1-pro-preview using ThinkingLevel.HIGH with no maxOutputTokens limit.
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Deconstruct this complex SEC/FINRA compliance inquiry with comprehensive, step-by-step audit analysis:\n\n"${question}"`,
      config: {
        systemInstruction:
          "You are the Principal Regulatory Analyst. Deconstruct the inquiry. Outline historical precedents, SEC Risk Alerts, and comprehensive enforcement audit points.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH, // Sets thinking level to HIGH.
        },
      },
    });

    return res.json({
      thoughtfulResponse: response.text,
      // Pass back a simulated thought indicator or let the client display it
    });
  } catch (error: any) {
    console.error("High thinking guide analysis failure:", error);
    return res.status(500).json({
      error:
        error.message || "Failed to execute High Thinking model generation.",
    });
  }
});

// -------------------------------------------------------------
// Serve static client assets and hot middleware
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server successfully started. Running full-stack on http://0.0.0.0:${PORT}`,
    );
  });
}

startServer();
