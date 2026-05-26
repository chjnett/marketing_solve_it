import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, ai, campaigns, accounts

app = FastAPI(
    title="ThreadPulse Core API Backend",
    description="Meta Graph Threads API & Gemini AI Omnichannel Social Marketing Automation Server",
    version="1.0.0"
)

# Configure CORS for local Next.js frontend (highly stable explicit dev loopbacks)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# Initialize D1 SQLite tables at launch
@app.on_event("startup")
def on_startup():
    init_db()
    print("[ThreadPulse Database] Cloudflare D1 Local SQLite tables initialized successfully.")

# Mount routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(accounts.router, tags=["Linked Accounts"])
app.include_router(ai.router, tags=["AI Generative Engine"])
app.include_router(campaigns.router, tags=["Campaign Scheduler"])


@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "ThreadPulse Omnichannel social marketing automation server"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
