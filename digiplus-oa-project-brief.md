# AI-Powered Service Desk — Project Brief & Build Plan

## Context
This is a timed technical assessment (3.5–4 hours) for DigiPlus. Grading weight is **heavily on a working, coherent app** — functionality and AI usage matter far more than architectural sophistication. Build in strict phase order and never sacrifice a working core loop for an unfinished enhancement.

---

## Original Problem Statement (verbatim requirements)

Build a small application that uses AI to assist a support engineer in handling technical support issues submitted in natural language. The solution must allow a user to submit an issue, manage its lifecycle, and obtain useful AI-assisted information for investigation and resolution.

**Basic Requirements**
- Create and persist support incidents/issues
- View and manage existing incidents
- Auto-analyze an incident and provide meaningful assistance
- Maintain a small knowledge base or equivalent support information
- Use AI to connect incidents with relevant support information
- Record the outcome/resolution
- Include appropriate validation and error handling

**AI Requirement**: AI must be a meaningful part of the solution — not simulated with hard-coded rules. Model/provider, prompts, data flow, and implementation are open choices.

**Support Ticket Data Source**: https://huggingface.co/datasets/mindweave/help-desk-tickets (use a small sample to seed test incidents / knowledge base content)

**Tech Choices**: UI, architecture, stack, DB schema, API design are all unprescribed — make your own calls.

**Optional Enhancements** (only after core works): conversational AI, similar/duplicate incident detection, intelligent search, automatic categorization, analytics, authentication, notifications, testing, containerization, or anything else adding value.

**Submission**: source code + README with setup/run instructions, AI configuration, approach explanation, assumptions, and known limitations. **UI and code must include emojis.**

**Assessment Focus Areas**: Functionality (working, coherent solution) · AI (appropriate use, reasoning, reliability) · Engineering (design, code quality, maintainability) · Data (persistence, sensible handling) · UX (clarity, usability) · Problem solving (decisions, trade-offs, originality)

---

## Chosen Tech Stack (optimized for a 4-hour solo build)
- **React + Vite** for the frontend (separate from backend — two dev servers, or Vite proxy to Express)
- **Node.js + Express** backend for API routes
- **SQLite via Prisma** (fallback: JSON file store via lowdb if Prisma setup eats too much time) — satisfies persistence requirement without a DB server
- **OpenAI or Gemini API** for the AI layer
- **No vector DB** — knowledge base is small enough to context-stuff directly into LLM prompts (RAG-lite). Faster to build, easy to explain/defend in review.
- Run frontend and backend as two folders/processes in one repo (e.g. `/client`, `/server`) so a coding agent can work on both without confusion. Set Vite's dev server to proxy `/api` calls to Express so there's no CORS friction during development.

### Data Model
```
Incident {
  id, title, description, category, priority, status,
  aiSummary, aiSuggestedSteps, linkedKbArticleIds,
  resolution, createdAt, updatedAt
}

KBArticle {
  id, title, content, tags
}
```

---

## Folder Structure
```
digiplus-service-desk/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── IncidentList.jsx
│   │   │   ├── IncidentForm.jsx
│   │   │   ├── IncidentDetail.jsx
│   │   │   ├── AiAnalysisPanel.jsx
│   │   │   └── KbSuggestions.jsx
│   │   ├── api/
│   │   │   └── client.js          # fetch wrappers for /api/incidents, /api/kb
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js             # includes proxy: '/api' -> http://localhost:3001
│   └── package.json
│
├── server/                        # Node + Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── incidents.js       # CRUD + analyze endpoint
│   │   │   └── kb.js              # KB CRUD
│   │   ├── services/
│   │   │   ├── aiService.js       # LLM calls: analyze incident, match KB, similar incidents
│   │   │   └── db.js              # Prisma client / lowdb instance
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── seed.js                # pulls sample HF tickets, seeds incidents + KB articles
│   │   └── index.js                # Express app entry
│   ├── .env                        # AI API key, PORT, DATABASE_URL
│   └── package.json
│
└── README.md
```

**Phase 0 setup commands (for the coding agent to run in order):**
```bash
# root
mkdir digiplus-service-desk && cd digiplus-service-desk

# client
npm create vite@latest client -- --template react
cd client && npm install && cd ..

# server
mkdir server && cd server
npm init -y
npm install express cors dotenv @prisma/client
npm install -D prisma nodemon
npx prisma init --datasource-provider sqlite
cd ..
```
- Set `client/vite.config.js` server.proxy `'/api'` → `http://localhost:3001`
- Set `server/.env` with `PORT=3001`, `DATABASE_URL="file:./dev.db"`, and the AI provider key (`OPENAI_API_KEY` or `GEMINI_API_KEY`)
- Write `Incident` and `KBArticle` models (see Data Model above) into `schema.prisma`, run `npx prisma migrate dev --name init`
- Write `server/src/seed.js` to insert 5–8 hand-written KB articles and ~15–20 sample incidents (pulled/adapted from the HF dataset) into the DB, then run it
- In `aiService.js`, write one throwaway function that calls the LLM API and logs the response — confirm this works before moving to Phase 1

---

## Phased Build Plan

### Phase 0 — Setup (0:00–0:20)
- Scaffold Next.js app, install Prisma + SQLite (or lowdb)
- Get AI API key working with one throwaway test call before building anything else
- Define the schema above
- Seed script: pull ~15–20 sample rows from the HuggingFace help-desk-tickets dataset for test incidents; hand-write 5–8 short KB articles covering common issue types in that sample

**✅ Exit criteria:** `client` and `server` both run locally with one command each; a test API call to the LLM returns a real response in the terminal; the SQLite/JSON store has seed incidents and KB articles in it that you can query directly (via a script or DB viewer). Do not move on until the AI key is confirmed working — discovering it's broken in Phase 2 wastes your buffer.

### Phase 1 — Core CRUD (no AI yet) (0:20–1:20)
**This is the floor of the grade. Must be bulletproof before touching AI.**
- API routes: create incident, list incidents, get incident by id, update status/resolution
- UI: submission form, list/table view of incidents, detail view
- Persist to disk and confirm data survives a refresh

**✅ Exit criteria:** you can submit a new incident through the UI, refresh the browser, and still see it in the list. You can open an incident, change its status, and that change persists after refresh too. No AI, no styling polish needed yet — this is purely "does the data loop work end to end." If this isn't rock solid, stop and fix it before Phase 2.

### Phase 2 — AI auto-analysis (1:20–2:20)
**This is the core differentiator — don't rush it.**
- On incident creation (or via an "Analyze" button), call the LLM with the incident text
- Prompt it to return structured JSON: `category`, `priority`, `summary`, `suggestedSteps`
- Persist this output on the incident record (don't recompute on every page view)
- Wrap the call in try/catch with a graceful fallback state (e.g. "AI analysis unavailable") — error handling is explicitly graded

**✅ Exit criteria:** submitting a new incident (or clicking "Analyze") reliably produces a category, priority, summary, and suggested steps on the incident detail view, and these persist to the DB (visible again after refresh). Killing the AI key or forcing an API error shows the fallback state instead of crashing the page.

### Phase 3 — Connect incidents to knowledge base (2:20–2:55)
- Pass the incident text + all KB article titles/summaries into an LLM call (same call as Phase 2 or a follow-up)
- Ask the model to return the most relevant KB article id(s) with a brief reason
- Render as "Suggested Knowledge Base Articles" on the incident detail page
- If time allows: reuse the same pattern for similar/duplicate incident detection (pass a few recent incidents, ask which are similar) — cheap to add since the pattern already exists

**✅ Exit criteria:** at least 2–3 of your seeded incidents visibly link to a sensible KB article on their detail page (not a random/irrelevant one — spot-check a couple manually). This is the "AI connects incidents to support information" requirement — treat it as mandatory, not optional, even though duplicate detection past this point is a bonus.

### Phase 4 — Resolution + validation + polish (2:55–3:25)
- Resolution field + "mark resolved" action
- Form validation (required fields, clear error messages)
- API-level error handling (bad ids, empty bodies, AI failures)
- Emojis throughout UI labels/states (🎫 new ticket, ✅ resolved, 🔍 analyzing, ⚠️ error) — required by the PS, don't forget

**✅ Exit criteria:** submitting an empty/invalid form shows a clear error instead of failing silently or crashing; an incident can be marked resolved with a written resolution that persists; a full click-through (create → analyze → view KB suggestion → resolve) works without console errors; emojis are visible somewhere in the running UI.

### Phase 5 — README + submission (3:25–end)
README must include:
- Setup/run instructions
- AI configuration (model/provider used, where prompts live)
- Short explanation of approach
- Assumptions made
- Known limitations
- Clean run-through from a fresh clone if time allows

**✅ Exit criteria:** a fresh clone of the repo, following only your README, gets both client and server running and the app functional — no undocumented steps in your head. This is what a reviewer will actually do.

---

## Non-negotiable priority order if time runs short
If time is tight, cut scope from Phase 3 downward — **never from Phase 1.** A working CRUD app with a simple AI categorization call beats a half-wired app with an ambitious RAG pipeline that doesn't run.

---

## Parallel Frontend Design Prompt
Use this in a separate session/agent (e.g. a design-focused tool) to get the React+Vite UI built or styled while the backend/AI work above happens in parallel. Paste as-is:

> Design and build a React + Vite frontend for an AI-powered support service desk app. It needs three main views: (1) an incident list/dashboard showing all support tickets with title, category, priority, and status at a glance, with a way to create a new incident; (2) a new incident form with fields for title and description, clear validation, and a loading state while AI analysis runs; (3) an incident detail view showing the full incident, an "AI Analysis" section (category, priority, summary, suggested next steps), a "Suggested Knowledge Base Articles" section, and a resolution field with a "mark resolved" action.
>
> Style it like a clean, modern internal support tool — think Linear or Notion, not a generic admin template. Use a light color palette with one confident accent color, clear status badges (open/in-progress/resolved) with distinct colors, and generous whitespace. Include emojis naturally in labels and states (🎫 for tickets, 🔍 for analyzing, ✅ for resolved, ⚠️ for errors) without making it feel juvenile. Assume the backend exposes REST endpoints under `/api/incidents` and `/api/kb` — build the components to consume that shape, but stub/mock the data for now so the UI is fully clickable on its own. Prioritize clarity and usability over visual flourish — this is a support tool a stressed engineer needs to use fast.
