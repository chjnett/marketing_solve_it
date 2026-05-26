# ThreadPulse

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](./backend)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-20%2B-339933)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

AI 기반 Threads(스레드) 마케팅 자동화 플랫폼입니다.  
Meta OAuth로 계정을 연동하고, AI로 생성한 타래를 예약/발행하는 흐름을 제공합니다.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Run](#run)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- Meta Threads OAuth 계정 연동
- Threads 게시글(타래) 생성 및 발행 API
- Gemini 기반 AI 카피 생성
- 계정별 페르소나/톤 설정
- 캠페인 예약 데이터 관리

## Architecture

- **Frontend**: Next.js 16 + React 19 + Tailwind + shadcn/ui
- **Backend**: FastAPI + SQLModel + httpx
- **DB**: Local SQLite (기본), Cloudflare D1 (선택)
- **External APIs**: Meta Threads API, Google Gemini API

## Project Structure

```text
workspace_marketing/
├─ frontend/         # Next.js app
├─ backend/          # FastAPI app
├─ ThreadPulse_*.md  # 기획/가이드 문서
└─ README.md
```

## Quick Start

### 1) Prerequisites

- Node.js `20+`
- Python `3.10+`
- npm `10+` (or compatible)

### 2) Clone

```bash
git clone <your-repo-url>
cd workspace_marketing
```

### 3) Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env .env.local.backup 2>/dev/null || true
```

`.env` 예시:

```env
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:8000/api/v1/auth/threads/callback

GEMINI_API_KEY=your_gemini_api_key

DATABASE_URL=sqlite:///./threadpulse.db
DB_MODE=local
ENABLE_MOCK_DATA=false

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_API_TOKEN=
```

### 4) Frontend Setup

```bash
cd ../frontend
npm install
```

`frontend/.env.local` 예시:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run

### Terminal 1: Backend

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Troubleshooting

### Meta OAuth `redirect_uri` 오류

- Meta 개발자 센터의 Redirect Callback URL과 아래 값이 정확히 일치해야 합니다.
  - `http://localhost:8000/api/v1/auth/threads/callback`
- `localhost`와 `127.0.0.1` 혼용 금지
- 앱이 Development 모드면 테스트 계정 초대/수락 필요

### 연동 버튼 클릭 후 반응 없음

- `frontend/.env.local`의 `NEXT_PUBLIC_API_URL` 확인
- 백엔드 서버 실행 상태 확인 (`:8000`)

### 게시가 `scheduled`로만 남는 경우

- 연결 계정이 실토큰인지 확인 (`mock-token` 제외)
- `threads_user_id` 저장 여부 확인

## Roadmap

- 토큰 자동 갱신 크론
- Threads 인사이트 수집
- Instagram/X 채널 확장
- D1 프로덕션 마이그레이션 정식화

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

