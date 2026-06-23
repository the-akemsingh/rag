<div align="center">

# 📄 AskDocs

### Chat with your documents using AI-powered Retrieval-Augmented Generation

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini_3.5_Flash-Google_AI-4285F4?logo=google)](https://ai.google.dev/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Cloud-orange)](https://www.trychroma.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1.3-green)](https://www.langchain.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Async-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**[Live Demo →](https://askdocs-xi.vercel.app)**

</div>

---

## 🧠 What is AskDocs?

**AskDocs** is a production-grade RAG (Retrieval-Augmented Generation) application that lets users upload PDF documents and have intelligent, context-aware conversations with their content. Powered by Google's Gemini models and a vector search pipeline, it delivers accurate, grounded answers — never hallucinating beyond the source material.

### ✨ Key Features

- 🔐 **Google OAuth Authentication** — Secure sign-in with Google, JWT session tokens
- 📤 **PDF Upload & Processing** — Upload documents, auto-chunk, embed, and index
- 💬 **Real-time Chat via WebSocket** — Instant streaming-style Q&A over your documents
- 🔍 **Semantic Vector Search** — Finds the most relevant passages using embedding similarity
- 🌙 **Dark / Light Theme** — Glassmorphism UI with smooth theme transitions
- 📚 **Multi-Chat Support** — Create, switch between, and delete independent chat sessions
- 🎨 **Premium UI** — Cal Sans typography, morphing blob backgrounds, liquid glass effects

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                  Next.js 16 · React 19 · Tailwind v4            │
│         Google OAuth  ·  WebSocket Client  ·  Axios HTTP        │
└────────────────────┬──────────────────┬─────────────────────────┘
                     │ REST API         │ WebSocket
                     │ (HTTP)           │ (wss://)
                     ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI + Uvicorn)                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Auth Router  │  │ Chats Router │  │  WebSocket Router   │   │
│  │  /api/v1/auth │  │  /chats/*    │  │  /ws/chat/{id}      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘   │
│         │                 │                      │               │
│  ┌──────▼─────────────────▼──────────────────────▼──────────┐   │
│  │                    Service Layer                          │   │
│  │  ┌─────────────┐ ┌────────────────┐ ┌────────────────┐   │   │
│  │  │  LLM Call   │ │ Data Ingestion │ │   ChromaDB     │   │   │
│  │  │ (Gemini API)│ │  (LangChain)   │ │  (Vector DB)   │   │   │
│  │  └─────────────┘ └────────────────┘ └────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────┬─────────────────────────────┘
                 │                  │
                 ▼                  ▼
    ┌────────────────────┐  ┌────────────────────┐
    │    PostgreSQL       │  │  ChromaDB Cloud    │
    │  (Aiven Cloud)      │  │  (Vector Store)    │
    │                     │  │                     │
    │  • Users            │  │  • Embeddings       │
    │  • Chats            │  │  • Document chunks  │
    │  • Messages         │  │  • Metadata         │
    │  • Documents        │  │                     │
    └────────────────────┘  └────────────────────┘
```

### 📡 RAG Pipeline Flow

```
User Question
     │
     ▼
┌──────────────────┐
│ Generate Embedding│ ◄── Gemini Embedding-2 Model
│  (query → vector) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Vector Search    │ ◄── ChromaDB KNN (top-5 chunks)
│  (find relevant   │
│   passages)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate Answer  │ ◄── Gemini 3.5 Flash + Retrieved Context
│  (grounded LLM    │
│   response)       │
└──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router, SSR |
| **React 19** | UI rendering with hooks & client components |
| **TypeScript** | Type-safe frontend development |
| **Tailwind CSS v4** | Utility-first styling with custom design tokens |
| **next-themes** | Dark/light mode toggle with system preference |
| **@react-oauth/google** | Google OAuth 2.0 login flow |
| **Axios** | HTTP client for REST API calls |
| **Three.js** | 3D visual effects and animations |
| **Cal Sans** | Premium display typography |

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework with auto-docs |
| **Uvicorn** | ASGI server for production deployment |
| **LangChain** | Document loading, text splitting, RAG orchestration |
| **Google Gemini API** | LLM inference (`gemini-3.5-flash`) and embeddings (`gemini-embedding-2`) |
| **ChromaDB Cloud** | Managed vector database for embedding storage & KNN search |
| **SQLAlchemy 2.0** | Async ORM with mapped column declarations |
| **asyncpg** | Async PostgreSQL driver |
| **Alembic** | Database schema migrations |
| **PyJWT** | JWT token encoding/decoding for auth |
| **PyMuPDF / PyPDF** | PDF document parsing and text extraction |
| **Pydantic** | Request/response data validation |

### Infrastructure

| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting & deployment |
| **Aiven Cloud** | Managed PostgreSQL database |
| **ChromaDB Cloud** | Managed vector database |
| **Google Cloud** | OAuth 2.0 client credentials |

---

## 🔌 APIs Used

| API | Model / Service | Usage |
|---|---|---|
| **Google Gemini** | `gemini-3.5-flash` | Answer generation (grounded on retrieved context) |
| **Google Gemini** | `gemini-embedding-2` | Text-to-vector embeddings (3072 dimensions) |
| **Google Gemini** | `gemini-2.5-flash-lite` | General chat responses |
| **Google OAuth 2.0** | Identity Platform | User authentication & token verification |
| **ChromaDB** | Cloud API | Vector storage, KNN similarity search |

---

## 📁 Project Structure

```
askdocs/
├── frontend/                    # Next.js 16 application
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChatComponent.tsx     # Main chat interface
│   │   │   ├── ChatSidebar.tsx       # Chat history sidebar
│   │   │   ├── ChatMockup.tsx        # Landing page demo UI
│   │   │   ├── AssistantMessage.tsx   # AI response renderer
│   │   │   ├── LoginButton.tsx        # Google OAuth button
│   │   │   ├── Navbar.tsx             # Navigation bar
│   │   │   └── ThemeProvider.tsx      # Dark/light mode provider
│   │   ├── globals.css               # Design system & glassmorphism
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── page.tsx                  # Landing page / chat view
│   ├── lib/
│   │   ├── backend.ts               # Backend URL configuration
│   │   ├── allowed-documents.ts     # File type validation
│   │   └── parse-assistant-content.ts # Response parsing utilities
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py              # Google OAuth → JWT endpoint
│   │   │   ├── chats.py             # CRUD for chats & document upload
│   │   │   └── websocket.py         # Real-time RAG Q&A via WebSocket
│   │   ├── services/
│   │   │   ├── llm_call.py          # Gemini API client (LLM + embeddings)
│   │   │   ├── data_ingestion.py    # PDF → chunks → embeddings pipeline
│   │   │   ├── chromadb.py          # ChromaDB vector operations
│   │   │   └── models.py           # Embedding data models
│   │   ├── db/
│   │   │   ├── database.py          # Async SQLAlchemy engine & session
│   │   │   └── models.py           # User, Chat, Message, Document tables
│   │   ├── dependencies.py          # JWT auth & user resolution
│   │   └── main.py                  # FastAPI app entrypoint
│   ├── alembic.ini                  # Migration configuration
│   └── pyproject.toml               # Python dependencies (uv)
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** ≥ 3.11
- **Node.js** ≥ 18
- **uv** (Python package manager) — [install guide](https://docs.astral.sh/uv/)
- **PostgreSQL** database (or [Aiven](https://aiven.io/) cloud instance)
- **ChromaDB Cloud** account — [sign up](https://www.trychroma.com/)
- **Google Cloud** project with OAuth 2.0 credentials
- **Gemini API Key** — [get one](https://ai.google.dev/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/askdocs.git
cd askdocs
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
uv venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows

# Install dependencies
uv sync
```

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant_id
CHROMA_DATABASE=your_chroma_database_name
GOOGLE_CLIENT_ID=your_google_oauth_client_id
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname?ssl=require
```

Run database migrations and start the server:

```bash
# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the development server:

```bash
npm run dev
```

The app will be available at **http://localhost:3000** 🎉

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string name
        string google_id
    }
    CHATS {
        string id PK
        int user_id FK
        string title
        datetime created_at
    }
    DOCUMENTS {
        string id PK
        string document_name
        int user_id FK
        string chat_id FK
        bool is_embedded
    }
    MESSAGES {
        string id PK
        string chat_id FK
        string role
        text content
        datetime created_at
    }

    USERS ||--o{ CHATS : "has many"
    USERS ||--o{ DOCUMENTS : "uploads"
    CHATS ||--o{ MESSAGES : "contains"
    CHATS ||--o{ DOCUMENTS : "references"
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/google` | Exchange Google OAuth token for JWT |

### Chats

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/chats` | List all chats for authenticated user |
| `POST` | `/chats` | Create a new chat session |
| `DELETE` | `/chats/{chat_id}` | Delete a chat and its embeddings |
| `GET` | `/chats/{chat_id}/messages` | Retrieve chat message history |
| `POST` | `/chats/{chat_id}/upload-doc` | Upload & process PDF documents |

### WebSocket

| Protocol | Endpoint | Description |
|---|---|---|
| `WS` | `/ws/chat/{chat_id}?token=JWT` | Real-time RAG conversation |

---

## 🔒 Authentication Flow

```
1. User clicks "Sign in with Google"
2. Google OAuth returns an ID token
3. Frontend sends token to POST /api/v1/auth/google
4. Backend verifies token with Google's public keys
5. User is created/fetched from PostgreSQL
6. Backend returns a signed JWT
7. JWT is stored in localStorage for subsequent requests
8. WebSocket connections authenticate via query parameter
```

---

## 🧪 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for LLM & embeddings |
| `CHROMA_API_KEY` | ChromaDB Cloud API key |
| `CHROMA_TENANT` | ChromaDB tenant identifier |
| `CHROMA_DATABASE` | ChromaDB database name |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `DATABASE_URL` | PostgreSQL async connection string |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Akem](https://github.com/your-username)**

*Powered by Google Gemini · LangChain · ChromaDB*

</div>
