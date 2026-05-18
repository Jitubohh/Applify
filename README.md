# Applify

AI-powered resume intelligence. Upload your resume, paste a job description, and get a match score, skill gap analysis, and a professionally formatted resume tailored to the role.

## What it does

- Scores your resume against any job description
- Identifies matched and missing skills
- Suggests improvements grounded in real job market data
- Generates an improved resume in 6 professional templates
- Stores your analysis history

## Architecture

    User
     │
     ▼
    React Frontend (Vite + Tailwind)
     │
     ▼
    FastAPI Backend
     ├── JWT Authentication (Supabase)
     ├── PDF Text Extraction (pdfplumber)
     ├── Structured Extraction Chain (LangChain + NVIDIA LLM)
     ├── RAG Analysis Pipeline
     │    ├── FAISS Vector Store (job market knowledge base)
     │    ├── Adzuna API (real job descriptions)
     │    └── NVIDIA Embeddings
     ├── Resume Generation (LaTeX → PDF)
     └── Supabase (Database + Storage)

## Tech Stack

**Backend** — FastAPI, LangChain, NVIDIA AI, FAISS, Supabase, pdfplumber, LaTeX

**Frontend** — React, Vite, Tailwind CSS, Supabase JS

**AI** — NVIDIA llama-3.3-70b-instruct, NVIDIA embeddings, RAG pipeline with Adzuna job data

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` in both the backend and frontend folders and fill in your credentials.

## Author

David Jituboh — [github.com/Jitubohh](https://github.com/Jitubohh)

## License

Copyright © 2026 David Jituboh. All rights reserved. Source available for viewing only.