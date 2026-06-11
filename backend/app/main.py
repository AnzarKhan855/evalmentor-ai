import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.resume import router as resume_router
from app.routes.interview import router as interview_router


app = FastAPI(
    title="EvalMentor AI API",
    description="AI Interview Agent and Evaluation Platform",
    version="1.0.0",
)

frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
]

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(interview_router)


@app.get("/")
def root():
    return {"message": "EvalMentor AI Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}