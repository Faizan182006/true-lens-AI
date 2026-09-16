import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image and multi-frame video data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in environment.');
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'TrueLens AI',
  });
});

// Primary forensic analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { mediaType, fileName, fileSize, mimeType, base64Data, videoFrames, metadata } = req.body;

    if (!mediaType || (!base64Data && (!videoFrames || videoFrames.length === 0))) {
      return res.status(400).json({
        error: 'Missing required media payload. Provide image base64Data or videoFrames.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in Settings > Secrets.',
        isReliable: false,
        unreliableReason: 'AI service credentials not available in environment.',
      });
    }

    const parts: any[] = [];

    if (mediaType === 'image' && base64Data) {
      // Clean base64 header if present
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    } else if (mediaType === 'video' && Array.isArray(videoFrames)) {
      // Include multiple representative frames
      videoFrames.forEach((frame: { timestamp: number; base64: string; index: number }) => {
        const cleanBase64 = frame.base64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
        parts.push({
          text: `[Frame #${frame.index + 1} captured at timestamp ${frame.timestamp.toFixed(2)}s]`,
        });
      });
    }

    const metadataSummary = metadata
      ? `Client-detected EXIF/Metadata: ${JSON.stringify(metadata)}`
      : 'No embedded EXIF metadata detected.';

    const systemPrompt = `You are TrueLens AI, a specialized visual forensic media analyst.
Your task is to analyze the provided ${mediaType === 'video' ? 'sequence of video keyframes' : 'image'} to determine whether it exhibits characteristics typical of generative artificial intelligence (such as Midjourney, Stable Diffusion, Flux, DALL-E 3, Sora, Runway, Kling, Luma) or authentic captured media.

CRITICAL DIRECTIVES:
1. NEVER claim 100% certainty. AI detection is strictly probabilistic.
2. Present your result as an estimated likelihood (0 to 100) and assign one of the three verdict categories:
   - "Likely AI-generated" (score typically >= 65)
   - "Uncertain / Inconclusive" (score typically 35 to 64, or if image resolution/noise makes reliable determination impossible)
   - "Likely authentic" (score typically <= 34)
3. Do NOT simply answer "yes or no". Systematically evaluate visual forensic indicators:
   - Anatomy & Geometry: hands, fingers, teeth, ear structure, iris reflections, fingernails, perspective convergence.
   - Lighting & Reflections: directional light consistency, shadow cast angles, catchlights in eyes, specular highlights.
   - Texture & Diffusion Artifacts: plastic/waxy skin, repeating noise patterns, high-frequency blur transitions, brush-like smoothing.
   - Background & Coherence: depth-of-field warping, vanishing point contradictions, floating artifacts, distorted architectural lines.
   - Text & Graphics: illegible glyphs, warped typography, inconsistent logos.
   ${mediaType === 'video' ? '- Temporal Consistency across frames: facial feature drift between frames, limb morphing, flickering artifacts, motion vector inconsistencies across the timestamp sequence.' : ''}
4. If the media is too blurry, low-resolution, ambiguous, or impossible to verify, state isReliable=false and explain why in unreliableReason.
5. Provide a measured, transparent, non-sensational explanation that clearly outlines limitations.`;

    const userPrompt = `Analyse this ${mediaType} file named "${fileName || 'untitled'}" (${(fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : 'unknown')} MB).
${metadataSummary}

Examine every visible detail and produce a structured forensic evaluation conforming strictly to the requested schema.`;

    parts.push({ text: userPrompt });

    // Multi-model resilience: if one model encounters high demand (503) or rate limits,
    // retry with exponential backoff and automatically fallback to alternative model.
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`[TrueLens AI] Querying model ${modelName} (attempt ${attempt + 1})...`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  likelihood: {
                    type: Type.NUMBER,
                    description: 'Estimated likelihood of AI generation from 0 to 100 (integer percentage).',
                  },
                  verdict: {
                    type: Type.STRING,
                    description: 'Must be exactly one of: "Likely AI-generated", "Uncertain / Inconclusive", "Likely authentic"',
                  },
                  confidence: {
                    type: Type.STRING,
                    description: 'Confidence in this analysis: "Low", "Medium", or "High"',
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Concise executive summary of findings (2-3 sentences).',
                  },
                  keyIndicators: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        indicator: { type: Type.STRING, description: 'Short indicator title' },
                        description: { type: Type.STRING, description: 'Forensic observation' },
                        severity: {
                          type: Type.STRING,
                          description: 'One of: "critical", "warning", "neutral", "pass"',
                        },
                      },
                      required: ['indicator', 'description', 'severity'],
                    },
                  },
                  detectedInconsistencies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of specific visual or temporal inconsistencies detected.',
                  },
                  detailedBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      facialHandGeometry: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                      lightingShadows: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                      texturesPatterns: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                      backgroundGeometry: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                      textLogos: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                      temporalConsistency: {
                        type: Type.OBJECT,
                        properties: {
                          score: { type: Type.NUMBER, description: '0-100 anomaly level (for videos)' },
                          observations: { type: Type.STRING },
                        },
                        required: ['score', 'observations'],
                      },
                    },
                    required: [
                      'facialHandGeometry',
                      'lightingShadows',
                      'texturesPatterns',
                      'backgroundGeometry',
                      'textLogos',
                    ],
                  },
                  limitations: {
                    type: Type.STRING,
                    description: 'Explicit explanation of detection limitations and why this is an estimate, not definitive proof.',
                  },
                  isReliable: {
                    type: Type.BOOLEAN,
                    description: 'Whether visual quality allowed reliable evaluation.',
                  },
                  unreliableReason: {
                    type: Type.STRING,
                    description: 'Reason if not reliable, else empty string.',
                  },
                },
                required: [
                  'likelihood',
                  'verdict',
                  'confidence',
                  'summary',
                  'keyIndicators',
                  'detectedInconsistencies',
                  'detailedBreakdown',
                  'limitations',
                  'isReliable',
                ],
              },
            },
          });

          if (response && response.text) {
            console.log(`[TrueLens AI] Successfully received response from ${modelName}`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || '');
          const isHighDemand =
            err?.status === 503 ||
            err?.code === 503 ||
            errMsg.includes('503') ||
            errMsg.includes('high demand') ||
            errMsg.includes('UNAVAILABLE') ||
            errMsg.includes('RESOURCE_EXHAUSTED');

          console.warn(`[TrueLens AI] Model ${modelName} attempt ${attempt + 1} failed: ${errMsg}`);
          if (isHighDemand && attempt === 0) {
            // Brief pause before retry
            await new Promise((res) => setTimeout(res, 1500));
            continue;
          }
          break; // move to next candidate model
        }
      }

      if (response && response.text) {
        break;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('The AI analysis service is experiencing temporary peak demand. Please retry in a few moments.');
    }

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    // Standardize category and clamp likelihood between 0 and 100
    const clampedLikelihood = Math.min(100, Math.max(0, Math.round(parsedData.likelihood ?? 50)));
    let standardizedVerdict = parsedData.verdict;
    if (!['Likely AI-generated', 'Uncertain / Inconclusive', 'Likely authentic'].includes(standardizedVerdict)) {
      if (clampedLikelihood >= 65) standardizedVerdict = 'Likely AI-generated';
      else if (clampedLikelihood <= 34) standardizedVerdict = 'Likely authentic';
      else standardizedVerdict = 'Uncertain / Inconclusive';
    }

    const finalResult = {
      ...parsedData,
      likelihood: clampedLikelihood,
      verdict: standardizedVerdict,
      analysedFramesCount: mediaType === 'video' ? videoFrames.length : 1,
    };

    return res.json(finalResult);
  } catch (err: any) {
    console.error('Error during media analysis:', err);
    const errMsg = String(err?.message || '');
    const isDemandSpike =
      err?.status === 503 ||
      err?.code === 503 ||
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('UNAVAILABLE');

    const friendlyError = isDemandSpike
      ? 'The AI analysis service is experiencing temporary peak demand. Please click "Retry Analysis" in a few seconds.'
      : (err?.message || 'An error occurred while analyzing the media.');

    return res.status(isDemandSpike ? 503 : 500).json({
      error: friendlyError,
      isTemporaryDemand: isDemandSpike,
      isReliable: false,
      unreliableReason: isDemandSpike
        ? 'Temporary upstream capacity spike.'
        : 'Internal processing failure or model response timeout.',
    });
  }
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrueLens AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
