from app.services.evaluation_service import evaluate_answer
from app.services.groq_service import generate_interview_questions
from app.services.resume_parser import parse_resume_text
from app.services.pdf_parser import extract_text_from_pdf
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.utils.dependencies import get_current_user
from app.database import database

router = APIRouter(
    prefix="/api/resume",
    tags=["Resume"]
)

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/health")
async def resume_health():
    return {"message": "Resume route working"}


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    file_content = await file.read()

    with open(file_path, "wb") as f:
        f.write(file_content)

    extracted_text = extract_text_from_pdf(file_path)
    parsed_data = parse_resume_text(extracted_text)

    resume_data = {
        "user_id": str(current_user["_id"]),
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "file_size": len(file_content),
        "extracted_text": extracted_text,
        "parsed_data": parsed_data,
    }

    result = await database["resumes"].insert_one(resume_data)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": str(result.inserted_id),
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_size": len(file_content),
        "parsed_data": parsed_data
    }


@router.post("/generate-questions")
async def generate_questions(
    current_user: dict = Depends(get_current_user)
):
    latest_resume = await database["resumes"].find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("_id", -1)]
    )

    if not latest_resume:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Please upload a resume first."
        )

    resume_text = latest_resume.get("extracted_text")

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text not found. Please upload resume again."
        )

    questions = generate_interview_questions(resume_text)

    return {
        "message": "Interview questions generated successfully",
        "questions": questions
    }


@router.post("/evaluate-answer")
async def evaluate_interview_answer(
    question: str,
    answer: str,
    current_user: dict = Depends(get_current_user)
):
    evaluation = evaluate_answer(question, answer)

    interview_data = {
        "user_id": str(current_user["_id"]),
        "question": question,
        "answer": answer,
        "evaluation": evaluation
    }

    result = await database["interviews"].insert_one(interview_data)

    return {
        "message": "Answer evaluated successfully",
        "interview_id": str(result.inserted_id),
        "evaluation": evaluation
    }