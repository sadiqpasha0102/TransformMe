from fastapi import APIRouter
from services.user.login_controller import router as login_router
from services.user import onboarding_controller

router = APIRouter()

# Register sub-routers under a unified API structure
router.include_router(login_router, prefix="/auth", tags=["Authentication"])

