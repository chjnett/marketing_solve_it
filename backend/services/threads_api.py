import httpx
import asyncio
from typing import List, Optional
from urllib.parse import urlencode
from config import settings

class ThreadsAPIService:
    def __init__(self):
        self.graph_url = "https://graph.threads.net/v1.0"
        self.oauth_url = "https://threads.net/oauth"

    def get_authorization_url(self) -> str:
        """Step 1: Generate Meta Graph API OAuth Redirect Authorization URL"""
        params = {
            "client_id": settings.META_APP_ID,
            "redirect_uri": settings.META_REDIRECT_URI,
            "scope": "threads_basic,threads_content_publish",
            "response_type": "code"
        }
        query = urlencode(params)
        return f"{self.oauth_url}/authorize?{query}"

    async def exchange_code_for_token(self, code: str) -> dict:
        """Step 2 & 3: Exchange Auth Code for Short-Lived, then Long-Lived Access Token"""
        async with httpx.AsyncClient() as client:
            # 2.1. Exchange short-lived token
            token_url = "https://graph.threads.net/oauth/access_token"
            data = {
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "grant_type": "authorization_code",
                "redirect_uri": settings.META_REDIRECT_URI,
                "code": code
            }
            res = await client.post(token_url, data=data)
            if res.status_code != 200:
                raise Exception(f"Failed to exchange short-lived token: {res.text}")
            
            short_token_data = res.json()
            short_token = short_token_data.get("access_token")
            user_id = short_token_data.get("user_id")

            # 2.2. Exchange for long-lived token (60 days)
            # ⚠️ Threads API uses 'th_exchange_token' (NOT 'fb_exchange_token')
            exchange_url = "https://graph.threads.net/access_token"
            params = {
                "grant_type": "th_exchange_token",
                "client_secret": settings.META_APP_SECRET,
                "access_token": short_token
            }
            res_long = await client.get(exchange_url, params=params)
            if res_long.status_code != 200:
                # Fallback to short-lived token if long-lived exchange fails in dev environments
                return {
                    "access_token": short_token,
                    "user_id": user_id,
                    "expires_in": 3600
                }
            
            long_token_data = res_long.json()
            return {
                "access_token": long_token_data.get("access_token"),
                "user_id": user_id,
                "expires_in": long_token_data.get("expires_in", 5184000)
            }

    async def refresh_long_lived_token(self, long_lived_token: str) -> dict:
        """Refresh a long-lived token (must be >24h old and not yet expired) for another 60 days"""
        async with httpx.AsyncClient() as client:
            url = "https://graph.threads.net/refresh_access_token"
            params = {
                "grant_type": "th_refresh_token",
                "access_token": long_lived_token
            }
            res = await client.get(url, params=params)
            if res.status_code != 200:
                raise Exception(f"Failed to refresh token: {res.text}")
            
            data = res.json()
            return {
                "access_token": data.get("access_token"),
                "expires_in": data.get("expires_in", 5184000)
            }

    async def get_user_profile(self, user_id: str, access_token: str) -> dict:
        """Fetch user profile details (username, name) from Threads Graph API"""
        async with httpx.AsyncClient() as client:
            url = f"{self.graph_url}/{user_id}"
            params = {
                "fields": "id,username,name,threads_profile_picture_url",
                "access_token": access_token
            }
            res = await client.get(url, params=params)
            if res.status_code != 200:
                # Mock return for offline testing if API is unreachable
                return {
                    "username": f"threads_user_{user_id}",
                    "name": "Threads Creator",
                    "avatar": "💻"
                }
            data = res.json()
            return {
                "username": data.get("username"),
                "name": data.get("name", "Threads Creator"),
                "avatar": data.get("threads_profile_picture_url", "💻")
            }

    async def publish_single_post(
        self, 
        user_id: str, 
        text: str, 
        access_token: str, 
        reply_to_id: Optional[str] = None
    ) -> str:
        """Create media container, poll status, publish post on Meta Threads"""
        async with httpx.AsyncClient() as client:
            # 1. Create Media Container
            container_url = f"{self.graph_url}/{user_id}/media"
            params = {
                "media_type": "TEXT",
                "text": text,
                "access_token": access_token
            }
            if reply_to_id:
                params["reply_to_id"] = reply_to_id
                
            res = await client.post(container_url, params=params)
            if res.status_code != 200:
                raise Exception(f"Failed to create media container: {res.text}")
            
            container_id = res.json().get("id")

            # 2. Poll Status (Threads API requires verification container is ready)
            poll_url = f"{self.graph_url}/{container_id}"
            poll_params = {
                "fields": "status_code",
                "access_token": access_token
            }
            
            for _ in range(12): # Try for 60 seconds
                poll_res = await client.get(poll_url, params=poll_params)
                if poll_res.status_code == 200:
                    status = poll_res.json().get("status_code")
                    if status == "FINISHED":
                        break
                    elif status == "ERROR":
                        raise Exception("Container creation failed on Meta server.")
                await asyncio.sleep(5)
            
            # 3. Publish Container
            publish_url = f"{self.graph_url}/{user_id}/media_publish"
            publish_params = {
                "creation_id": container_id,
                "access_token": access_token
            }
            pub_res = await client.post(publish_url, params=publish_params)
            if pub_res.status_code != 200:
                raise Exception(f"Failed to publish container: {pub_res.text}")
                
            return pub_res.json().get("id")

    async def publish_thread_chain(
        self, 
        user_id: str, 
        text_list: List[str], 
        access_token: str
    ) -> str:
        """Publish a list of texts sequentially as a connected thread (타래)"""
        if not text_list:
            raise Exception("Empty post text list")

        # 1. Publish Root Post
        root_post_id = await self.publish_single_post(user_id, text_list[0], access_token)
        
        # 2. Publish Subsequent replies connected to root/parent
        parent_id = root_post_id
        for text in text_list[1:]:
            # Threads API links replies by passing the previous post id to reply_to_id
            parent_id = await self.publish_single_post(user_id, text, access_token, reply_to_id=parent_id)
            
        return root_post_id

threads_api_service = ThreadsAPIService()
