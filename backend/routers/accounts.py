from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import LinkedAccount
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class UpdatePersonaRequest(BaseModel):
    name: Optional[str] = None
    persona: Optional[str] = None
    persona_preset: Optional[str] = None
    aggro_level: Optional[int] = None
    emoji_preference: Optional[str] = None
    line_breaks: Optional[str] = None
    forbidden_keywords: Optional[str] = None
    required_keywords: Optional[str] = None

class CreateAccountRequest(BaseModel):
    username: str
    name: str
    avatar: str
    persona: str
    persona_preset: str
    access_token: str = "mock-token"
    role: str = "booster"

@router.get("/api/v1/accounts")
def list_accounts(session: Session = Depends(get_session)):
    accounts = session.exec(select(LinkedAccount)).all()
    
    # If no accounts exist in D1/SQLite, initialize with default accounts for seamless testing
    if not accounts:
        mock_accs = [
            LinkedAccount(
                username="tech_insights",
                name="Tech Insights (메인)",
                avatar="💻",
                persona="개발자 구루 (Tech Insights)",
                persona_preset="tech_guru",
                access_token="mock-token-1",
                token_status="valid",
                role="main",
                expires_in="58일 남음",
                aggro_level=2,
                emoji_preference="normal",
                line_breaks="normal",
                forbidden_keywords="가즈아, 영차",
                required_keywords="Next.js, CS근본"
            ),
            LinkedAccount(
                username="market_pulse",
                name="Market Pulse",
                avatar="📈",
                persona="투자전문가 (Market Pulse)",
                persona_preset="investor",
                access_token="mock-token-2",
                token_status="warning",
                role="booster",
                expires_in="2일 남음 (만료 임박)",
                aggro_level=3,
                emoji_preference="often",
                line_breaks="frequent",
                forbidden_keywords="장기투자, 안전성",
                required_keywords="FOMO, 수익률, 독설"
            ),
            LinkedAccount(
                username="viral_hacker",
                name="Viral Hacker",
                avatar="🎨",
                persona="마케팅 구루 (Viral Hacker)",
                persona_preset="marketer",
                access_token="mock-token-3",
                token_status="expired",
                role="booster",
                expires_in="만료됨 (재인증 필요)",
                aggro_level=2,
                emoji_preference="often",
                line_breaks="normal",
                forbidden_keywords="어려운 용어, 학술적",
                required_keywords="바이럴, 해킹, 트렌드"
            ),
            LinkedAccount(
                username="booster_alpha",
                name="Booster Alpha",
                avatar="🚀",
                persona="일반 교양/유머",
                persona_preset="general",
                access_token="mock-token-4",
                token_status="valid",
                role="booster",
                expires_in="45일 남음",
                aggro_level=1,
                emoji_preference="normal",
                line_breaks="normal",
                forbidden_keywords="극단적, 어그로",
                required_keywords="일상, 꿀팁, 공감"
            )
        ]
        for acc in mock_accs:
            session.add(acc)
        session.commit()
        accounts = session.exec(select(LinkedAccount)).all()
        
    return accounts

@router.post("/api/v1/accounts")
def create_account(req: CreateAccountRequest, session: Session = Depends(get_session)):
    statement = select(LinkedAccount).where(LinkedAccount.username == req.username)
    acc = session.exec(statement).first()
    if acc:
        raise HTTPException(status_code=400, detail="Account already linked")
        
    new_acc = LinkedAccount(
        username=req.username,
        name=req.name,
        avatar=req.avatar,
        persona=req.persona,
        persona_preset=req.persona_preset,
        access_token=req.access_token,
        role=req.role
    )
    session.add(new_acc)
    session.commit()
    session.refresh(new_acc)
    return new_acc

@router.put("/api/v1/accounts/{id}/persona")
def update_account_persona(id: int, req: UpdatePersonaRequest, session: Session = Depends(get_session)):
    acc = session.get(LinkedAccount, id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if req.name is not None: acc.name = req.name
    if req.persona is not None: acc.persona = req.persona
    if req.persona_preset is not None: acc.persona_preset = req.persona_preset
    if req.aggro_level is not None: acc.aggro_level = req.aggro_level
    if req.emoji_preference is not None: acc.emoji_preference = req.emoji_preference
    if req.line_breaks is not None: acc.line_breaks = req.line_breaks
    if req.forbidden_keywords is not None: acc.forbidden_keywords = req.forbidden_keywords
    if req.required_keywords is not None: acc.required_keywords = req.required_keywords
    
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc

@router.delete("/api/v1/accounts/{id}")
def delete_account(id: int, session: Session = Depends(get_session)):
    acc = session.get(LinkedAccount, id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    session.delete(acc)
    session.commit()
    return {"success": True}
