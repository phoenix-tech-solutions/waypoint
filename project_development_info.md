# Waypoint: Project Development Information

## Project Background & Vision
**Waypoint** is a project developed under the non-profit **Phoenix Tech Solutions**. Its primary goal is to mitigate the confusions faced by students, parents, and teachers regarding the ongoing events, rules, and general information of the magnet school **FCS Innovation Academy**. 

Initially built as a first prototype, the project has gained traction and is currently in a collaborative phase with school administrators and the Fulton County school district to deploy this schoolwide AI chatbot and make it a reality for the entire ecosystem.

## Core Features & Capabilities
1. **Smart Chat Interface:** A real-time, responsive chat system that answers user queries with context-aware information.
2. **RAG-Powered Intelligence:** Uses Retrieval-Augmented Generation to parse school documents, perform semantic search, and provide accurate, concise answers.
3. **Staff & Club Directory:** Allows users to quickly look up teachers, staff, or clubs.
4. **Timeline View:** Visualizes upcoming events and milestones dynamically.
5. **User Accounts:** Personalized user experience through secure account management (built with Supabase).

## Technical Architecture & Stack
The project is built as a full-stack JavaScript/TypeScript application, utilizing modern web frameworks and AI tools.

### Frontend
- **Framework:** React 19 and React Router for navigation.
- **Build Tool:** Vite.
- **Styling:** TailwindCSS 4, enhanced with Framer Motion for animations and `tw-animate-css`.
- **UI Components:** Utilizes Radix UI primitives and Lucide React for iconography.

### Backend
- **Environment:** Node.js server using Express.
- **Language:** TypeScript (run via `tsx`).
- **Database/Auth:** Supabase.
- **Rate Limiting:** Custom IP-based request bucket implementation to prevent LLM API spam.

### AI & RAG Pipeline
The intelligence of Waypoint is powered by a custom RAG implementation:
- **LLM:** Google's Gemini Models (specifically `gemini-3-flash-preview` via `@google/genai`) serve as the generative brain.
- **Embeddings:** Mistral AI (via `@langchain/mistralai`) is used to convert document chunks into vector embeddings.
- **Vector Store:** A custom in-memory vector store performing cosine similarity search (`SimpleMemoryVectorStore` extending Langchain's `VectorStore`).
- **Data Ingestion:** Reads structured data from a local `data.json`, splits it using Langchain's `CharacterTextSplitter`, embeds it, and serves it to the Gemini model for contextually grounded responses.

## Current Project Status
- **Frontend:** Core interfaces (Chat, Sidebar, Navbar) and accounts are implemented. Settings pages are in progress.
- **Backend:** Data ingestion, retrieval mechanism, and answer generation are fully functioning. Query fine-tuning is currently being refined.
- **Deployment:** Running successfully in local development with staging server rollout in progress, leading up to a production rollout.
