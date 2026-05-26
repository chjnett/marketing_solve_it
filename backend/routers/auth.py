from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from typing import Optional
from database import get_session
from models import User, LinkedAccount
from services.threads_api import threads_api_service
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/api/v1/auth/login")
def login(req: LoginRequest, session: Session = Depends(get_session)):
    # 1. Check if user already exists
    statement = select(User).where(User.email == req.email)
    user = session.exec(statement).first()
    
    if not user:
        # Create default demo user to support quick testing
        user = User(email=req.email, name=req.email.split("@")[0], password_hash="demo_hashed")
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return {
        "success": True,
        "token": "mock-jwt-access-token-12345",
        "user": {"email": user.email, "name": user.name}
    }

@router.get("/api/v1/meta/auth/url")
def get_meta_auth_url():
    """Step 1: Returns authorization redirect URL for frontend integrations"""
    url = threads_api_service.get_authorization_url()
    return {"url": url}

@router.get("/api/v1/auth/threads/login")
def threads_login_redirect():
    """Trigger OAuth redirect directly on browser"""
    url = threads_api_service.get_authorization_url()
    return RedirectResponse(url)

@router.get("/api/v1/auth/threads/callback")
async def threads_callback(
    code: Optional[str] = None, 
    error: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Step 2 & 3: Callback handler. Exchange tokens, fetch profile, and save account in database"""
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth failed: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing auth code")
        
    try:
        # Exchange code for long-lived access token
        token_data = await threads_api_service.exchange_code_for_token(code)
        access_token = token_data.get("access_token")
        user_id = str(token_data.get("user_id"))
        
        # Fetch user profile
        profile = await threads_api_service.get_user_profile(user_id, access_token)
        
        # Save or update linked account
        statement = select(LinkedAccount).where(LinkedAccount.username == profile.get("username"))
        existing_acc = session.exec(statement).first()
        
        if existing_acc:
            existing_acc.access_token = access_token
            existing_acc.token_status = "valid"
            existing_acc.name = profile.get("name")
            existing_acc.avatar = profile.get("avatar")
            session.add(existing_acc)
        else:
            new_acc = LinkedAccount(
                username=profile.get("username"),
                name=profile.get("name"),
                avatar=profile.get("avatar"),
                access_token=access_token,
                role="booster" if len(session.exec(select(LinkedAccount)).all()) > 0 else "main",
                persona="일반 교양/유머",
                persona_preset="general"
            )
            session.add(new_acc)
            
        session.commit()
        
        # Redirect back to frontend accounts dashboard
        return RedirectResponse(url="http://localhost:3000/dashboard/accounts")
    except Exception as e:
        # Development fallback: Redirect even if Meta credentials fail, showing a mock integration success
        print(f"[OAuth Callback Error] Meta API failed: {e}")
        return RedirectResponse(url="http://localhost:3000/dashboard/accounts?integration=mock_success")
