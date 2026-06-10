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

    resume_data = {
        "user_id": str(current_user["_id"]),
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "file_size": len(file_content),
    }

    result = await database["resumes"].insert_one(resume_data)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": str(result.inserted_id),
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_size": len(file_content)
    }