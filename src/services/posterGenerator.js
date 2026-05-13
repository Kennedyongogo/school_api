const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

class PosterGenerator {
  constructor() {
    this.apiUrl = process.env.POSTER_IMAGE_API_URL || "https://image.pollinations.ai/prompt";
  }

  mapNewsCategory(category) {
    const c = String(category || "general").toLowerCase();
    if (c === "achievement") return "achievement";
    if (c === "holiday") return "holiday";
    if (c === "event") return "event";
    return "news";
  }

  buildPrompt(description, posterCategory, colorPalette) {
    const colorHints = this.getColorHints(colorPalette);
    const categoryHints = this.getCategoryHints(posterCategory);

    const tone =
      posterCategory === "event"
        ? "festive and energetic"
        : "clean and authoritative";

    return `Create a professional ${categoryHints.label} poster for Elimu Plus:

EVENT/NEWS: ${description}

DESIGN REQUIREMENTS:
- Style: Modern, professional, eye-catching
- Color scheme: ${colorHints.colorScheme}
- Primary colors: ${colorHints.colors.join(", ")}
- Theme: ${categoryHints.theme}
- Mood: ${categoryHints.mood}

FORMAT: High quality, ${tone} design, leave space for text overlay.

SCHOOL: Elimu Plus - Excellence in Education`;
  }

  getColorHints(palette) {
    const palettes = {
      festive: {
        colors: ["#FF6B35", "#F7931E", "#FFD700", "#2EC4B6"],
        colorScheme: "vibrant, warm, energetic, celebration colors",
      },
      academic: {
        colors: ["#1A365D", "#2B6CB0", "#E2E8F0", "#C53030"],
        colorScheme: "professional, navy blue, gold accents, formal",
      },
      sports: {
        colors: ["#E53E3E", "#DD6B20", "#38A169", "#D69E2E"],
        colorScheme: "bold, dynamic, energetic, action-oriented",
      },
      news: {
        colors: ["#2D3748", "#4A5568", "#E2E8F0", "#3182CE"],
        colorScheme: "clean, serious, newspaper style, professional",
      },
      spring: {
        colors: ["#F687B3", "#9AE6B4", "#F6E05E", "#81E6D9"],
        colorScheme: "pastel, fresh, blooming, cheerful",
      },
    };
    const key = palette && palettes[palette] ? palette : "academic";
    return palettes[key];
  }

  getCategoryHints(category) {
    const hints = {
      event: {
        label: "school event",
        theme: "festive, celebration, community gathering",
        mood: "energetic, welcoming, exciting",
      },
      news: {
        label: "school news",
        theme: "announcement, important update, school communication",
        mood: "professional, trustworthy, clear",
      },
      achievement: {
        label: "achievement",
        theme: "celebration, success, recognition",
        mood: "proud, inspiring, motivational",
      },
      holiday: {
        label: "holiday",
        theme: "festive, seasonal celebration",
        mood: "joyful, warm, family-oriented",
      },
    };
    return hints[category] || hints.news;
  }

  async generatePoster(description, posterCategory, colorPaletteKey, kind = "news") {
    const enhancedPrompt = this.buildPrompt(description, posterCategory, colorPaletteKey);
    const requestUrl = `${this.apiUrl}/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&model=flux`;

    const response = await axios.get(requestUrl, {
      responseType: "arraybuffer",
      timeout: Number(process.env.POSTER_GENERATION_TIMEOUT_MS) || 120000,
    });

    const subfolder = kind === "event" ? "events" : "news";
    const uploadRoot = path.join(__dirname, "..", "..", "uploads", "posters", subfolder);
    await fs.mkdir(uploadRoot, { recursive: true });
    const filename = `${crypto.randomUUID()}.png`;
    const filepath = path.join(uploadRoot, filename);
    await fs.writeFile(filepath, Buffer.from(response.data));

    const imageUrl = `/uploads/posters/${subfolder}/${filename}`;
    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      metadata: {
        model: "flux",
        size: "1024x1024",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

module.exports = new PosterGenerator();
