const {
  sequelize,
  Exam,
  ExamTemplate,
  ExamQuestion,
  ExamSubmission,
  ExamAnswer,
  ExamAttempt,
  StudentAnswer,
  TemporaryAnswer,
  ExamSessionLog,
  StudentExamResult,
  ExamSchedule,
  Student,
  User,
} = require("../models");
const axios = require("axios");
const fs = require("fs");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const userSafe = { attributes: { exclude: ["password_hash"] } };
const QUESTION_TYPES = new Set(["multiple_choice", "multi_select", "true_false", "essay", "short_text", "long_text", "number", "diagram_label"]);
const EXAM_STATUS = new Set(["draft", "published", "archived"]);

const examIncludes = [
  { model: ExamTemplate, as: "template", required: false },
  { model: ExamQuestion, as: "questions" },
  { model: User, as: "creator", required: false, ...userSafe },
];

const normalizeQuestion = (q, idx = 0) => {
  const question_type = String(q?.question_type || "short_text");
  if (!QUESTION_TYPES.has(question_type)) {
    throw new Error(`Unsupported question type at question ${idx + 1}`);
  }
  const question_text = String(q?.question_text || "").trim();
  if (!question_text) {
    throw new Error(`Question text is required at question ${idx + 1}`);
  }
  let options = Array.isArray(q?.options) ? q.options : Array.isArray(q?.options_json) ? q.options_json : null;
  if (question_type === "diagram_label") {
    const diagramData = String(q?.diagram_data || q?.options?.diagram_data || q?.options_json?.diagram_data || "").trim();
    const diagramPositionSrc = q?.diagram_position || q?.options?.diagram_position || q?.options_json?.diagram_position || {};
    const rawHotspots = Array.isArray(q?.diagram_hotspots)
      ? q.diagram_hotspots
      : Array.isArray(q?.options?.hotspots)
      ? q.options.hotspots
      : Array.isArray(q?.options_json?.hotspots)
      ? q.options_json.hotspots
      : [];
    const hotspots = rawHotspots.map((hs, i) => ({
      id: hs?.id || `hs-${idx + 1}-${i + 1}`,
      x: Number.isFinite(Number(hs?.x)) ? Number(hs.x) : 50,
      y: Number.isFinite(Number(hs?.y)) ? Number(hs.y) : 50,
      prompt: String(hs?.prompt || "").trim(),
      correct_answer: String(hs?.correct_answer || "").trim(),
    }));
    if (!diagramData) throw new Error(`Diagram drawing is required at question ${idx + 1}`);
    if (!hotspots.length) throw new Error(`At least one diagram hotspot is required at question ${idx + 1}`);
    options = {
      diagram_data: diagramData,
      hotspots,
      diagram_position: {
        x: Number.isFinite(Number(diagramPositionSrc?.x)) ? Number(diagramPositionSrc.x) : 40,
        y: Number.isFinite(Number(diagramPositionSrc?.y)) ? Number(diagramPositionSrc.y) : 220,
        w: Number.isFinite(Number(diagramPositionSrc?.w)) ? Math.max(120, Number(diagramPositionSrc.w)) : 260,
        h: Number.isFinite(Number(diagramPositionSrc?.h)) ? Math.max(80, Number(diagramPositionSrc.h)) : 180,
        page: Number.isFinite(Number(diagramPositionSrc?.page)) ? Math.max(0, Number(diagramPositionSrc.page)) : 0,
      },
    };
  }
  return {
    question_text,
    question_type,
    options,
    correct_answer: q?.correct_answer != null ? String(q.correct_answer) : null,
    marks: Number.isFinite(Number(q?.marks)) ? Number(q.marks) : 0,
    order_number: Number.isFinite(Number(q?.order_number)) ? Number(q.order_number) : idx + 1,
    explanation: q?.explanation ? String(q.explanation) : null,
    required: Boolean(q?.required),
    canvas_x: Number.isFinite(Number(q?.canvas_x)) ? Number(q.canvas_x) : 40,
    canvas_y: Number.isFinite(Number(q?.canvas_y)) ? Number(q.canvas_y) : 120 + idx * 34,
    canvas_w: Number.isFinite(Number(q?.canvas_w)) ? Math.max(120, Number(q.canvas_w)) : 520,
    canvas_h: Number.isFinite(Number(q?.canvas_h)) ? Math.max(24, Number(q.canvas_h)) : 26,
    canvas_page: Number.isFinite(Number(q?.canvas_page)) ? Math.max(0, Number(q.canvas_page)) : 0,
  };
};

const normalizeExamLayout = (layout = {}) => {
  const src = layout && typeof layout === "object" ? layout : {};
  const def = {
    name: { x: 40, y: 80, w: 300, h: 24 },
    instructions: { x: 40, y: 115, w: 520, h: 30 },
    duration: { x: 420, y: 80, w: 140, h: 24 },
    passing_marks: { x: 40, y: 160, w: 180, h: 24 },
    total_marks: { x: 230, y: 160, w: 180, h: 24 },
  };
  const out = {};
  for (const key of Object.keys(def)) {
    const row = src[key] || {};
    out[key] = {
      x: Number.isFinite(Number(row.x)) ? Number(row.x) : def[key].x,
      y: Number.isFinite(Number(row.y)) ? Number(row.y) : def[key].y,
      w: Number.isFinite(Number(row.w)) ? Math.max(120, Number(row.w)) : def[key].w,
      h: Number.isFinite(Number(row.h)) ? Math.max(24, Number(row.h)) : def[key].h,
    };
  }
  if (Array.isArray(src.template_pages_override)) {
    out.template_pages_override = src.template_pages_override.map((p) => ({
      id: p?.id || undefined,
      elements: Array.isArray(p?.elements) ? p.elements : [],
    }));
  }
  return out;
};

const findStudentByUser = async (userId) => {
  if (!userId) return null;
  return Student.findOne({ where: { user_id: userId } });
};

exports.generateDiagramImage = async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    const mimeType = String(req.body?.mimeType || "image/png");
    const sizeHint = String(req.body?.size || "1024x1024");
    const [wStr, hStr] = String(sizeHint).toLowerCase().split("x");
    const width = Math.max(256, Math.min(2048, Number(wStr) || 1024));
    const height = Math.max(256, Math.min(2048, Number(hStr) || 1024));
    const generationNonce = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const makeSvgFallback = (title) => {
      const safe = String(title || "Diagram").replace(/[<>&]/g, "");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="24" y="24" width="${Math.max(120, width - 48)}" height="${Math.max(120, height - 48)}" fill="none" stroke="#111827" stroke-width="2"/>
  <text x="40" y="70" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">Auto Diagram Placeholder</text>
  <text x="40" y="120" font-family="Arial, sans-serif" font-size="20" fill="#374151">Prompt:</text>
  <foreignObject x="40" y="140" width="${Math.max(200, width - 80)}" height="${Math.max(120, height - 180)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 18px; color: #111827; line-height: 1.35; white-space: pre-wrap;">${safe}</div>
  </foreignObject>
</svg>`;
      const base64 = Buffer.from(svg, "utf8").toString("base64");
      return {
        mimeType: "image/svg+xml",
        base64,
        dataUrl: `data:image/svg+xml;base64,${base64}`,
      };
    };

    // ========== 1) PRIMARY: Vercel AI Gateway (Grok Imagine) ==========
    const vercelApiKey = String(process.env.VERCEL_AI_API_KEY || "").trim();
    if (vercelApiKey) {
      try {
        console.log("🎨 Generating image with Vercel AI Gateway / Grok...");

        for (let attempt = 1; attempt <= 2; attempt += 1) {
          try {
            const vercelRes = await axios.post(
              "https://gateway.ai.vercel.ai/v1/images/generations",
              {
                model: "xai/grok-imagine-image",
                prompt: `Create a clean educational diagram for exam use. Keep background white, text readable, and labels clear. ${prompt}\nVariation token: ${generationNonce}`,
                n: 1,
                size: `${width}x${height}`,
              },
              {
                headers: {
                  Authorization: `Bearer ${vercelApiKey}`,
                  "Content-Type": "application/json",
                },
                timeout: 45000,
              }
            );

            const imageUrl = vercelRes?.data?.data?.[0]?.url;
            if (!imageUrl) throw new Error("Vercel returned no image URL.");
            const imageResponse = await axios.get(imageUrl, {
              responseType: "arraybuffer",
              timeout: 30000,
            });
            const base64Image = Buffer.from(imageResponse.data, "binary").toString("base64");
            const outMime = imageResponse.headers["content-type"] || mimeType;

            console.log("✅ Vercel/Grok image generated successfully!");

            return res.json({
              success: true,
              provider: "vercel-grok",
              modelUsed: "xai/grok-imagine-image",
              data: {
                mimeType: outMime,
                base64: base64Image,
                url: imageUrl,
                dataUrl: `data:${outMime};base64,${base64Image}`,
              },
            });
          } catch (attemptError) {
            const msg = String(attemptError?.message || "");
            const transientTls = /TLS|socket|network|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(msg);
            if (attempt < 2 && transientTls) {
              await sleep(700);
              continue;
            }
            throw attemptError;
          }
        }
      } catch (vercelError) {
        console.error("⚠️ Vercel AI Gateway failed:", vercelError.response?.data?.error?.message || vercelError.message);
        // Continue to fallback
      }
    }

    // ========== 2) FALLBACK 1: Pollinations (free, no key) ==========
    try {
      console.log("🔄 Falling back to Pollinations...");
      const pollinationsPrompt = encodeURIComponent(
        `Create a clean educational diagram for exam use. Keep background white and labels readable. ${prompt}\nVariation token: ${generationNonce}`
      );
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${pollinationsPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${encodeURIComponent(
        generationNonce
      )}&_=${Date.now()}`;
      const pollinationsImage = await axios.get(pollinationsUrl, {
        responseType: "arraybuffer",
        timeout: 45000,
        headers: { Accept: "image/*" },
      });
      const outMime = pollinationsImage.headers["content-type"] || "image/png";
      const base64Data = Buffer.from(pollinationsImage.data, "binary").toString("base64");
      if (!base64Data) throw new Error("Pollinations returned empty image data.");
      console.log("✅ Pollinations generated image successfully!");
      return res.json({
        success: true,
        provider: "pollinations",
        modelUsed: "flux",
        data: {
          mimeType: outMime,
          base64: base64Data,
          dataUrl: `data:${outMime};base64,${base64Data}`,
        },
      });
    } catch (pollinationsError) {
      console.error("⚠️ Pollinations failed:", pollinationsError.message);
      // Continue to Gemini fallback
    }

    // ========== 3) FALLBACK 2: Gemini (text-only, descriptive fallback) ==========
    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
    if (apiKey) {
      try {
        console.log("🔄 Falling back to Gemini for text description...");

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Describe in detail what a diagram showing "${prompt}" should look like for an educational exam. Include labels, layout, and key elements. Return as a JSON object with fields: title, description, labels (array of label objects with x,y,text), and suggested_colors.`,
                  },
                ],
              },
            ],
          },
          { timeout: 30000 }
        );

        const description = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No description generated";

        // Try to parse as JSON if possible
        let parsedDescription = description;
        try {
          const jsonMatch = description.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedDescription = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // Keep as text
        }

        return res.json({
          success: true,
          provider: "gemini-text-fallback",
          note: "Image generation unavailable via Gemini. Returned text description that can be used to draw the diagram on canvas.",
          data: {
            description: parsedDescription,
            rawText: description,
          },
        });
      } catch (geminiError) {
        const status = Number(geminiError?.response?.status || 0);
        if (status === 429) console.error("⚠️ Gemini fallback failed: rate limited (429)");
        else console.error("⚠️ Gemini fallback failed:", geminiError.message);
      }
    }

    // ========== All providers failed -> guaranteed local SVG fallback ==========
    return res.json({
      success: true,
      provider: "local-svg-fallback",
      modelUsed: "local-svg",
      note: "All remote providers failed; returning local placeholder SVG image.",
      data: makeSvgFallback(prompt),
    });
  } catch (error) {
    const upstream = error?.response?.data;
    return res.status(502).json({
      success: false,
      message: upstream?.error?.message || error.message || "Failed to generate diagram image.",
    });
  }
};

// Keep extraction on legacy generateContent-friendly models for broader region/key compatibility.
const EXAM_EXTRACTION_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];

const extractJSONArray = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) return [];
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const extractDocumentText = async (reqFile, fileBuffer) => {
  const mime = String(reqFile?.mimetype || "").toLowerCase();
  const originalName = String(reqFile?.originalname || "").toLowerCase();
  const asUtf8 = () => String(fileBuffer.toString("utf8") || "").trim();

  if (mime.startsWith("text/")) return asUtf8();
  if (originalName.endsWith(".txt") || originalName.endsWith(".csv") || originalName.endsWith(".md")) return asUtf8();

  if (mime.includes("pdf") || originalName.endsWith(".pdf")) {
    const parsed = await pdfParse(fileBuffer);
    return String(parsed?.text || "").trim();
  }

  if (
    mime.includes("wordprocessingml.document") ||
    mime.includes("msword") ||
    originalName.endsWith(".docx") ||
    originalName.endsWith(".doc")
  ) {
    const out = await mammoth.extractRawText({ buffer: fileBuffer });
    return String(out?.value || "").trim();
  }

  return "";
};

exports.generateQuestionsFromDocument = async (req, res) => {
  const uploadedPath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Document file is required." });
    }

    const questionCount = Math.max(1, Math.min(50, Number(req.body?.questionCount) || 10));
    const difficulty = String(req.body?.difficulty || "medium").trim();
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileMime = String(req.file.mimetype || "application/octet-stream");
    const extractedText = await extractDocumentText(req.file, fileBuffer);
    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type for text extraction (${fileMime}). Use PDF, DOCX, or text files.`,
      });
    }
    const maxChars = 45000;
    const clippedText = extractedText.length > maxChars ? extractedText.slice(0, maxChars) : extractedText;

    const prompt = `You are an expert exam creator. Based on the document content, generate ${questionCount} ${difficulty} exam questions.

Return ONLY a JSON array (no other text).
Each item must have:
- "text": question text
- "type": one of "multiple_choice", "true_false", "essay", "short_text"
- "options": array of option strings for multiple_choice (empty for others)
- "correctAnswer": short correct answer
- "marks": number (default 5)
- "explanation": short explanation

DOCUMENT CONTENT:
${clippedText}`;

    // ========== 1) PRIMARY: OpenAI GPT-4o via Vercel AI Gateway ==========
    const vercelApiKey = String(process.env.VERCEL_AI_API_KEY || "").trim();
    if (vercelApiKey) {
      try {
        console.log("📄 Trying OpenAI GPT-4o via Vercel AI Gateway...");
        const vercelClient = new OpenAI({
          apiKey: vercelApiKey,
          baseURL: "https://gateway.ai.vercel.ai/v1",
        });

        const response = await vercelClient.chat.completions.create({
          model: "openai/gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096,
        });

        const content = response.choices?.[0]?.message?.content;
        if (content) {
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = extractJSONArray(content);
          }
          const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
          const normalized = normalizeExtractedQuestions(questionsArray);

          if (normalized.length) {
            console.log(`✅ GPT-4o extracted ${normalized.length} questions successfully!`);
            return res.json({
              success: true,
              data: normalized,
              provider: "vercel-openai",
              modelUsed: "openai/gpt-4o",
              usage: response.usage,
            });
          }
        }
      } catch (vercelError) {
        console.error("⚠️ Vercel/GPT-4o failed:", vercelError.response?.data?.error?.message || vercelError.message);
      }
    }

    // ========== 2) FALLBACK 1: OpenRouter Free Tier ==========
    const openrouterKey = String(process.env.OPENROUTER_API_KEY || "").trim();
    if (openrouterKey) {
      try {
        console.log("📄 Falling back to OpenRouter free tier...");
        const openrouterClient = new OpenAI({
          apiKey: openrouterKey,
          baseURL: "https://openrouter.ai/api/v1",
        });

        const response = await openrouterClient.chat.completions.create({
          model: "deepseek/deepseek-chat:free",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096,
        });

        const content = response.choices?.[0]?.message?.content;
        if (content) {
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = extractJSONArray(content);
          }
          const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
          const normalized = normalizeExtractedQuestions(questionsArray);

          if (normalized.length) {
            console.log(`✅ OpenRouter extracted ${normalized.length} questions successfully!`);
            return res.json({
              success: true,
              data: normalized,
              provider: "openrouter-free",
              modelUsed: "deepseek/deepseek-chat:free",
            });
          }
        }
      } catch (openrouterError) {
        console.error("⚠️ OpenRouter free tier failed:", openrouterError.message);
      }
    }

    // ========== 3) FALLBACK 2: DeepSeek (requires balance) ==========
    const deepseekApiKey = String(process.env.DEEPSEEK_API_KEY || "").trim();
    if (deepseekApiKey) {
      try {
        console.log("📄 Falling back to DeepSeek API...");
        const deepseekClientLocal = new OpenAI({
          apiKey: deepseekApiKey,
          baseURL: "https://api.deepseek.com/v1",
        });

        const response = await deepseekClientLocal.chat.completions.create({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096,
        });

        const content = response.choices?.[0]?.message?.content;
        if (content) {
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = extractJSONArray(content);
          }
          const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
          const normalized = normalizeExtractedQuestions(questionsArray);

          if (normalized.length) {
            console.log(`✅ DeepSeek extracted ${normalized.length} questions successfully!`);
            return res.json({
              success: true,
              data: normalized,
              provider: "deepseek",
              modelUsed: "deepseek-chat",
              usage: response.usage,
            });
          }
        }
      } catch (deepseekError) {
        console.error("⚠️ DeepSeek failed:", deepseekError.message);
      }
    }

    // ========== All providers failed ==========
    return res.status(502).json({
      success: false,
      message: "All AI providers failed. Please check your API keys or add funds.",
      tried: ["vercel-openai", "openrouter", "deepseek"],
    });
  } catch (error) {
    const upstream = error?.response?.data;
    console.error("API error:", JSON.stringify(upstream || error.message, null, 2));

    return res.status(502).json({
      success: false,
      message: upstream?.error?.message || error.message || "Failed generating questions from document.",
    });
  } finally {
    if (uploadedPath) {
      fs.promises.unlink(uploadedPath).catch(() => {});
    }
  }
};

function normalizeExtractedQuestions(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed.map((q, idx) => ({
    text: String(q?.text || q?.question || "").trim(),
    type: ["multiple_choice", "true_false", "essay", "short_text"].includes(String(q?.type || "")) ? String(q.type) : "short_text",
    options: Array.isArray(q?.options) ? q.options.map((x) => String(x || "").trim()).filter(Boolean) : [],
    correctAnswer: q?.correctAnswer || q?.correct_answer || "",
    marks: Number.isFinite(Number(q?.marks)) ? Number(q.marks) : 5,
    explanation: q?.explanation || "",
    order_number: idx + 1,
  }));
}

exports.extractQuestionsWithAi = async (req, res) => {
  try {
    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY is not configured." });
    }

    const examText = String(req.body?.examText || "").trim();
    if (!examText) {
      return res.status(400).json({ success: false, message: "examText is required." });
    }

    const requestedModel = String(req.body?.model || "").trim();
    const modelsToTry = requestedModel ? [requestedModel, ...EXAM_EXTRACTION_MODELS.filter((m) => m !== requestedModel)] : EXAM_EXTRACTION_MODELS;
    const prompt = `
Extract ALL questions from this exam text.

Return as a JSON array where each question has:
- "number": the question number
- "text": the full question text
- "marks": marks if specified (default 5)
- "type": "multiple_choice", "essay", or "true_false"
- "options": array of options for multiple choice (empty otherwise)

EXAM TEXT:
${examText}

Return ONLY valid JSON array, no markdown, no explanation.
`;

    let lastErrorMessage = "No model produced a valid response.";
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const geminiRes = await axios.post(
          endpoint,
          {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          },
          { timeout: 45000 }
        );

        const parts = geminiRes?.data?.candidates?.[0]?.content?.parts || [];
        const textPart = parts.find((p) => typeof p?.text === "string" && p.text.trim());
        const responseText = textPart?.text || "";
        const questions = extractJSONArray(responseText);

        if (questions.length > 0) {
          return res.json({ success: true, data: questions, modelUsed: model });
        }

        lastErrorMessage = "Model returned no parseable JSON array.";
      } catch (error) {
        lastErrorMessage = error?.response?.data?.error?.message || error.message || `Model ${model} failed`;
      }
    }

    return res.status(502).json({ success: false, message: lastErrorMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed extracting questions." });
  }
};

exports.listExams = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.template_id) where.template_id = req.query.template_id;

    const result = await Exam.findAndCountAll({
      where,
      include: examIncludes,
      distinct: true,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    return res.json({
      success: true,
      data: result.rows,
      page,
      limit,
      total: result.count,
      total_pages: Math.ceil(result.count / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id, { include: examIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExam = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const body = { ...req.body };
    const title = String(body.title || body.name || "").trim();
    if (!title) throw new Error("Exam name is required.");
    if (!body.template_id) throw new Error("Template is required.");
    if (!Number.isFinite(Number(body.duration_minutes)) || Number(body.duration_minutes) <= 0) {
      throw new Error("Duration minutes must be greater than zero.");
    }

    const template = await ExamTemplate.findByPk(body.template_id, { transaction: tx });
    if (!template) throw new Error("Selected template was not found.");

    const normalizedQuestions = Array.isArray(body.questions) ? body.questions.map((q, i) => normalizeQuestion(q, i)) : [];
    if (!normalizedQuestions.length) throw new Error("At least one exam question is required.");
    const status = body.status && EXAM_STATUS.has(String(body.status)) ? String(body.status) : "draft";

    const row = await Exam.create(
      {
        title,
        description: body.description || null,
        template_id: body.template_id,
        total_marks: Number.isFinite(Number(body.total_marks)) ? Number(body.total_marks) : 0,
        passing_marks: Number.isFinite(Number(body.passing_marks)) ? Number(body.passing_marks) : 0,
        duration_minutes: Number(body.duration_minutes),
        requires_webcam: Boolean(body.requires_webcam),
        prevent_tab_switch: body.prevent_tab_switch === undefined ? true : Boolean(body.prevent_tab_switch),
        allow_retake: Boolean(body.allow_retake),
        max_attempts: Math.max(1, Number(body.max_attempts) || 1),
        instructions: body.instructions || null,
        exam_layout_json: normalizeExamLayout(body.exam_layout_json),
        status,
        created_by: req.user?.id || body.created_by || null,
      },
      { transaction: tx }
    );
    await ExamQuestion.bulkCreate(
      normalizedQuestions.map((q) => ({ ...q, exam_id: row.id })),
      { transaction: tx }
    );
    await tx.commit();
    const created = await Exam.findByPk(row.id, { include: examIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    const allowed = [
      "title",
      "description",
      "template_id",
      "total_marks",
      "passing_marks",
      "duration_minutes",
      "requires_webcam",
      "prevent_tab_switch",
      "allow_retake",
      "max_attempts",
      "instructions",
      "exam_layout_json",
      "status",
      "created_by",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    if (patch.exam_layout_json !== undefined) {
      patch.exam_layout_json = normalizeExamLayout(patch.exam_layout_json);
    }
    await row.update(patch);
    if (Array.isArray(req.body.questions)) {
      const tx = await sequelize.transaction();
      try {
        const normalizedQuestions = req.body.questions.map((q, i) => normalizeQuestion(q, i));
        await ExamQuestion.destroy({ where: { exam_id: row.id }, transaction: tx });
        await ExamQuestion.bulkCreate(
          normalizedQuestions.map((q) => ({ ...q, exam_id: row.id })),
          { transaction: tx }
        );
        await tx.commit();
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }
    const updated = await Exam.findByPk(row.id, { include: examIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const row = await Exam.findByPk(req.params.id, { transaction: tx });
    if (!row) {
      await tx.rollback();
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // Delete exam-linked rows in FK-safe order.
    const questions = await ExamQuestion.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const questionIds = questions.map((q) => q.id);

    const attempts = await ExamAttempt.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const attemptIds = attempts.map((a) => a.id);

    const submissions = await ExamSubmission.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const submissionIds = submissions.map((s) => s.id);

    if (questionIds.length) {
      await ExamAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await StudentAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await TemporaryAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await ExamSessionLog.destroy({ where: { question_id: questionIds }, transaction: tx });
    }

    if (submissionIds.length) {
      await ExamAnswer.destroy({ where: { submission_id: submissionIds }, transaction: tx });
      await ExamSubmission.destroy({ where: { id: submissionIds }, transaction: tx });
    }

    if (attemptIds.length) {
      await StudentExamResult.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await StudentAnswer.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await TemporaryAnswer.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await ExamSessionLog.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await ExamAttempt.destroy({ where: { id: attemptIds }, transaction: tx });
    }

    await ExamSchedule.destroy({ where: { exam_id: row.id }, transaction: tx });
    await ExamQuestion.destroy({ where: { exam_id: row.id }, transaction: tx });
    await row.destroy({ transaction: tx });
    await tx.commit();
    return res.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.createExamSubmission = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, { include: [{ model: ExamQuestion, as: "questions" }] });
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });

    let submission = await ExamSubmission.findOne({
      where: { exam_id: exam.id, student_id: student.id, status: "draft" },
      include: [{ model: ExamAnswer, as: "answers" }],
    });
    if (!submission) {
      submission = await ExamSubmission.create({ exam_id: exam.id, student_id: student.id, status: "draft", started_at: new Date() });
    }
    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyExamSubmission = async (req, res) => {
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });
    const submission = await ExamSubmission.findOne({
      where: { exam_id: req.params.id, student_id: student.id },
      include: [
        { model: ExamAnswer, as: "answers", include: [{ model: ExamQuestion, as: "question" }] },
        { model: Exam, as: "exam", include: examIncludes },
      ],
      order: [[{ model: ExamAnswer, as: "answers" }, "created_at", "ASC"]],
    });
    return res.json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveSubmissionAnswers = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) throw new Error("Student profile not found for this user.");
    const submission = await ExamSubmission.findByPk(req.params.submissionId, { transaction: tx });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.student_id !== student.id) return res.status(403).json({ success: false, message: "You cannot edit this submission." });
    if (submission.status !== "draft") throw new Error("Submission already submitted.");

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    for (const item of answers) {
      if (!item?.question_id) continue;
      const payload = {
        answer_text: item.answer_text != null ? String(item.answer_text) : null,
        answer_json: item.answer_json !== undefined ? item.answer_json : null,
      };
      const existing = await ExamAnswer.findOne({
        where: { submission_id: submission.id, question_id: item.question_id },
        transaction: tx,
      });
      if (existing) await existing.update(payload, { transaction: tx });
      else await ExamAnswer.create({ submission_id: submission.id, question_id: item.question_id, ...payload }, { transaction: tx });
    }
    await tx.commit();
    const updated = await ExamSubmission.findByPk(submission.id, { include: [{ model: ExamAnswer, as: "answers" }] });
    return res.json({ success: true, data: updated });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.submitExamSubmission = async (req, res) => {
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });
    const submission = await ExamSubmission.findByPk(req.params.submissionId, {
      include: [{ model: Exam, as: "exam", include: [{ model: ExamQuestion, as: "questions" }] }, { model: ExamAnswer, as: "answers" }],
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.student_id !== student.id) return res.status(403).json({ success: false, message: "You cannot submit this submission." });
    if (submission.status === "submitted") return res.json({ success: true, data: submission });

    const requiredQuestions = (submission.exam?.questions || []).filter((q) => q.required);
    const answerMap = new Map((submission.answers || []).map((a) => [a.question_id, a]));
    for (const rq of requiredQuestions) {
      const ans = answerMap.get(rq.id);
      const hasText = Boolean(String(ans?.answer_text || "").trim());
      const hasJson = ans?.answer_json != null && (Array.isArray(ans.answer_json) ? ans.answer_json.length > 0 : true);
      if (!hasText && !hasJson) {
        return res.status(400).json({ success: false, message: `Required question not answered: ${rq.question_text}` });
      }
    }

    const startedAt = submission.started_at ? new Date(submission.started_at).getTime() : Date.now();
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const limitSeconds = Number(submission.exam?.duration_minutes || 0) * 60;
    if (limitSeconds > 0 && elapsed > limitSeconds) {
      return res.status(400).json({ success: false, message: "Exam time has elapsed." });
    }

    await submission.update({ status: "submitted", submitted_at: new Date(), time_spent_seconds: elapsed });
    const updated = await ExamSubmission.findByPk(submission.id, { include: [{ model: ExamAnswer, as: "answers" }] });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
