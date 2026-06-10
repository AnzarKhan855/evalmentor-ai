from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.resume import router as resume_router
app = FastAPI(
    title="EvalMentor AI API",
    description="AI Interview Agent and Evaluation Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)


@app.get("/")
def root():
    return {"message": "EvalMentor AI Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}