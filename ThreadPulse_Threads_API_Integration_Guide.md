# ThreadPulse: Meta Threads API 연동 완전 가이드

본 문서는 ThreadPulse에 **실제 Meta Threads API**를 연동하기 위한 **A to Z 종합 가이드**입니다.
개발자가 직접 해야 할 조작과, 이미 구현된 백엔드 로직, 그리고 실제 발행까지의 전체 흐름을 단계별로 안내합니다.

> **⚠️ 중요**: 이 문서는 2025년 최신 Meta Threads API 공식 문서를 기반으로 작성되었습니다.

---

## 📋 목차

1. [사전 준비 사항](#1-사전-준비-사항)
2. [Step 1: Meta 개발자 앱 생성](#2-step-1-meta-개발자-앱-생성)
3. [Step 2: Threads API 권한 설정](#3-step-2-threads-api-권한-설정)
4. [Step 3: OAuth 리다이렉션 URI 등록](#4-step-3-oauth-리다이렉션-uri-등록)
5. [Step 4: 앱 자격 증명 획득 및 테스터 등록](#5-step-4-앱-자격-증명-획득-및-테스터-등록)
6. [Step 5: 백엔드 환경변수 설정](#6-step-5-백엔드-환경변수-설정)
7. [Step 6: OAuth 인증 흐름 테스트](#7-step-6-oauth-인증-흐름-테스트)
8. [Step 7: 스레드 발행 테스트](#8-step-7-스레드-발행-테스트)
9. [토큰 관리 및 갱신 정책](#9-토큰-관리-및-갱신-정책)
10. [API 제한 사항 및 주의점](#10-api-제한-사항-및-주의점)
11. [백엔드 구현 아키텍처](#11-백엔드-구현-아키텍처)
12. [Cloudflare D1 데이터베이스 설정](#12-cloudflare-d1-데이터베이스-설정)
13. [프로덕션 배포 체크리스트](#13-프로덕션-배포-체크리스트)
14. [트러블슈팅 FAQ](#14-트러블슈팅-faq)

---

## 1. 사전 준비 사항

시작하기 전에 아래 항목을 확인하세요:

| 항목 | 필수 여부 | 설명 |
|------|-----------|------|
| Meta (Facebook) 계정 | ✅ 필수 | Meta 개발자 포털 로그인용 |
| Instagram 계정 | ✅ 필수 | Threads 계정은 Instagram 계정과 연동됨 |
| Threads 계정 | ✅ 필수 | 실제 발행 대상 계정 (공개 프로필 권장) |
| Threads 앱 설치 | ✅ 필수 | 모바일에서 테스터 초대 수락에 필요 |
| Python 3.10+ | ✅ 필수 | FastAPI 백엔드 실행 |
| Node.js 18+ | ✅ 필수 | Next.js 프론트엔드 실행 |

---

## 2. Step 1: Meta 개발자 앱 생성

### 2.1. Meta 개발자 포털 접속

1. **[Meta for Developers](https://developers.facebook.com)** 포털에 로그인합니다.
2. 우측 상단의 **[내 앱(My Apps)]** → **[앱 만들기(Create App)]** 버튼을 클릭합니다.

### 2.2. 앱 유형 선택

> **⚠️ 핵심**: 앱 유형 선택 화면에서 반드시 **"Access the Threads API"** 사용 사례를 선택하세요.

다른 유형(Business, Consumer 등)을 선택하면 Threads API 관련 메뉴가 노출되지 않을 수 있습니다.

### 2.3. 앱 정보 입력

| 필드 | 입력값 |
|------|--------|
| 앱 이름 | `ThreadPulse` (또는 원하는 이름) |
| 앱 연락처 이메일 | 본인 이메일 |

입력 후 **[앱 만들기]** 버튼을 클릭하면 앱 대시보드로 이동합니다.

---

## 3. Step 2: Threads API 권한 설정

앱 대시보드 좌측 메뉴에서 **[사용 사례(Use Cases)]** → **[Threads API]** → **[권한 구성(Customize)]** 으로 이동합니다.

### 3.1. 필수 권한 (Scopes)

아래 권한들을 모두 **추가(Add)** 하세요:

| 권한 (Scope) | 용도 | 필수 여부 |
|-------------|------|-----------|
| `threads_basic` | 사용자 프로필 조회, 기본 API 접근 | ✅ 필수 (모든 엔드포인트) |
| `threads_content_publish` | 스레드 게시글 자동 발행 | ✅ 필수 (타래 발행) |
| `threads_manage_replies` | 답글 작성 (연쇄 타래 발행) | ✅ 권장 |
| `threads_read_replies` | 답글 조회 | 선택 |
| `threads_manage_insights` | 게시물 분석/인사이트 조회 | 선택 (대시보드 메트릭용) |

---

## 4. Step 3: OAuth 리다이렉션 URI 등록

### 4.1. 설정 위치

좌측 메뉴 **[Threads API]** → **[설정(Settings)]** 으로 이동합니다.

### 4.2. 콜백 URI 등록

**"Redirect Callback URLs"** 영역에 아래 URL을 정확히 입력합니다:

```
개발 환경 (로컬):
http://localhost:8000/api/v1/auth/threads/callback

프로덕션 환경 (배포 후 추가):
https://your-production-domain.com/api/v1/auth/threads/callback
```

> **⚠️ 주의**: URL은 **정확히 일치**해야 합니다. 끝에 슬래시(`/`) 유무도 구분됩니다.

변경 사항을 **저장(Save)** 합니다.

---

## 5. Step 4: 앱 자격 증명 획득 및 테스터 등록

### 5.1. Threads App ID & App Secret 확인

1. 좌측 메뉴 **[앱 설정(App Settings)]** → **[기본 설정(Basic)]** 으로 이동
2. 다음 값을 복사합니다:
   - **Threads App ID** (= Client ID)
   - **Threads App Secret** (= Client Secret) — "표시" 버튼 클릭 후 복사

> **🔒 보안 주의**: App Secret은 절대 프론트엔드 코드나 Git에 커밋하지 마세요!

### 5.2. 테스터 등록 (개발 모드 필수)

앱이 **개발 모드(Development)** 상태에서는 테스터로 등록된 계정만 OAuth 인증이 가능합니다.

1. 좌측 메뉴 **[앱 역할(App Roles)]** → **[역할(Roles)]** 으로 이동
2. **[테스터 추가(Add Testers)]** 클릭
3. 연동할 Threads 계정의 **Instagram 사용자명(username)** 을 입력
4. **초대 전송(Send Invitation)**

### 5.3. 테스터 초대 수락 (✅ 반드시 필요!)

초대받은 사용자가 반드시 수락해야 합니다:

1. **Threads 앱** (모바일) 또는 **Instagram 설정** 에서 확인
2. **[설정]** → **[웹사이트 권한(Website Permissions)]** → **[초대(Invites)]**
3. **ThreadPulse** 앱의 테스터 초대를 **수락(Accept)**

> **💡 Tip**: 초대 수락을 하지 않으면 OAuth 인증 시 `error_reason=user_denied` 가 반환됩니다.

---

## 6. Step 5: 백엔드 환경변수 설정

### 6.1. `backend/.env` 파일 설정

```env
# ========================================
# Meta Threads API 자격 증명
# ========================================
# Step 4에서 획득한 값을 입력하세요
META_APP_ID=123456789012345
META_APP_SECRET=abcdef1234567890abcdef1234567890
META_REDIRECT_URI=http://localhost:8000/api/v1/auth/threads/callback

# ========================================
# Google Gemini API Key
# ========================================
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here

# ========================================
# 데이터베이스 설정
# ========================================
# 로컬 개발: SQLite 파일
DATABASE_URL=sqlite:///./threadpulse.db
DB_MODE=local

# Cloudflare D1 (프로덕션 전환 시)
# DB_MODE=d1
# CLOUDFLARE_ACCOUNT_ID=your_account_id
# CLOUDFLARE_DATABASE_ID=your_database_id
# CLOUDFLARE_API_TOKEN=your_api_token
```

### 6.2. `frontend/.env.local` 파일 설정

```env
# FastAPI 백엔드 서버 주소
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 7. Step 6: OAuth 인증 흐름 테스트

### 7.1. 서버 기동

```bash
# 터미널 1: 백엔드
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 터미널 2: 프론트엔드
cd frontend
npm run dev
```

### 7.2. OAuth 인증 흐름도

```
┌─────────────┐     ①클릭: "Threads 계정 연동"     ┌──────────────┐
│  프론트엔드   │ ─────────────────────────────────→ │  FastAPI 백엔드 │
│  (Next.js)   │                                    │  (Port 8000)   │
└─────────────┘                                     └──────┬───────┘
                                                           │
                    ②리다이렉트: Meta OAuth 인증 페이지       │
                    ┌──────────────────────────────────────┘
                    ▼
          ┌─────────────────┐
          │  Meta 인증 페이지  │  ③사용자가 "허용" 클릭
          │  (threads.net)   │
          └────────┬────────┘
                   │
    ④콜백 + Authorization Code 전달
                   │
                   ▼
          ┌──────────────────┐
          │   FastAPI 백엔드   │  ⑤Short-lived Token 교환 (1시간 유효)
          │                    │  ⑥Long-lived Token 교환 (60일 유효)
          │                    │  ⑦프로필 정보 조회 (username, name)
          │                    │  ⑧DB에 계정 정보 + 토큰 저장
          └──────────────────┘
```

### 7.3. 수동 테스트 방법

브라우저에서 직접 OAuth 흐름을 테스트할 수 있습니다:

```
http://localhost:8000/api/v1/auth/threads/login
```

이 URL을 브라우저에 입력하면 Meta 인증 페이지로 리다이렉트됩니다.
허용 후 콜백 URL로 돌아오면서 토큰 교환이 자동으로 수행됩니다.

---

## 8. Step 7: 스레드 발행 테스트

### 8.1. 연쇄 타래 발행 프로세스

```
AI 생성 텍스트 배열: ["포스트1", "포스트2", "포스트3"]
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │  POST /v1.0/{user-id}/media                       │
    │  → media_type=TEXT, text="포스트1"                  │
    │  → 컨테이너 ID 생성 → 상태 폴링(FINISHED) → 발행     │
    │  → ✅ 루트 포스트 ID 획득                             │
    ├───────────────────────────────────────────────────┤
    │  POST /v1.0/{user-id}/media                       │
    │  → media_type=TEXT, text="포스트2"                  │
    │  → reply_to_id={루트 포스트 ID}  ← 답글 연결!        │
    │  → 컨테이너 → 폴링 → 발행                           │
    ├───────────────────────────────────────────────────┤
    │  POST /v1.0/{user-id}/media                       │
    │  → media_type=TEXT, text="포스트3"                  │
    │  → reply_to_id={포스트2 ID}  ← 체인 연결!            │
    │  → 컨테이너 → 폴링 → 발행                           │
    └───────────────────────────────────────────────────┘
```

### 8.2. Swagger UI에서 직접 테스트

```
http://localhost:8000/docs
```

Swagger UI에서 `/api/v1/ai/generate` 엔드포인트로 AI 텍스트를 생성한 뒤,
해당 텍스트를 캠페인 발행 API로 전달하여 실제 Threads에 게시할 수 있습니다.

---

## 9. 토큰 관리 및 갱신 정책

### 9.1. 토큰 수명 주기

| 토큰 유형 | 유효기간 | 갱신 가능 여부 |
|-----------|---------|--------------|
| Authorization Code | 일회용 (즉시 사용) | ❌ |
| Short-lived Token | **1시간** | ❌ (Long-lived으로 교환만 가능) |
| Long-lived Token | **60일** | ✅ (만료 전 갱신 가능) |

### 9.2. 토큰 교환 API (Short → Long)

```http
GET https://graph.threads.net/access_token
  ?grant_type=th_exchange_token
  &client_secret={APP_SECRET}
  &access_token={SHORT_LIVED_TOKEN}
```

> **⚠️ 핵심 주의**: `grant_type`은 반드시 **`th_exchange_token`** 입니다!
> (`fb_exchange_token`이 아닙니다 — Threads 전용 규격)

### 9.3. 토큰 갱신 API (Long → Long 연장)

```http
GET https://graph.threads.net/refresh_access_token
  ?grant_type=th_refresh_token
  &access_token={LONG_LIVED_TOKEN}
```

**갱신 조건:**
- 토큰 발급 후 최소 **24시간 경과**해야 갱신 가능
- 토큰이 **만료되기 전**에만 갱신 가능
- 갱신 성공 시 새로운 60일짜리 토큰 발급

### 9.4. 자동 갱신 권장 전략

```
토큰 발급일         갱신 권장 시점          만료일
──────────────────────────────────────────────────
Day 0               Day 45~50             Day 60
  │                    │                     │
  ├── 24시간 후부터 ──→ │ ← 여기서 자동 갱신    │
  │   갱신 가능         │    실행 권장          │
  │                    │                     ├── 만료되면
  │                    │                     │   재인증 필요!
```

---

## 10. API 제한 사항 및 주의점

### 10.1. Rate Limits (발행 제한)

| 제한 항목 | 한도 |
|----------|------|
| 게시물 발행 | **250 posts / 24시간** (사용자당) |
| API 호출 | **200 calls / 1시간** (앱당) |

### 10.2. 발행 한도 확인 API

```http
GET https://graph.threads.net/v1.0/{user-id}/threads_publishing_limit
  ?fields=quota_usage,config
  &access_token={TOKEN}
```

### 10.3. 주의사항

- **비공개(Private) 프로필**: 비공개 프로필 사용자의 토큰은 갱신 가능하나, 90일 후 권한이 만료될 수 있음 (재인증 필요)
- **컨테이너 상태 폴링**: 미디어 컨테이너 생성 후 `FINISHED` 상태가 될 때까지 폴링 필요 (최대 60초 대기)
- **텍스트 제한**: 게시글 최대 500자 (이모지, 줄바꿈 포함)
- **앱 심사(App Review)**: 개발 모드에서는 테스터만 사용 가능. 일반 사용자에게 공개하려면 Meta 앱 심사 통과 필요

---

## 11. 백엔드 구현 아키텍처

### 11.1. 디렉토리 구조

```
backend/
├── .env                     # 환경변수 (Git에서 제외됨)
├── requirements.txt         # 의존성 라이브러리
├── config.py                # Pydantic Settings (환경변수 자동 로드)
├── database.py              # SQLite/D1 하이브리드 DB 엔진
├── models.py                # SQLModel 테이블 (User, LinkedAccount, Campaign)
├── schema.sql               # Cloudflare D1용 SQL 마이그레이션
├── main.py                  # FastAPI 앱 엔트리포인트 + CORS
├── services/
│   ├── threads_api.py       # ⭐ Meta OAuth + 연쇄 타래 발행 서비스
│   └── gemini_api.py        # ⭐ Gemini 2.5 Flash AI 카피 생성
└── routers/
    ├── auth.py              # /api/v1/auth/* — 로그인, OAuth 콜백
    ├── ai.py                # /api/v1/ai/* — AI 스레드 생성
    ├── accounts.py          # /api/v1/accounts/* — 계정 CRUD
    └── campaigns.py         # /api/v1/campaigns/* — 캠페인 CRUD
```

### 11.2. 핵심 API 엔드포인트

| Method | Endpoint | 기능 |
|--------|----------|------|
| POST | `/api/v1/auth/login` | 이메일/비밀번호 로그인 |
| GET | `/api/v1/auth/threads/login` | Meta OAuth 인증 페이지 리다이렉트 |
| GET | `/api/v1/auth/threads/callback` | OAuth 콜백 (토큰 교환 + DB 저장) |
| POST | `/api/v1/ai/generate` | AI 스레드 타래 생성 (Gemini) |
| POST | `/api/v1/campaigns/schedule` | 캠페인 예약 등록 |
| GET | `/api/v1/accounts` | 연동 계정 목록 조회 |
| PUT | `/api/v1/accounts/{id}/persona` | 페르소나 설정 수정 |
| DELETE | `/api/v1/accounts/{id}` | 계정 연동 해제 |

---

## 12. Cloudflare D1 데이터베이스 설정

### 12.1. D1 인스턴스 생성

```bash
# Wrangler CLI 로그인
npx wrangler login

# D1 데이터베이스 생성
npx wrangler d1 create threadpulse-db
```

출력되는 `database_id`를 메모합니다.

### 12.2. 스키마 마이그레이션

```bash
npx wrangler d1 execute threadpulse-db --remote --file=schema.sql
```

### 12.3. 환경변수 전환

`backend/.env`에서:
```env
DB_MODE=d1
CLOUDFLARE_ACCOUNT_ID=복사한_Account_ID
CLOUDFLARE_DATABASE_ID=복사한_Database_ID
CLOUDFLARE_API_TOKEN=생성한_API_Token
```

---

## 13. 프로덕션 배포 체크리스트

- [ ] Meta 앱 심사(App Review) 신청 및 통과
- [ ] Meta 앱을 **라이브 모드**로 전환
- [ ] 프로덕션 콜백 URL 등록 (`https://your-domain.com/api/v1/auth/threads/callback`)
- [ ] App Secret, API Key 등을 프로덕션 환경변수로 분리
- [ ] HTTPS 인증서 적용
- [ ] JWT 인증 미들웨어 실제 구현
- [ ] 토큰 자동 갱신 배경 작업(cron) 설정
- [ ] Rate Limit 모니터링 구현
- [ ] 에러 로깅 및 알림 시스템 구성

---

## 14. 트러블슈팅 FAQ

### Q1. OAuth 인증 시 "Invalid redirect_uri" 에러
→ Meta 앱 설정의 **Redirect Callback URLs**에 등록된 URL과 백엔드 `.env`의 `META_REDIRECT_URI`가 **정확히** 일치하는지 확인하세요. (끝의 `/` 유무 포함)

### Q2. "User must accept Threads tester invitation" 에러
→ 테스터 초대를 전송했더라도, 해당 사용자가 Threads 앱 설정에서 **직접 수락**해야 합니다.
→ Threads 앱 → 설정 → 웹사이트 권한 → 초대 에서 확인

### Q3. 토큰 교환 시 "Invalid grant_type" 에러
→ Threads API는 `th_exchange_token`을 사용합니다 (`fb_exchange_token`이 아님!)

### Q4. 컨테이너 상태가 계속 "IN_PROGRESS"
→ 컨테이너 상태 폴링 시 최대 60초까지 대기 후에도 `FINISHED`가 아니면 재시도하세요.
→ 텍스트에 금지된 콘텐츠가 포함되어 있을 수 있습니다.

### Q5. "Application request limit reached" 에러
→ Rate Limit 초과. 24시간 내 250개 이상의 게시물을 발행하지 않도록 주의하세요.
→ `/threads_publishing_limit` 엔드포인트로 현재 사용량을 확인하세요.
