from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Campaign, LinkedAccount
from services.threads_api import threads_api_service
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ScheduleRequest(BaseModel):
    title: str
    text: List[str]
    time: str
    persona: str

@router.post("/api/v1/campaigns/schedule")
async def schedule_campaign(req: ScheduleRequest, session: Session = Depends(get_session)):
    try:
        # Create Campaign model
        campaign = Campaign(title=req.title, time=req.time, persona=req.persona)
        campaign.text_list = req.text
        
        session.add(campaign)
        session.commit()
        session.refresh(campaign)

        # In standard MVP, let's trigger an immediate thread chain publication
        # if the time is "오늘 즉시" or similar, or try to link with an active account in DB.
        # Find active linked account mapped to this persona preset
        statement = select(LinkedAccount).where(LinkedAccount.persona_preset == req.persona)
        account = session.exec(statement).first()
        
        if account and account.access_token and account.access_token != "mock-token":
            try:
                # Call Threads API to actually publish!
                post_id = await threads_api_service.publish_thread_chain(
                    user_id=account.username,
                    text_list=req.text,
                    access_token=account.access_token
                )
                campaign.status = "published"
                campaign.published_post_id = post_id
                session.add(campaign)
                session.commit()
                return {
                    "success": True,
                    "campaignId": campaign.id,
                    "status": "published",
                    "postId": post_id
                }
            except Exception as publish_err:
                print(f"[Threads API Publish Failed]: {publish_err}")
                campaign.status = "failed"
                campaign.error_message = str(publish_err)
                session.add(campaign)
                session.commit()
                
        # Mock Success fallback if no active live access token is connected
        return {
            "success": True,
            "campaignId": campaign.id,
            "status": "scheduled",
            "postId": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/campaigns")
def list_campaigns(session: Session = Depends(get_session)):
    campaigns = session.exec(select(Campaign)).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "text": c.text_list,
            "time": c.time,
            "persona": c.persona,
            "status": c.status,
            "postId": c.published_post_id,
            "errorMessage": c.error_message
        }
        for c in campaigns
    ]

class UpdateTimeRequest(BaseModel):
    time: str

@router.put("/api/v1/campaigns/{id}/time")
def update_campaign_time(id: int, req: UpdateTimeRequest, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.time = req.time
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return {
        "success": True,
        "id": campaign.id,
        "time": campaign.time
    }

@router.delete("/api/v1/campaigns/{id}")
def delete_campaign(id: int, session: Session = Depends(get_session)):
    campaign = session.get(Campaign, id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    session.delete(campaign)
    session.commit()
    return {"success": True}

