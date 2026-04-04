from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase
from Cybronites.server.db import get_db, settings
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi.security import OAuth2PasswordBearer
import uuid
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# --- Pydantic Models ---
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(UserBase):
    id: str
    is_verified: bool
    created_at: datetime

# --- Helpers ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

# --- Email Configuration ---
mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME="AI Guardian Security",
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=None # Add if you want to use templates
)

async def send_verification_email(email: str, token: str):
    verification_url = f"http://localhost:5173/verify?token={token}"
    message = MessageSchema(
        subject="AI Guardian: Verify Your Account",
        recipients=[email],
        body=f"Welcome to AI Guardian. Please verify your account by clicking the link below:\n\n{verification_url}\n\nIf you didn't request this, please ignore.",
        subtype=MessageType.plain
    )
    fm = FastMail(mail_conf)
    await fm.send_message(message)

# --- Endpoints ---
@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, background_tasks: BackgroundTasks, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    verification_token = str(uuid.uuid4())
    
    new_user = {
        "email": user.email,
        "username": user.username,
        "password": hashed_password,
        "is_verified": False,
        "verification_token": verification_token,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(new_user)
    
    # Send verification email in background
    background_tasks.add_task(send_verification_email, user.email, verification_token)
    
    return {
        "id": str(result.inserted_id),
        "email": user.email,
        "username": user.username,
        "is_verified": False,
        "created_at": new_user["created_at"]
    }

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    if not user["is_verified"]:
        raise HTTPException(status_code=401, detail="Email not verified")
    
    access_token = create_access_token(data={"sub": user["email"], "id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify")
async def verify_email(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=404, detail="Invalid verification token")
    
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True, "verification_token": None}})
    return {"message": "Email verified successfully. You can now login."}

@router.get("/me", response_model=UserOut)
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "is_verified": user["is_verified"],
        "created_at": user["created_at"]
    }
