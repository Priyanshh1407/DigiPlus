# AI-Powered SupportDesk

A modern, AI-enhanced internal support ticketing system built with React, Node.js, Express, SQLite, and the Gemini API.

This application was designed to meet the requirements of the DigiPlus IT OA, featuring a complete end-to-end incident management lifecycle enhanced by autonomous AI analysis and Knowledge Base (KB) matching.

## Features

- **Core CRUD & Deletion**: Create, view, manage, resolve, and delete support incidents.
- **Global User Context & Switching**: Seamlessly switch between different mock users (e.g., Hardware Specialist, Network Admin) via a global context provider. Avatars and names update instantly across the app.
- **AI Auto-Analysis**: Automatically categorizes, prioritizes, summarizes, and extracts troubleshooting steps from incoming incidents using `gemini-3.5-flash-lite`.
- **AI Auto-Routing**: Dynamically assigns tickets to specific agents based on the AI-determined category.
- **AI Duplicate Detection**: Proactively cross-references new incoming tickets against recent active tickets to flag possible duplicates before they clutter the queue.
- **AI Knowledge Base Matching**: Cross-references every incoming incident against a local database of KB articles, attaching the most relevant solutions to the ticket.
- **Vague Incident Handling**: If an incident is categorized as "Other", the system prompts the user for clarification, which automatically triggers a secondary AI re-analysis.
- **Advanced Filtering & Search**: Client-side filtering by active user, status, and robust text search across incident properties.
- **Polished UI**: Modern, responsive design system using Tailwind CSS, featuring custom gradients, premium glassmorphism, micro-animations, global custom scrollbars, abstract generated avatars (DiceBear), and emoji-enhanced states.

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- A Gemini API Key (`GEMINI_API_KEY`)

### 1. Clone & Install
Open two terminal windows (one for the frontend, one for the backend).

**Backend Setup:**
```bash
cd server
npm install
```

**Frontend Setup:**
```bash
cd client
npm install
```

### 2. Environment Configuration
In the `server/` directory, create a `.env` file and add your Gemini API key:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Database Initialization & Seeding
In the `server/` directory, run the following commands to initialize the SQLite database and seed it with test KBs and Incidents:
```bash
npx prisma db push
node src/seed.js
```

### 4. Run the Application
Start the backend server (runs on `localhost:3001`):
```bash
cd server
npm run dev
```

Start the frontend Vite dev server (runs on `localhost:5173` and proxies API requests to `3001`):
```bash
cd client
npm run dev
```

Navigate to **http://localhost:5173** in your browser!

---

## 🧠 AI Configuration

- **Provider & Model**: Google Gemini (`gemini-3.5-flash-lite`) via the official `@google/genai` SDK.
- **Why Flash Lite?**: Selected for its exceptional speed and low latency, which is crucial for the "Live Analysis" preview in the UI, while remaining highly capable of structured JSON extraction.
- **Prompt Locations**: All AI logic is isolated in `server/src/services/aiService.js`.
- **Structured Outputs**: We utilize `responseMimeType: "application/json"` to strictly enforce the output schemas, guaranteeing reliable parsing for the UI.

## 📐 Approach & Architecture

- **Stack**: React (Vite) + Node (Express) + Prisma (SQLite).
- **Architecture**: A decoupled client/server architecture. The frontend uses a proxy to avoid CORS issues during local development. The backend follows a standard MVC pattern (`routes` -> `controllers` -> `services`).
- **Data Persistence**: SQLite was chosen for zero-config persistence that survives restarts.
- **AI Flow**: The AI sits in the backend to ensure data integrity and hide the API key. When a ticket is created, the controller halts to run the incident through Gemini for categorization, runs duplicate detection, and runs a secondary AI pass to match the text against all KB articles in the database. 

## 📝 Assumptions Made

1. **KB Size**: It is assumed that the Knowledge Base is relatively small (hundreds, not thousands of articles). Because of this, we pass the entire KB context directly into the Gemini prompt (Context-Stuffing / RAG-lite) rather than deploying a heavy Vector DB (like Pinecone) for semantic search. This ensures a fast, simple build without over-engineering.
2. **AI Reliability**: We assume the AI might occasionally fail or rate-limit. Fallback dummy data is provided in `aiService.js` `catch` blocks to ensure the application never crashes if the LLM drops a request.

## ⚠️ Known Limitations

- **Scalability of KB Matching**: As the KB grows past the token limit of the LLM context window, the current "stuffing" approach will fail. A future iteration would require a vector database to perform semantic similarity searches before sending a smaller chunk of top-k results to the LLM.
- **Authentication**: There is no hard authentication. A global React context provider simulates "User Switching" to demonstrate role-based behavior.
