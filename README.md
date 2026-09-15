# EvalMentor AI

<div align="center">

![EvalMentor AI Banner](docs/screenshots/dashboard.png)

### Production-Grade AI Interview Preparation & Evaluation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Groq AI](https://img.shields.io/badge/Groq_Cloud-openai%2Fgpt--oss--120b-F55036?style=flat-square)](https://groq.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://evalmentor-ai.vercel.app)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://evalmentor-ai.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

**EvalMentor AI** is an AI-powered technical interview preparation and automated assessment platform. Candidates upload their resumes in PDF format, from which text and technical competencies are extracted in real time. The platform leverages high-throughput LLM inference via the **Groq API** (`openai/gpt-oss-120b`) to generate customized, role-specific technical interview questions tailored to the candidate's actual projects and skill set. Candidates formulate and submit their answers directly through the interactive interface to receive objective multi-dimensional feedback, concrete strengths and weaknesses, suggestions for improved responses, and an algorithmic score out of 10 stored in MongoDB for progressive tracking.

---

## 🌐 Live Deployments

| Component | URL | Description |
|---|---|---|
| **Production Frontend** | [https://evalmentor-ai.vercel.app](https://evalmentor-ai.vercel.app) | Production client deployed on Vercel (Next.js App Router) |
| **Production Backend** | [https://evalmentor-ai.onrender.com](https://evalmentor-ai.onrender.com) | High-performance FastAPI REST API hosted on Render |
| **Interactive API Docs** | [https://evalmentor-ai.onrender.com/docs](https://evalmentor-ai.onrender.com/docs) | Live Swagger / OpenAPI specification for backend endpoints |
| **GitHub Repository** | [https://github.com/AnzarKhan855/evalmentor-ai](https://github.com/AnzarKhan855/evalmentor-ai) | Official source code and version control repository |

---

## 📸 Product Screenshots

<div align="center">

### Performance Dashboard & Practice History
*Track total interviews, average score metrics, latest attempt scores, and recent practice sessions.*
![Dashboard](docs/screenshots/dashboard.png)

---

### Resume Upload & Real-Time Parsing
*Direct PDF parsing powered by PyMuPDF with automated skill, project, and education extraction.*
![Resume Upload](docs/screenshots/resume-upload.png)

---

### Resume-Tailored AI Interview Questions
*Contextual interview questions generated on-demand by Groq AI from parsed resume text.*
![Interview Questions](docs/screenshots/interview-questions.png)

---



---

### Secure Authentication (Sign In & Sign Up)
*Full JWT-based authentication flow with password hashing and session persistence.*

| Login Screen | Signup Screen |
|:---:|:---:|
| ![Login](docs/screenshots/login.png) | ![Signup](docs/screenshots/signup.png) |

</div>

---

## ✨ Key Features

- **End-to-End JWT Authentication**: Secure user registration, credential hashing with bcrypt, JSON Web Token issuance, and header-based route protection.
- **Automated Resume Ingestion**: Client-side drag-and-drop / file upload strictly accepting PDF formats with size and MIME validation.
- **In-Memory PDF Extraction**: Fast, accurate text parsing powered by `PyMuPDF` (`fitz`), eliminating disk bottlenecks and external OCR dependencies.
- **Deterministic Entity Extraction**: Regex-driven parser isolating candidate contact details (email, phone), technical skills, education history, and project experience.
- **Context-Aware Question Generation**: Sends extracted resume content to Groq Cloud LLMs using constrained prompts to produce 10 relevant, role-tailored technical and behavioral questions.
- **Automated Evaluation Engine**: Rigorously critiques candidate answers against rubric metrics, returning score out of 10, identified strengths, critical weaknesses, and an improved response template.
- **Interview History & Analytics**: Persistent recording of questions, candidate answers, full evaluations, and numerical scores in MongoDB Atlas with aggregated user progress metrics.
- **Resilient AI Architecture**: Centralized model configuration with automatic HTTP 502/429 fallback error handling, preventing server crashes and preserving CORS integrity during upstream outages.

---

## 🔄 How It Works

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    participant UI as Next.js Frontend
    participant API as FastAPI Backend
    participant Parser as PyMuPDF Engine
    participant DB as MongoDB Atlas
    participant AI as Groq API (gpt-oss-120b)

    Candidate->>UI: Sign up / Log in
    UI->>API: POST /api/auth/login
    API->>DB: Query user credentials
    API-->>UI: Return JWT Access Token

    Candidate->>UI: Upload PDF Resume
    UI->>API: POST /api/resume/upload (Multipart PDF + Bearer Token)
    API->>Parser: Extract text (PyMuPDF) & regex sections
    API->>DB: Persist resume record & extracted text
    API-->>UI: Return parsed skills, education & metadata

    Candidate->>UI: Click "Generate Questions"
    UI->>API: POST /api/resume/generate-questions
    API->>DB: Fetch latest resume for authenticated user
    API->>AI: Send resume text with system prompts
    AI-->>API: Stream 10 tailored interview questions
    API-->>UI: Return formatted questions

    Candidate->>UI: Select Question & Submit Answer
    UI->>API: POST /api/resume/evaluate-answer (Question + Candidate Answer)
    API->>AI: Evaluate response against rubric
    AI-->>API: Return Score (X/10), Strengths, Weaknesses, Improved Answer
    API->>DB: Record interview attempt in database
    API-->>UI: Return score and structured evaluation

    Candidate->>UI: View Dashboard
    UI->>API: GET /api/resume/dashboard
    API->>DB: Aggregate average scores and recent attempts
    API-->>UI: Render progress cards and history
```

---

## 🏗 System Architecture

```mermaid
graph TD
    subgraph Client Layer ["Client Tier (Vercel)"]
        A["Next.js App Router (React 19, TypeScript)"]
        A1["Auth Pages (/login, /signup)"]
        A2["Resume Upload Page (/resume-upload)"]
        A3["Question Generator Page (/interview-questions)"]
        A4["Evaluation Page (/evaluate-answer)"]
        A5["Analytics Dashboard (/dashboard)"]
    end

    subgraph Gateway Layer ["API & Middleware Tier (Render)"]
        B["FastAPI Application Server (Uvicorn)"]
        B1["CORSMiddleware (Vercel & Local Allowed Origins)"]
        B2["Global Exception Handler (Safe 500 JSON + Explicit CORS)"]
        B3["JWT Authentication Dependency (get_current_user)"]
    end

    subgraph Service Layer ["Core Backend Services"]
        C1["Auth Router (/api/auth)"]
        C2["Resume Router (/api/resume)"]
        C3["Profile Router (/api/profile)"]
        C4["PyMuPDF Parser (fitz text extraction)"]
        C5["Regex Section Parser (Skills, Education, Projects)"]
        C6["Groq Client Service (groq_service.py)"]
        C7["Answer Evaluator (evaluation_service.py)"]
    end

    subgraph External Services ["Cloud Infrastructure"]
        D[("MongoDB Atlas<br/>• users<br/>• resumes<br/>• interviews")]
        E["Groq Cloud LLM API<br/>Model: openai/gpt-oss-120b<br/>Configurable via GROQ_MODEL"]
    end

    A -->|HTTPS / Bearer Auth| B
    B --> B1 --> B2 --> B3
    B3 --> C1 & C2 & C3
    C2 --> C4 --> C5
    C2 --> C6 --> E
    C2 --> C7 --> E
    C1 --> D
    C2 --> D
```

---

## 💻 Technology Stack

| Layer | Technology | Version / Details | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 15.2.x (App Router) | React server & client components, client-side routing |
| **Language (Frontend)** | TypeScript | 5.x | Strict static typing and interface definitions |
| **Styling** | Tailwind CSS | 3.4.x | Dark-mode UI components, responsive layout utility classes |
| **Backend Framework** | FastAPI | 0.110+ | Asynchronous REST API server with OpenAPI autogeneration |
| **Server Engine** | Uvicorn | 0.29+ (Standard) | High-concurrency ASGI web server |
| **Language (Backend)** | Python | 3.11+ | Core backend logic, typing, and service pipelines |
| **Database** | MongoDB Atlas | 4.x / 5.x | Cloud document database for user profiles, resumes, and attempts |
| **Database Driver** | Motor / PyMongo | 3.3+ | Non-blocking asynchronous MongoDB client for asyncio |
| **AI Inference** | Groq Cloud SDK | 0.5+ | Ultra-low-latency LLM execution (`openai/gpt-oss-120b`) |
| **PDF Processing** | PyMuPDF (`fitz`) | 1.24+ | Robust binary extraction of text from candidate PDF resumes |
| **Authentication** | python-jose & passlib | 3.3+ / 1.7+ | JWT token generation/validation and bcrypt password hashing |
| **Hosting (Web)** | Vercel | Production Edge CDN | Automated Continuous Deployment for the Next.js frontend |
| **Hosting (API)** | Render | Python Web Service | Managed container execution for the FastAPI backend |

---

## 📂 Project Structure

```text
evalmentor-ai/
├── README.md                      # Primary project documentation & architecture guide
├── LICENSE                        # MIT Open Source License
├── .gitignore                     # Repository-wide ignore rules for env & cache
│
├── backend/                       # FastAPI backend service
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py            # POST /signup, POST /login, GET /me
│   │   │   ├── resume.py          # POST /upload, POST /generate-questions, POST /evaluate-answer, GET /dashboard
│   │   │   ├── profile.py         # GET /api/profile/me
│   │   │   └── interview.py       # Sample / mockup interview history endpoints
│   │   ├── services/
│   │   │   ├── groq_service.py    # Resilient Groq client & question generator
│   │   │   ├── evaluation_service.py # Groq answer evaluation & regex score parsing
│   │   │   ├── pdf_parser.py      # PyMuPDF text extraction
│   │   │   └── resume_parser.py   # Regex extraction of contact, skills, and sections
│   │   ├── models/
│   │   │   ├── user.py            # Pydantic schemas for auth payload validation
│   │   │   ├── resume.py          # Resume data structures
│   │   │   └── interview.py       # Interview document schemas
│   │   ├── utils/
│   │   │   ├── security.py        # Bcrypt hashing & JWT creation/verification
│   │   │   └── dependencies.py    # FastAPI Depends(get_current_user)
│   │   ├── config.py              # Environment variables & GROQ_MODEL definition
│   │   ├── database.py            # Motor AsyncIOMotorClient database connection
│   │   └── main.py                # FastAPI initialization, CORS, error handling
│   ├── tests/
│   │   └── test_api.py            # Complete unit test suite (11 test cases)
│   ├── requirements.txt           # Production Python dependencies for Render
│   └── .env.example               # Template for backend environment variables
│
├── evalmentor-ai/
│   └── frontend/                  # Next.js frontend application
│       ├── app/
│       │   ├── page.tsx           # Entry route (redirects to /login)
│       │   ├── login/page.tsx     # Candidate sign-in interface
│       │   ├── signup/page.tsx    # Candidate registration interface
│       │   ├── dashboard/page.tsx # Analytics, score tracking, recent activity
│       │   ├── resume-upload/page.tsx # PDF upload and parsed entities display
│       │   ├── interview-questions/page.tsx # AI question generation and list
│       │   ├── evaluate-answer/page.tsx # Answer submission and feedback viewer
│       │   └── layout.tsx         # Root layout with fonts and global metadata
│       ├── src/
│       │   ├── services/
│       │   │   ├── questionService.ts # API client for /generate-questions
│       │   │   ├── evaluationService.ts # API client for /evaluate-answer
│       │   │   └── interviewHistoryService.ts # API client for history
│       │   └── components/        # Shared presentation components
│       ├── lib/
│       │   ├── config.ts          # Centralized API base URL resolver (Vercel vs Local)
│       │   ├── api.ts             # Shared fetch wrapper with error handling
│       │   └── auth.ts            # Authentication helper functions
│       ├── public/                # Static brand assets
│       ├── package.json           # Frontend scripts and dependencies
│       └── .env.example           # Template for frontend environment variables
│
└── docs/
    └── screenshots/               # Production UI screenshots for documentation
        ├── dashboard.png
        ├── resume-upload.png
        ├── interview-questions.png
        ├── answer-evaluation.png
        ├── login.png
        └── signup.png
```

---

## 🔌 API Overview

All protected endpoints require an `Authorization: Bearer <token>` HTTP header.

| Method | Endpoint | Auth Required | Purpose |
|---|---|:---:|---|
| `GET` | `/` | No | Basic health and service verification ping |
| `GET` | `/health` | No | System health check returning `{"status": "healthy"}` |
| `POST` | `/api/auth/signup` | No | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | No | Authenticate user and obtain a signed JWT bearer token |
| `GET` | `/api/auth/me` | **Yes** | Validate token and retrieve current user identity |
| `GET` | `/api/profile/me` | **Yes** | Retrieve user profile metadata |
| `GET` | `/api/resume/health` | No | Verification endpoint for the resume routing sub-app |
| `POST` | `/api/resume/upload` | **Yes** | Upload PDF resume, extract text via PyMuPDF, and parse sections |
| `POST` | `/api/resume/generate-questions`| **Yes** | Query Groq AI (`openai/gpt-oss-120b`) for 10 tailored interview questions |
| `POST` | `/api/resume/evaluate-answer` | **Yes** | Submit candidate answer; receive feedback, score, and ideal answer |
| `GET` | `/api/resume/history` | **Yes** | Fetch chronological interview history for authenticated user |
| `GET` | `/api/resume/dashboard` | **Yes** | Fetch aggregate performance metrics (`total_interviews`, `average_score`) |

---

## 🤖 AI Pipeline & Model Configuration

### 1. High-Performance Groq Cloud Inference
EvalMentor AI employs Groq's LPUs (Language Processing Units) to achieve sub-second generation times for complex multi-turn prompts.

- **Active Production Model**: `openai/gpt-oss-120b`
- **Dynamic Configuration**: Specified centrally in [`backend/app/config.py`](file:///backend/app/config.py):
  ```python
  GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
  ```
  The active LLM can be switched instantly via the Render environment dashboard without requiring a code commit or rebuild.

### 2. Prompt Architecture
- **Question Generation**: Employs a strict system constraint directing the LLM to output 10 distinct technical, project-based, and behavioral interview questions mapped directly to the technologies identified in the candidate's resume.
- **Answer Assessment**: Prompts the model with a structured evaluation schema requiring:
  1. A quantitative score out of 10 (`Score: X/10`).
  2. Identified strengths.
  3. Identified weaknesses or missing technical concepts.
  4. An improved, professional reference response.

### 3. Fault-Tolerant Error Handling
All calls to `client.chat.completions.create` are encapsulated in comprehensive exception blocks:
- Upstream authentication issues (`AuthenticationError`) return clean HTTP 502 with diagnostic logging.
- Groq rate limiting (`RateLimitError`) returns HTTP 429 to signal client retry without crashing the worker.
- Network timeouts and connection breaks (`APIConnectionError`, `APITimeoutError`) map gracefully to HTTP 502.
- CORS headers remain strictly intact across all error pathways via the global exception handler in `backend/app/main.py`.

---

## 📄 Resume Processing Pipeline

1. **PDF Ingestion**: The candidate selects a PDF file. The frontend verifies MIME type (`application/pdf`) and streams it via `multipart/form-data` to `/api/resume/upload`.
2. **Text Extraction**: The backend writes the buffer temporarily to `uploads/resumes/` and utilizes `fitz` (`PyMuPDF`) to iterate through pages and extract raw UTF-8 text.
3. **Structured Entity Recognition**:
   - **Candidate Name**: Heuristic evaluation of the leading resume lines.
   - **Contact Information**: Regex matching for email addresses (`[\w\.-]+@[\w\.-]+\.\w+`) and telephone numbers.
   - **Skill Tagging**: Normalized keyword scanning against standard full-stack, data science, and AI/ML competencies (Python, TypeScript, React, Next.js, FastAPI, MongoDB, Algorithms, etc.).
   - **Section Splitting**: Boundary regex partitioning isolating `Education`, `Projects`, and `Training/Experience` blocks.
4. **Database Persistence**: Parsed entities and raw text are saved to the `resumes` MongoDB collection linked to the candidate's `user_id`.

---

## 🔒 Authentication & Security

- **Password Hashing**: User passwords are encrypted using `passlib[bcrypt]` with automated salt generation. Plaintext passwords are never stored or logged.
- **Stateless JWT Tokens**: Authenticated sessions issue signed JSON Web Tokens (`HS256`) containing candidate IDs. The token expiration is configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Secret Isolation**: `GROQ_API_KEY`, `MONGODB_URL`, and `JWT_SECRET_KEY` are kept strictly server-side. No sensitive API credentials or connection strings are ever leaked to the client bundle.
- **CORS Protection**: Access is restricted to `https://evalmentor-ai.vercel.app` and designated local development ports, preventing cross-origin invocation from unauthorized origins.
- **Safe Global Error Handling**: Unhandled runtime exceptions return sanitized JSON messages to clients while logging full traces server-side, preventing database schema or infrastructure leakage.

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Required | Example / Default | Purpose |
|---|:---:|---|---|
| `MONGODB_URL` | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net` | MongoDB Atlas cluster connection string |
| `DATABASE_NAME` | No | `evalmentor_ai` | Target MongoDB database name |
| `JWT_SECRET_KEY` | **Yes** | `your_generated_secret_key` | Secret key used to sign and verify JWT tokens |
| `JWT_ALGORITHM` | No | `HS256` | Cryptographic algorithm for JWT encoding |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Token validity lifetime in minutes |
| `GROQ_API_KEY` | **Yes** | `gsk_xxxxxxxxxxxxxxxxxxxx` | Groq Cloud API access key |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | LLM model identifier for Groq completions |
| `FRONTEND_URL` | No | `https://evalmentor-ai.vercel.app` | Production frontend domain for CORS whitelisting |

### Frontend Configuration (`evalmentor-ai/frontend/.env.local`)

| Variable | Required | Example / Default | Purpose |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000` | Backend API URL (defaults to Render in production) |

---

## 🚀 Local Development Setup

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+ (Node 20+ recommended)
- **MongoDB**: Active MongoDB Atlas cluster URI or local MongoDB daemon
- **Groq API Key**: Free account available at [console.groq.com](https://console.groq.com)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/AnzarKhan855/evalmentor-ai.git
cd evalmentor-ai
```

---

### Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate

   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and supply your MONGODB_URL, JWT_SECRET_KEY, and GROQ_API_KEY
   ```

5. Launch the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will be available at `http://127.0.0.1:8000`.<br/>
   Interactive Swagger documentation will be available at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd evalmentor-ai/frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure local environment variables:
   ```bash
   cp .env.example .env.local
   # Ensure NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 is present
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

The backend includes a comprehensive automated test suite testing authentication, resume handling, CORS preflight, and Groq error tolerance.

To execute the test suite:

```bash
cd backend
python -m unittest discover -s tests -p "test_*.py" -v
```

### Verified Test Scenarios:
- `test_cors_preflight_generate_questions`: Validates CORS preflight headers on protected routes.
- `test_unauthenticated_generate_questions`: Asserts HTTP 401 on unauthorized calls.
- `test_authenticated_no_resume`: Asserts HTTP 404 when candidate has not yet uploaded a resume.
- `test_authenticated_empty_resume_text`: Asserts HTTP 400 when an unreadable PDF is uploaded.
- `test_groq_authentication_failure`: Verifies HTTP 502 with CORS headers when upstream auth fails.
- `test_groq_rate_limit_failure`: Verifies HTTP 429 with CORS headers when Groq limits are hit.
- `test_unexpected_backend_exception_global_handler`: Verifies HTTP 500 without leaking stack traces.
- `test_successful_question_generation`: Validates question formatting and successful response.
- `test_evaluate_answer_success`: Validates score extraction and feedback generation.
- `test_model_configuration_used_consistently`: Asserts that `openai/gpt-oss-120b` is correctly supplied across both questions and evaluation pipelines.

---

## 🚀 Deployment Architecture

- **Frontend (Vercel)**:
  - Linked to GitHub `master` branch for automated preview and production builds.
  - Automatically configured with Next.js App Router edge caching and environment variable propagation.
- **Backend (Render)**:
  - Root directory set to `backend/`.
  - Build command: `pip install -r requirements.txt`.
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
  - Automated deployment triggers on git push to the master branch.
- **Database (MongoDB Atlas)**:
  - Multi-region cloud cluster with IP access rules and encrypted connections over TLS/SSL.

---

## 🗺 Roadmap & Future Enhancements

- [ ] **Custom Difficulty Selector**: Allow candidates to toggle question difficulty between *Junior / Internship*, *Mid-Level*, and *Senior System Design*.
- [ ] **Voice / Audio Mock Interview**: Implement speech-to-text (Whisper) and text-to-speech for interactive audio interviews.
- [ ] **PDF Feedback Export**: Generate downloadable evaluation summary reports with interview metrics and recommendations.
- [ ] **Coding Sandbox**: Integrated in-browser code editor with sandboxed execution for live coding interview challenges.
- [ ] **Recruiter Dashboard**: Allow recruiters to review candidate practice runs, benchmark scores, and download structured assessments.

---

## 👤 Author

**Anzar Khan**<br/>
*B.Tech in Artificial Intelligence & Machine Learning*

- **GitHub**: [@AnzarKhan855](https://github.com/AnzarKhan855)
- **LinkedIn**: [Anzar Khan](https://linkedin.com/in/AnzarKhan855)
- **Email**: Reach out via GitHub profile

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
