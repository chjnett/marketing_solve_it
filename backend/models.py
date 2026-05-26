from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
import json

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password_hash: str

class LinkedAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    threads_user_id: Optional[str] = Field(default=None, index=True)
    username: str = Field(unique=True)
    name: str
    avatar: str = "💻"
    persona: str = "개발자 구루"
    persona_preset: str = "tech_guru" # tech_guru, investor, marketer, general
    access_token: str                  # Encrypted or raw long-lived access token
    token_status: str = "valid"         # valid, warning, expired
    role: str = "booster"               # main, booster
    expires_in: str = "60일 남음"
    
    # Tone tuning
    aggro_level: int = 2
    emoji_preference: str = "normal"   # often, normal, none
    line_breaks: str = "normal"        # frequent, normal, rare
    forbidden_keywords: str = ""
    required_keywords: str = ""

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    text_json: str                     # Store list of strings as JSON serialized string
    time: str
    persona: str
    status: str = "scheduled"           # scheduled, published, failed
    published_post_id: Optional[str] = None
    error_message: Optional[str] = None

    @property
    def text_list(self) -> List[str]:
        try:
            return json.loads(self.text_json)
        except Exception:
            return []

    @text_list.setter
    def text_list(self, val: List[str]):
        self.text_json = json.dumps(val)
