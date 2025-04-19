// server/index.js
import express from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/ai-analysis", async (req, res) => {
  try {
    const { prompt, type, userId } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Missing Authorization header");

    // Verify user
    const { data: user, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user.user || user.user.id !== userId) {
      throw new Error("Invalid or unauthorized user");
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("medical_history, allergies, current_medication")
      .eq("id", userId)
      .single();
    if (profileError) console.error("Profile fetch error:", profileError);

    // Build enhanced prompt
    const enhancedPrompt = `
      ${prompt}
      ${
        profile
          ? `
            Patient Context:
            - Medical History: ${profile.medical_history || "None"}
            - Allergies: ${profile.allergies || "None"}
            - Current Medication: ${profile.current_medication || "None"}`
          : ""
      }
    `.trim();

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            type === "chat"
              ? "You are a helpful AI doctor assistant specializing in general health inquiries. Provide clear, concise, and professional medical guidance. Use patient context if provided."
              : "You are a helpful AI assistant specializing in providing medical and health-related guidance.",
        },
        { role: "user", content: enhancedPrompt },
      ],
    });

    const generatedText =
      response.choices[0].message.content || "No response available.";

    res.json({ generatedText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(8000, () => console.log("Server running on port 8000"));
