import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { Document } from "@langchain/core/documents";
import { CharacterTextSplitter } from "@langchain/textsplitters";
// Using a simple in-memory vector store implementation
import { VectorStore } from "@langchain/core/vectorstores";
import { MistralAIEmbeddings } from "@langchain/mistralai";

import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logFilePath = path.resolve("server/server.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
function writeLogLine(line: string) {
  try {
    logStream.write(line + "\n");
  } catch {
    // ignore
  }
}
const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);
console.log = (...args: unknown[]) => {
  const line = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  writeLogLine(line);
  originalLog(...args);
};
console.error = (...args: unknown[]) => {
  const line = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  writeLogLine(line);
  originalError(...args);
};
console.warn = (...args: unknown[]) => {
  const line = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  writeLogLine(line);
  originalWarn(...args);
};

console.log("Loading environment variables...");
dotenv.config();

// Validate required environment variables
console.log("Validating API keys...");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("WARN: GOOGLE_API_KEY environment variable is not set.");
  console.error("/api/prompt will return 500 until GOOGLE_API_KEY is configured.");
} else {
  console.log("✓ GOOGLE_API_KEY found");
}

if (!MISTRAL_API_KEY) {
  console.error("WARN: MISTRAL_API_KEY environment variable is not set.");
  console.error("/api/prompt will return 500 until MISTRAL_API_KEY is configured.");
} else {
  console.log("✓ MISTRAL_API_KEY found");
}

const dataPath = path.resolve("server/data.json");

const ai = GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: GOOGLE_API_KEY }) : null;
if (ai) {
  console.log("✓ GoogleGenAI client initialized");
}

console.log("Initializing Mistral embeddings...");
const embeddings = MISTRAL_API_KEY
  ? new MistralAIEmbeddings({
    apiKey: MISTRAL_API_KEY,
  })
  : null;
if (embeddings) {
  console.log("✓ Mistral embeddings initialized");
}

interface RecordType {
  text: string;
  [key: string]: unknown;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("429") ||
    message.toLowerCase().includes("too many requests") ||
    (err as any)?.status === 429 ||
    (err as any)?.response?.status === 429
  );
}

function summarizeProviderError(err: unknown): string {
  const anyErr = err as any;
  const status = anyErr?.status ?? anyErr?.response?.status;
  const name = err instanceof Error ? err.name : typeof err;
  const message = err instanceof Error ? err.message : String(err);

  const maybeBody =
    anyErr?.response?.data ??
    anyErr?.response?.body ??
    anyErr?.body ??
    anyErr?.data ??
    anyErr?.error;

  let bodyText = "";
  try {
    if (typeof maybeBody === "string") bodyText = maybeBody;
    else if (maybeBody != null) bodyText = JSON.stringify(maybeBody);
  } catch {
    // ignore
  }

  const parts = [
    `name=${name}`,
    status != null ? `status=${status}` : null,
    message ? `message=${message}` : null,
    bodyText ? `body=${bodyText.slice(0, 1000)}` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

async function withRetries<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === maxRetries) throw err;
      const backoffMs = Math.min(8000, 500 * Math.pow(2, attempt));
      console.error(
        `WARN: Gemini rate limited (429). Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await sleep(backoffMs);
      attempt += 1;
    }
  }
  throw lastErr;
}

type RateLimitBucket = {
  windowStart: number;
  count: number;
};

const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX_REQUESTS = 6;
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function documentify(record: RecordType): Document {
  const { text, ...metadata } = record;
  return new Document({
    pageContent: text.trim(),
    metadata,
  });
}

async function setupChain() {
  console.log("Setting up chain...");

  if (!embeddings) {
    throw new Error(
      "Missing required embeddings configuration. Please set MISTRAL_API_KEY."
    );
  }

  console.log("Loading data from data.json...");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const data: RecordType[] = JSON.parse(rawData);
  const records = data.filter((record) => record.text);
  const documents = records.map(documentify);

  if (!documents.length) {
    throw new Error("No documents found with valid content.");
  }

  console.log(`Processing ${documents.length} documents...`);
  const textSplitter = new CharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await textSplitter.splitDocuments(documents);

  if (!docs.length) {
    throw new Error("No text chunks created.");
  }

  console.log(`Creating in-memory vector store from ${docs.length} text chunks...`);
  // Create embeddings for all documents
  const texts = docs.map((doc) => doc.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // Simple in-memory vector store implementation
  class SimpleMemoryVectorStore extends VectorStore {
    private vectors: number[][];
    private documents: Document[];

    _vectorstoreType(): string {
      return "simple_memory";
    }

    constructor(embeddings: MistralAIEmbeddings, vectors: number[][], documents: Document[]) {
      super(embeddings, {});
      this.vectors = vectors;
      this.documents = documents;
    }

    async similaritySearchVectorWithScore(
      query: number[],
      k: number = 4
    ): Promise<[Document, number][]> {
      const similarities = this.vectors.map((vector, idx) => {
        // Cosine similarity
        const dotProduct = vector.reduce((sum, val, i) => sum + val * query[i], 0);
        const magnitudeA = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(query.reduce((sum, val) => sum + val * val, 0));
        const similarity = dotProduct / (magnitudeA * magnitudeB);
        return [this.documents[idx], similarity] as [Document, number];
      });

      similarities.sort((a, b) => b[1] - a[1]);
      return similarities.slice(0, k);
    }

    async addDocuments(_documents: Document[]): Promise<string[]> {
      throw new Error("Not implemented");
    }

    async addVectors(_vectors: number[][], _documents: Document[]): Promise<string[]> {
      throw new Error("Not implemented");
    }
  }

  const vectorStore = new SimpleMemoryVectorStore(embeddings, vectors, docs);
  console.log("✓ Vector store created");

  console.log("Creating retriever...");
  const retriever = vectorStore.asRetriever();

  console.log("Creating RAG answer function using GoogleGenAI (gemini-3-flash-preview)...");
  const answer = async (input: string): Promise<string> => {
    if (!ai) {
      throw new Error("GoogleGenAI client is not initialized.");
    }

    const docs = await retriever.invoke(input);
    const context = docs.map((doc) => doc.pageContent).join("\n\n");

    const promptTemplate = `
You are Birdie, a helpful assistant for Innovation Academy.
Use the following context to answer the user's question.
If you don't know the answer, say "I looked through the IA data but couldn't find anything relevant to that question yet."
Keep your answer concise and helpful.

Context:
${context}

Question:
${input}

Answer:`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: promptTemplate }] }],
    });

    const text = response.text;
    if (!text) {
      return "I'm sorry, I couldn't generate a response at this time.";
    }

    return text;
  };
  console.log("✓ RAG answer function created");

  return answer;
}

async function main() {
  let chain: ((input: string) => Promise<string>) | null = null;
  try {
    console.log("Initializing RAG chain...");
    chain = await setupChain();
    console.log("RAG chain initialized successfully.");
  } catch (err) {
    console.error("ERROR: Failed to initialize RAG chain:");
    console.error(err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      if (err.stack) {
        console.error("Stack trace:", err.stack);
      }
    }
    console.error("\nPlease check:");
    console.error("1. API keys are valid and set correctly");
    console.error("2. Vector store index exists or data.json is accessible");
    console.error("3. All required dependencies are installed");
    chain = null;
  }

  const app = express();
  app.use(bodyParser.json());
  app.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use((req, res, next) => {
    if (req.method !== "POST" || req.path !== "/api/prompt") {
      next();
      return;
    }

    const ipHeader = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim();
    const ip = ipHeader || req.ip || "unknown";
    const now = Date.now();
    const existing = rateLimitBuckets.get(ip);

    if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitBuckets.set(ip, { windowStart: now, count: 1 });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({
        error:
          "Too many requests. Please wait a moment and try again.",
      });
      return;
    }

    next();
  });
  app.use((_, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://waypoint-ia.onrender.com; connect-src 'self' https://vjbdrsuksueppbxxebzp.supabase.co http://localhost:* http://127.0.0.1:*;"
    );
    next();
  });

  app.use(express.static(path.resolve(__dirname, "../app/dist")));

  // Add this endpoint to match the frontend proxy
  app.post("/api/prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt in request body." });
      return;
    }

    if (!chain) {
      console.error("ERROR: Chain not initialized when /api/prompt was called");
      res.status(500).json({
        error:
          "Prompting is not configured on the server. Set GOOGLE_API_KEY and MISTRAL_API_KEY and restart the server.",
      });
      return;
    }

    try {
      console.log(`INFO: /api/prompt received (chars=${String(prompt).length})`);
      const answer = await withRetries(() => chain(prompt), 3);
      const text = typeof answer === "string" ? answer : (answer as any)?.answer || String(answer ?? "");
      res.status(200).json({ answer: text });
    } catch (err) {
      console.error("Error during question processing:");
      console.error("Error type:", err instanceof Error ? err.constructor.name : typeof err);
      console.error("Error message:", err instanceof Error ? err.message : String(err));
      if (err instanceof Error && err.stack) {
        console.error("Stack trace:", err.stack);
      }
      console.error("Provider error details:", summarizeProviderError(err));

      const providerTag = (() => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("mistral")) return "MISTRAL";
        if (msg.toLowerCase().includes("gemini") || msg.toLowerCase().includes("google")) return "GEMINI";
        return "PROVIDER";
      })();

      if (isRateLimitError(err)) {
        res.status(429).json({
          error:
            `[${providerTag}] Gemini is rate limiting this API key right now (429). Please wait and try again, or switch to a different key/model.`,
        });
        return;
      }

      const errorMessage =
        err instanceof Error && err.message.includes("API")
          ? `[${providerTag}] API authentication error. Please check API key configuration.`
          : "An error occurred while processing your request. Please try again.";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get(/(.*)/, (_, res) => {
    res.sendFile(path.join(__dirname, "..", "app", "dist", "index.html"));
  });

  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

console.log("Starting server...");
main().catch((err) => {
  console.error("Fatal error in main():", err);
  if (err instanceof Error) {
    console.error("Error message:", err.message);
    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }
  }
  process.exit(1);
});
