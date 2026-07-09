from fastapi import APIRouter
from services.login import router as login_router

api_router = APIRouter()

# Register sub-routers under a unified API structure
api_router.include_router(login_router, prefix="/auth", tags=["Authentication"])
