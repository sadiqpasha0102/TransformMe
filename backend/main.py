from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router
from services.login import JWTMiddleware

app = FastAPI()

# Enable CORS for frontend Angular apps (running on ports 4200, 4201, 4202)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable JWT middleware to secure other backend routes
app.add_middleware(JWTMiddleware)

# 1. Centralized routers (initialised once, available on backend startup)
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
