import httpx
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from config import settings

# Create engine dynamically based on DB_MODE
if getattr(settings, "DB_MODE", "local") == "d1":
    if not settings.CLOUDFLARE_ACCOUNT_ID or not settings.CLOUDFLARE_DATABASE_ID or not settings.CLOUDFLARE_API_TOKEN:
        print("[ThreadPulse Database] WARNING: Cloudflare D1 credentials are not fully configured in backend/.env. Falling back to local SQLite.")
        connect_args = {"check_same_thread": False}
        engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
    else:
        # Format: cloudflare_d1://account_id:api_token@database_id
        db_url = f"cloudflare_d1://{settings.CLOUDFLARE_ACCOUNT_ID}:{settings.CLOUDFLARE_API_TOKEN}@{settings.CLOUDFLARE_DATABASE_ID}"
        print(f"[ThreadPulse Database] Initializing native Cloudflare D1 Connection: {settings.CLOUDFLARE_DATABASE_ID}")
        engine = create_engine(db_url)
else:
    connect_args = {"check_same_thread": False}
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

def init_db():
    # Only run automatic table creation for local SQLite to avoid HTTP latency at startup.
    # Cloudflare D1 tables should be created via wrangler migrations as per guide.
    if getattr(settings, "DB_MODE", "local") == "local":
        print("[ThreadPulse Database] Creating local SQLite tables if not exist...")
        SQLModel.metadata.create_all(engine)
        # Backfill for existing local DBs created before threads_user_id was introduced.
        with engine.begin() as conn:
            cols = conn.execute(text("PRAGMA table_info(LinkedAccount)")).fetchall()
            col_names = {c[1] for c in cols}
            if "threads_user_id" not in col_names:
                conn.execute(text("ALTER TABLE LinkedAccount ADD COLUMN threads_user_id TEXT"))
                print("[ThreadPulse Database] Added LinkedAccount.threads_user_id column for compatibility.")
    else:
        print("[ThreadPulse Database] D1 Cloud Mode Active: Skipping local table auto-creation.")

def get_session():
    with Session(engine) as session:
        yield session

class CloudflareD1RESTClient:
    """
    An advanced client to query the remote Cloudflare D1 cloud database directly over HTTP.
    Useful for production administration and executing remote queries directly on the cloud instance.
    """
    def __init__(self):
        self.account_id = settings.CLOUDFLARE_ACCOUNT_ID
        self.database_id = settings.CLOUDFLARE_DATABASE_ID
        self.token = settings.CLOUDFLARE_API_TOKEN
        self.url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/d1/database/{self.database_id}/query"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    async def execute_query(self, sql: str, params: list = []) -> dict:
        if not self.account_id or not self.database_id or not self.token:
            raise Exception("Cloudflare D1 credentials are not fully configured in backend/.env")
            
        async with httpx.AsyncClient() as client:
            payload = {
                "sql": sql,
                "params": params
            }
            res = await client.post(self.url, json=payload, headers=self.headers)
            if res.status_code != 200:
                raise Exception(f"Cloudflare D1 API Query Failed: {res.text}")
            return res.json()

d1_rest_client = CloudflareD1RESTClient()
