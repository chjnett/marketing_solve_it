from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import LinkedAccount
from services.gemini_api import gemini_api_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class GenerateRequest(BaseModel):
    topic: str
    persona: str  # tech_guru, investor, marketer, general
    level: int = 2
    reference_style: Optional[dict] = None  # From analyze-reference response

class AnalyzeReferenceRequest(BaseModel):
    images: List[str]  # Base64 encoded image strings (max 5)
    analysis_mode: str = "full"  # "ocr_only" | "style_only" | "full"

@router.post("/api/v1/ai/generate")
async def generate_copy(req: GenerateRequest, session: Session = Depends(get_session)):
    print("\n" + "="*60)
    print(f"[FastAPI Router] 🚀 Inbound POST /api/v1/ai/generate received!")
    print(f"[FastAPI Router]  - Topic: '{req.topic}'")
    print(f"[FastAPI Router]  - Persona Preset: '{req.persona}'")
    print(f"[FastAPI Router]  - Controversy Level: {req.level}")
    print("="*60)

    try:
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
        print("="*60 + "\n")
        return threads_list
    except Exception as e:
        print(f"[FastAPI Router] 💥 EXCEPTION occurred in generate_copy endpoint: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/analyze-reference")
async def analyze_reference_endpoint(req: AnalyzeReferenceRequest):
    print("\n" + "="*60)
    print(f"[FastAPI Router] 🔍 Inbound POST /api/v1/ai/analyze-reference received!")
    print(f"[FastAPI Router]  - Images count: {len(req.images)}")
    print(f"[FastAPI Router]  - Analysis Mode: '{req.analysis_mode}'")
    print("="*60)

    if not req.images:
        raise HTTPException(status_code=400, detail="이미지를 최소 1장 이상 업로드해주세요.")
    if len(req.images) > 5:
        raise HTTPException(status_code=400, detail="이미지는 최대 5장까지 업로드 가능합니다.")
    if req.analysis_mode not in ("ocr_only", "style_only", "full"):
        raise HTTPException(status_code=400, detail="analysis_mode는 'ocr_only', 'style_only', 'full' 중 하나여야 합니다.")

    try:
        print(f"[FastAPI Router] 📡 Calling gemini_api_service.analyze_reference_images...")
        result = await gemini_api_service.analyze_reference_images(
            images_base64=req.images,
            analysis_mode=req.analysis_mode
        )
        if result.get("error"):
            print(f"[FastAPI Router] ⚠️ Analysis returned error: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        print(f"[FastAPI Router] 🎉 Analysis complete! Mode: {req.analysis_mode}")
        print("="*60 + "\n")
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FastAPI Router] 💥 EXCEPTION in analyze_reference_endpoint: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/ai/generate-card-news")
async def generate_card_news_endpoint(req: GenerateRequest, session: Session = Depends(get_session)):
    print("\n" + "="*60)
    print(f"[FastAPI Router] 🚀 Inbound POST /api/v1/ai/generate-card-news received!")
    print(f"[FastAPI Router]  - Topic: '{req.topic}'")
    print(f"[FastAPI Router]  - Persona Preset: '{req.persona}'")
    print(f"[FastAPI Router]  - Controversy Level: {req.level}")
    print(f"[FastAPI Router]  - Reference Style: {'✅ Provided' if req.reference_style else '❌ None'}")
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
            required=required,
            reference_style=req.reference_style
        )
        print(f"[FastAPI Router] 🎉 Success! Service returned {len(card_news_list)} cards.")
        print("="*60 + "\n")
        return card_news_list
    except Exception as e:
        print(f"[FastAPI Router] 💥 EXCEPTION occurred in generate_card_news_endpoint: {e}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))
