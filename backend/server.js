require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
    if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// create the Express application
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://ai-resume-analyzer-tau-bice.vercel.app",
      "https://ai-resume-analyzer-f7cijctf2-subhsis-padhy-2004s-projects.vercel.app",
    ],
  })
);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// post nnumber where the server will run
const PORT = 5000;

// home router
app.get("/", (req, res) => {
  res.send("AI resume Analyzer Backend is runing!");
});
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Connected Successfully!",
  });
});
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // Read the uploaded PDF
    const dataBuffer = fs.readFileSync(req.file.path);


    // Extract text from the PDF
    const data = await pdfParse(dataBuffer);

   const prompt = `
You are an expert ATS Resume Reviewer.

Analyze the resume and respond ONLY with valid JSON.

The JSON MUST follow exactly this format:

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": [],
  "jobRoles": []
}

Rules:

- score must be between 0 and 100.
- summary should be 3-4 sentences.
- strengths should contain at least 5 items.
- weaknesses should contain at least 5 items.
- missingSkills should contain technical skills missing from the resume.
- suggestions should contain practical improvements.
- jobRoles should recommend suitable job roles.

Do NOT return markdown.
Do NOT use \`\`\`json.
Return ONLY valid JSON.

Resume:

${data.text}
`;

    const result = await model.generateContent(prompt);
const response = await result.response;

let aiText = response.text();

// Remove ```json and ```
aiText = aiText.replace(/```json/g, "");
aiText = aiText.replace(/```/g, "");

// Convert string to JSON
const analysis = JSON.parse(aiText);

    console.log("===== AI RESPONSE =====");
    console.log(aiText);

    console.log("========== RESUME TEXT ==========");
    console.log(data.text);
    console.log("=================================");

 res.json({
  success: true,
  analysis: analysis
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error extracting PDF text",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`server is runing on http://localhost:${PORT}`);
});
