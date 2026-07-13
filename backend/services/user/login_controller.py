import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from pydantic import BaseModel
import uuid
import os
from dotenv import load_dotenv
from db import dynamodb
from router import router
load_dotenv()


SECRET_KEY = str(os.getenv("JWT_SECRET_KEY"))
ALGORITHM = str(os.getenv("JWT_ALGORITHM"))
TABLE_NAME = str(os.getenv("DYNAMODB_TABLE_NAME"))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "user"

@router.post("/login")
def validate_login(request: LoginRequest):
    email = request.email.strip().lower()
    
    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={"email": email})
        user_item = response.get("Item")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Something went wrong!!: {str(e)}"
        )
    if not user_item or user_item.get("email")!=email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    elif user_item and user_item.get("password") != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect"
        )
    elif user_item and user_item.get("password") == request.password:
        role = user_item.get("role", "user")
        user_id = user_item.get("id")
        user_info = {
            "sub": email,
            "role": role,
            "id": user_id
        }
        token = create_access_token(user_info)
        return {
            "status": "success",
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "role": role
            }
        }
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )

@router.post("/register")
def register_user(request: RegisterRequest):
    email = request.email.strip().lower()
    password = request.password
    role = request.role.strip() if request.role else "user"
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password cannot be empty"
        )
        
    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={"email": email})
        if "Item" in response:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        unique_id = str(uuid.uuid4())
        table.put_item(
            Item={
                "id": unique_id,
                "email": email,
                "password": password,
                "role": role
            }
        )
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": unique_id,
                "email": email,
                "role": role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
            
        path = request.url.path

        is_public = False
        
        if path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            is_public = True
            
        elif path in ["/api/v1/auth/login", "/api/v1/auth/register"]:
            is_public = True

        if is_public:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header. Expected Bearer token."}
            )

        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired access token"}
            )

        request.state.user = payload

        response = await call_next(request)
        return response
