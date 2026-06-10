from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/profile",
    tags=["User Profile"]
)

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Profile fetched successfully",
        "user": {
            "id": str(current_user["_id"]),
            "name": current_user.get("name"),
            "email": current_user.get("email")
        }
    }