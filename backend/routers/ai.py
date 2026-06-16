from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import LinkedAccount
from services.gemini_api import gemini_api_service
from pydantic import BaseModel

router = APIRouter()

class GenerateRequest(BaseModel):
    topic: str
    persona: str # tech_guru, investor, marketer, general
    level: int = 2

@router.post("/api/v1/ai/generate")
async def generate_copy(req: GenerateRequest, session: Session = Depends(get_session)):
    print("\n" + "="*60)
    print(f"[FastAPI Router] 🚀 Inbound POST /api/v1/ai/generate received!")
    print(f"[FastAPI Router]  - Topic: '{req.topic}'")
    print(f"[FastAPI Router]  - Persona Preset: '{req.persona}'")
    print(f"[FastAPI Router]  - Controversy Level: {req.level}")
    print("="*60)

    try:
        # Check if there's a custom account in the DB with tone settings matching this persona
        print("[FastAPI Router] 🔍 Querying database for custom tone settings mapping to preset...")
        statement = select(LinkedAccount).where(LinkedAccount.persona_preset == req.persona)
        account = session.exec(statement).first()
        
        if account:
            forbidden = account.forbidden_keywords
            required = account.required_keywords
            print(f"[FastAPI Router] ✅ Match found! Custom DB Config - Forbidden: '{forbidden}', Required: '{required}'")
        else:
            forbidden = ""
            required = ""
            print("[FastAPI Router] ℹ️ No custom DB config found for this persona. Using defaults.")

        print("[FastAPI Router] 📡 Calling gemini_api_service.generate_social_thread...")
        threads_list = await gemini_api_service.generate_social_thread(
            topic=req.topic,
            preset=req.persona,
            level=req.level,
            forbidden=forbidden,
            required=required
        )
        print(f"[FastAPI Router] 🎉 Success! Service returned {len(threads_list)} threads.")
        print(f"[FastAPI Router] 📥 Payload returned to client: {threads_list}")
        print("="*60 + "\n")
        return threads_list
    except Exception as e:
        print(f"[FastAPI Router] 💥 EXCEPTION occurred in generate_copy endpoint: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/ai/generate-card-news")
async def generate_card_news_endpoint(req: GenerateRequest, session: Session = Depends(get_session)):
    print("\n" + "="*60)
    print(f"[FastAPI Router] 🚀 Inbound POST /api/v1/ai/generate-card-news received!")
    print(f"[FastAPI Router]  - Topic: '{req.topic}'")
    print(f"[FastAPI Router]  - Persona Preset: '{req.persona}'")
    print(f"[FastAPI Router]  - Controversy Level: {req.level}")
    print("="*60)

    try:
        statement = select(LinkedAccount).where(LinkedAccount.persona_preset == req.persona)
        account = session.exec(statement).first()
        
        if account:
            forbidden = account.forbidden_keywords
            required = account.required_keywords
            print(f"[FastAPI Router] ✅ Match found! Custom DB Config - Forbidden: '{forbidden}', Required: '{required}'")
        else:
            forbidden = ""
            required = ""
            print("[FastAPI Router] ℹ️ No custom DB config found for this persona. Using defaults.")

        print("[FastAPI Router] 📡 Calling gemini_api_service.generate_card_news...")
        card_news_list = await gemini_api_service.generate_card_news(
            topic=req.topic,
            preset=req.persona,
            level=req.level,
            forbidden=forbidden,
            required=required
        )
        print(f"[FastAPI Router] 🎉 Success! Service returned {len(card_news_list)} cards.")
        print(f"[FastAPI Router] 📥 Payload returned to client: {card_news_list}")
        print("="*60 + "\n")
        return card_news_list
    except Exception as e:
        print(f"[FastAPI Router] 💥 EXCEPTION occurred in generate_card_news_endpoint: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))
