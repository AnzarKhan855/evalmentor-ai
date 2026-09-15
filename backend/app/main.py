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
print("FRONTEND_URL =", frontend_url)

allowed_origins = [
    "https://evalmentor-ai.vercel.app",
    "https://evalmentor-ai.onrender.com",

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

import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("evalmentor")
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )

    origin = request.headers.get("origin")
    headers = {}
    if origin and (origin in allowed_origins or "*" in allowed_origins):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
        headers["Access-Control-Allow-Headers"] = "*"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "An unexpected server error occurred. Please try again later.",
        },
        headers=headers,
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