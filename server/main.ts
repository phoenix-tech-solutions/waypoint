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

dotenv.config();
console.log("MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY);

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
  "You are a helpful and informative assistant. Your primary goal is to answer the user's question accurately. First, critically evaluate the provided context. If the context directly answers the question, respond clearly and concisely *without* mentioning that you used external information. If the question is a common greeting or conversational query (e.g., 'hello', 'how are you?'), respond appropriately and politely. If the context is not relevant to the question, or if it's a general knowledge question, use your own comprehensive knowledge to formulate an answer. Only if you cannot find a suitable answer from the context or your own knowledge, politely inform the user that you are unable to answer the question at this time. Context:\n\n{context}\n\nQuestion: {input}",
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
      "default-src 'none'; img-src 'self' https://waypoint-ia.onrender.com;",
    );
    next();
  });

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

  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Error:", err);
});
