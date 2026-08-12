const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const machineGuideEndpoint = `  app.post("/api/ai/machine-guide", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            }
          },
          \`Analyze this image of a gym machine. Identify the machine and provide step-by-step instructions on how to use it safely and effectively. Provide the instructions in both English and Hinglish (Hindi written in English alphabet). Keep it concise, engaging, and easy to read. Use bullet points.\`
        ]
      });
      res.json({ instructions: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });`;

code = code.replace(
  'app.post("/api/ai/form-check", async (req, res) => {',
  machineGuideEndpoint + '\n\n  app.post("/api/ai/form-check", async (req, res) => {'
);

fs.writeFileSync('server.ts', code);
