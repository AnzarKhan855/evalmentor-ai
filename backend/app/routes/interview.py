from fastapi import APIRouter

router = APIRouter(
    prefix="/api/interviews",
    tags=["Interview History"]
)


@router.get("/history")
async def get_interview_history():
    return {
        "message": "Interview history fetched successfully",
        "history": [
            {
                "question": "What is JWT Authentication?",
                "answer": "JWT is used for authentication and authorization.",
                "score": 8
            },
            {
                "question": "Explain FastAPI.",
                "answer": "FastAPI is a modern Python web framework.",
                "score": 9
            }
        ]
    }