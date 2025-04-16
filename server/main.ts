import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// ESM path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Supabase initialization
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verify Supabase session
app.post("/api/verify-session",  (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required" });
  }

  try {
    const { data, error } = (async () => await supabase.auth.getUser(accessToken))();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    res.status(200).json({ user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Auth middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token is required" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }

    req.user = data.user; // user object
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user-specific data
app.get("/api/user-data", requireAuth, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Prompt → Python processor
app.post("/api/prompt", requireAuth, (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const pythonExecutable =
    process.platform === "win32"
      ? path.join(__dirname, "server", "venv", "Scripts", "python.exe")
      : path.join(__dirname, "server", "venv", "bin", "python3");

  const scriptPath = path.join(__dirname, "server", "processor.py");

  const pythonProcess = spawn(pythonExecutable, [scriptPath]);

  let dataString = "";

  pythonProcess.stdin.write(prompt + "\n");
  pythonProcess.stdin.end();

  pythonProcess.stdout.on("data", (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python script: ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python script failed" });
    }

    res.status(200).json({
      query: prompt,
      message: dataString.trim(),
    });
  });
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
