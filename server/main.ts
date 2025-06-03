import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { Document } from "@langchain/core/documents";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const faissIndexPath = path.resolve("server/faiss_index");
const dataPath = path.resolve("server/data.json");

const embeddings = new MistralAIEmbeddings();

interface RecordType {
  text: string;
  [key: string]: unknown;
}

function documentify(record: RecordType): Document {
  const { text, ...metadata } = record;
  return new Document({
    pageContent: text.trim(),
    metadata,
  });
}

async function setupChain() {
  let vectorStore: FaissStore;

  if (fs.existsSync(faissIndexPath)) {
    vectorStore = await FaissStore.load(faissIndexPath, embeddings);
  } else {
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data: RecordType[] = JSON.parse(rawData);
    const records = data.filter((record) => record.text);
    const documents = records.map(documentify);

    if (!documents.length) {
      throw new Error("No documents found with valid content.");
    }

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await textSplitter.splitDocuments(documents);

    if (!docs.length) {
      throw new Error("No text chunks created.");
    }

    vectorStore = await FaissStore.fromDocuments(docs, embeddings);
    await vectorStore.save(faissIndexPath);
  }

  const retriever = vectorStore.asRetriever();

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a helpful and informative assistant dedicated to answering questions accurately and naturally.

Your process:

1.  Understand the User's Intent: Carefully analyze the user's question to grasp their specific need.
2.  Consult Available Information: Access the relevant information (which may have been supplied to you internally in the following format).
3.  Formulate a Direct Answer: If the available information directly and comprehensively answers the question, construct a clear and concise response. Do not indicate that you are drawing from external data; simply provide the answer as if it's your inherent knowledge.
4.  Handle Conversational Queries: For common greetings or conversational remarks (e.g., 'hello', 'how are you?'), respond appropriately and politely, engaging naturally.
5.  Utilize General Knowledge: If the available information does not address the question, or if it's a general knowledge query, draw upon your extensive understanding to formulate a helpful and accurate answer.
6.  Address Unanswerable Questions: If, after consulting all available resources, you cannot find a suitable answer, say exactly "I don't know.".

Key Principles:

* Clarity and Conciseness: Provide answers that are easy to understand and to the point.
* Natural Language: Respond in a way that feels like a genuine conversation, avoiding robotic or overly formal phrasing.
* Seamless Integration: Present information as if it's part of your core knowledge base, without referring to the source of the information.

---

Context: {context}

Question: {input}`
  );

  const combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const chain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  return chain;
}

async function main() {
  const chain = await setupChain();

  const app = express();
  app.use(bodyParser.json());
app.use((_, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://waypoint-ia.onrender.com; connect-src 'self' https://vjbdrsuksueppbxxebzp.supabase.co;"
  );
  next();
});

  app.use(express.static(path.resolve(__dirname, "../app/dist")));

  // Add this endpoint to match the frontend proxy
  app.post("/api/prompt", (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).send("Missing prompt in request body.");
      return;
    }
    (async () => {
      try {
        res.setHeader("Transfer-Encoding", "chunked");

        // If the chain supports streaming, use it. Otherwise, fallback to normal.
        if (typeof chain.stream === "function") {
          const stream = await chain.stream({ input: prompt });
          for await (const chunk of stream) {
            const text = chunk?.answer || "";
            res.write(text);
          }
          res.end();
        } else {
          // Fallback: not streaming
          const answer = await chain.invoke({ input: prompt });
          res.send(answer);
        }
      } catch (err) {
        console.error("Error during question processing:", err);
        if (!res.headersSent) {
          res.status(500).send("Internal server error.");
        } else {
          res.end();
        }
      }
    })();
  });

  app.get(/(.*)/, (_, res) => {
    res.sendFile(path.join(__dirname, "..", "app", "dist", "index.html"));
  });

  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Error:", err);
});
