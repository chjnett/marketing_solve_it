# ThreadPulse: Meta Threads API 실제 연동 및 백엔드 통합 가이드

본 문서는 ThreadPulse 마케팅 자동화 SaaS 플랫폼에 **실제 Meta Graph API (Threads Endpoint)**를 연동하기 위해 설계된 종합 가이드라인입니다. 

에이전트가 자동 구축한 **FastAPI 백엔드 시스템**의 활용 방법과, API 연동을 위해 **사용자(USER)가 Meta Developer Console에서 직접 조작해야 하는 작업 리스트**를 상세히 제공합니다.

---

## 1. 사용자(USER)가 직접 진행해야 하는 사항 (Checklist for User)

Meta Graph API는 앱 심사 및 Meta 계정 소유권을 요구하므로, 아래 과정을 Meta 개발자 포털에서 직접 수행해주셔야 합니다.

### [Step 1] Meta 개발자 계정 등록 및 앱 생성
1. [Meta for Developers](https://developers.facebook.com) 포털에 로그인합니다.
2. 우측 상단의 **[내 앱]** -> **[앱 만들기]** 버튼을 클릭합니다.
3. 앱 유형 선택 화면에서 **[기타]** 또는 **[소비자]** 유형을 선택합니다.
4. 앱의 세부 정보(앱 이름: `ThreadPulse`, 이메일)를 입력하고 앱을 생성합니다.

### [Step 2] Threads API 제품 구성 및 권한 설정
1. 앱의 대시보드 좌측 메뉴에서 **[앱에 제품 추가]**를 클릭합니다.
2. **Threads API** 항목을 찾아 **[설정]** 버튼을 클릭합니다.
3. Threads API 설정 화면의 **[사용 사례]** -> **[Threads 권한 구성]**으로 이동합니다.
4. 다음 2가지 핵심 권한을 찾아 **[추가]** 또는 **[구성]**을 클릭합니다:
   - `threads_basic` : 사용자의 기본 프로필 정보 및 연동 상태 조회 권한.
   - `threads_content_publish` : 사용자를 대행하여 스레드 게시글(타래)을 자동 발행하는 권한.

### [Step 3] Threads OAuth 2.0 리다이렉션 URI 세팅
1. 좌측 메뉴의 **[Threads API]** -> **[설정]**으로 이동합니다.
2. **클라이언트 OAuth 설정** 영역에서 다음 리다이렉션 URL을 등록합니다:
   - 개발 환경 콜백: `http://localhost:8000/api/v1/auth/threads/callback`
   - (프로덕션 환경 배포 시 배포 서버 URL 추가 가능)
3. 변경 사항을 저장합니다.

### [Step 4] 앱 자격 증명(App ID & Secret) 및 테스터 등록
1. 좌측 메뉴의 **[앱 설정]** -> **[기본 설정]**으로 이동합니다.
2. 화면 상단의 **앱 ID (Client ID)**와 **앱 비밀번호 (Client Secret)**를 확인하고 복사합니다 (백엔드 `.env` 파일에 기록해야 합니다).
3. 개발 및 테스트 단계에서는 앱이 *개발 모드* 상태입니다. 따라서 연동을 테스트할 스레드 계정들을 테스터로 추가해야 합니다:
   - 좌측 메뉴의 **[역할]** -> **[앱 테스터]**로 이동합니다.
   - **[테스터 추가]**를 클릭하고 연동하고자 하는 스레드 계정의 사용자명(`username`)을 등록합니다.
   - 해당 스레드 계정으로 인스타그램 로그인 후 **[개발자 테스터 초대 수락]**을 승인해야 정상 활성화됩니다.

---

## 2. 에이전트(AI)가 구현 완료한 내역 (FastAPI Backend Core)

에이전트가 개발자님을 위해 `/backend` 디렉토리에 **Meta Graph API 연동 규격을 완벽하게 따르는 FastAPI 백엔드**를 직접 구성해 두었습니다.

### 2.1. 구현된 백엔드 핵심 컴포넌트 구조
```
backend/
├── requirements.txt         # 필수 라이브러리 (FastAPI, SQLModel, google-generativeai, httpx 등)
├── config.py                # 환경 변수 및 Meta API, Gemini Key Config
├── database.py              # Cloudflare D1 호환 SQLite 커넥터 및 세션
├── models.py                # SQLModel 기반 계정/캠페인 DB 테이블 정의
├── main.py                  # CORS 및 라우터 통합 엔트리포인트
├── services/
│   ├── threads_api.py       # ⭐️ Meta OAuth 토큰 교환 & 스레드 발행 서비스
│   └── gemini_api.py        # ⭐️ Gemini 1.5 Pro/Flash 기반 카피 생성 서비스
└── routers/
    ├── auth.py              # Meta OAuth 리다이렉션 & 토큰 수령 엔드포인트
    ├── ai.py                # AI 스레드 타래 실시간 생성 엔드포인트
    └── campaigns.py         # 캠페인 생성, 발행 및 예약 스케줄링 엔드포인트
```

### 2.2. 백엔드 동작 프로세스 (OAuth & Publishing)
1. **Meta OAuth 흐름:**
   - 사용자가 프론트엔드에서 `Meta Threads 계정 연동` 클릭 시 `/api/v1/auth/threads/login`을 호출하여 Meta Graph API 인증 창으로 리다이렉트합니다.
   - 인증 완료 후 콜백(`/api/v1/auth/threads/callback`)을 통해 메타가 내려준 **Short-lived Code**를 받아 백엔드에서 **Short-lived Access Token**으로 교환합니다.
   - 이를 다시 60일간 유효한 **Long-lived Access Token**으로 최종 교환한 뒤 데이터베이스(`LinkedAccount` 테이블)에 암호화하여 저장 보관합니다.
2. **연쇄형 타래 스레드 발행 흐름:**
   - AI 스레드 빌더에서 작성된 N개의 텍스트 배열을 전달받아 `threads_api.py` 내부의 연쇄 발행 체인이 가동됩니다:
     - **포스트 1 (루트):** 미디어 컨테이너 생성 (`POST /v1.0/{user-id}/media?text={text}`) -> 컨테이너 상태FINISHED 확인 -> 퍼블리싱 (`POST /v1.0/{user-id}/media_publish?creation_id={container-id}`) -> **루트 포스트 ID 획득**.
     - **포스트 2~N (서브 답글):** 답글 컨테이너 생성 시 부모 포스트 ID를 인젝션 (`POST /v1.0/{user-id}/media?text={text}&reply_to_id={parent-post-id}`) -> FINISHED 확인 -> 퍼블리싱 -> **연쇄 타래 완성!**

---

## 3. 환경 변수 세팅 및 서버 구동 가이드

실제 연동을 기동하기 위해 프로젝트 루트에 환경 변수(`.env`) 세팅이 필요합니다.

### 3.1. 백엔드 설정 (`backend/.env` 파일 생성)
`/backend` 디렉토리 내에 `.env` 파일을 생성하고 아래 내용을 입력합니다.
```env
# Meta App 자격 증명 (Step 4에서 획득한 값 입력)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:8000/api/v1/auth/threads/callback

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# 데이터베이스 세팅 (로컬 SQLite 파일 매핑)
DATABASE_URL=sqlite:///./threadpulse.db
```

### 3.2. 프론트엔드 설정 (`frontend/.env.local` 파일 생성)
`/frontend` 디렉토리 내에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.
```env
# 실제 API 통신 서버 주소 바인딩
NEXT_PUBLIC_API_URL=http://localhost:8000

# 리얼 API 통신 모드 활성화 (real 설정 시 Mocking을 우회하여 FastAPI 호출)
NEXT_PUBLIC_API_MODE=real
```

---

## 4. 백엔드 기동 방법

로컬 터미널을 열어 가상환경을 잡고 백엔드를 실행합니다.

1. **의존성 라이브러리 설치:**
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```
2. **서버 실행:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
3. **API 문서 확인:** `http://localhost:8000/docs` 에서 Swagger API 명세서를 통해 연동 규격을 눈으로 실시간 확인하고 테스트해 보실 수 있습니다!

---

## 5. Cloudflare D1 데이터베이스 생성 및 마이그레이션 가이드 (Production DB Setup)

실제 서비스 및 클라우드 환경에서 Cloudflare D1을 데이터베이스로 사용하기 위한 셋업 절차입니다.

### [Step 1] Cloudflare D1 데이터베이스 생성
Wrangler CLI가 이미 컴퓨터에 설치되어 있다면 다음 명령어로 간편하게 D1 데이터베이스를 생성할 수 있습니다. (혹은 Cloudflare Dashboard의 **D1** 메뉴에서 직접 만드셔도 됩니다.)

```bash
# wrangler 로그인 (인증 창이 뜨면 로그인 진행)
npx wrangler login

# D1 데이터베이스 생성 (예: 데이터베이스 이름 'threadpulse-db')
npx wrangler d1 create threadpulse-db
```

생성이 성공하면 터미널에 아래와 같은 설정값이 출력됩니다:
```toml
[[d1_databases]]
binding = "DB"
database_name = "threadpulse-db"
database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
여기서 **`database_id`**를 백엔드 `.env` 파일의 `CLOUDFLARE_DATABASE_ID`에 사용하게 됩니다.

### [Step 2] D1 스키마 마이그레이션 실행
백엔드 루트 디렉토리에 정의된 `schema.sql` 파일을 실행하여 원격 D1 데이터베이스에 필요한 테이블 스키마를 초기화합니다.

```bash
# 원격(Production) D1 데이터베이스에 테이블 생성 실행
npx wrangler d1 execute threadpulse-db --remote --file=schema.sql
```
이 과정을 통해 Cloudflare 클라우드 상의 D1 데이터베이스에 `User`, `LinkedAccount`, `Campaign` 테이블이 즉시 생성됩니다.

### [Step 3] Cloudflare API 토큰 및 계정 정보 획득
1. **Account ID**: Cloudflare 대시보드 메인 화면의 우측 하단에서 **Account ID**를 복사합니다.
2. **API Token 생성**:
   - [Cloudflare API 토큰 관리 페이지](https://dash.cloudflare.com/profile/api-tokens)로 이동합니다.
   - **[토큰 생성]** -> **[커스텀 토큰 생성]**을 누릅니다.
   - 토큰 이름(예: `ThreadPulse D1 Access`)을 지정합니다.
   - 권한 설정에서 **[계정]** -> **[D1]** -> **[편집]** 권한을 부여합니다.
   - 토큰을 최종 생성하고 생성된 API Token 키값을 안전하게 복사해둡니다.

### [Step 4] 백엔드 설정 환경변수 반영 (`backend/.env`)
이제 획득한 자격증명을 백엔드 설정 파일에 반영하고, 모드를 `d1`로 전환합니다.

```env
# Database Mode Toggle: 'local' (SQLite 로컬 파일) -> 'd1' (클라우드플레어 D1 실물 데이터베이스)
DB_MODE=d1

# Cloudflare D1 연동 정보
CLOUDFLARE_ACCOUNT_ID=복사한_Cloudflare_Account_ID
CLOUDFLARE_DATABASE_ID=복사한_D1_Database_ID
CLOUDFLARE_API_TOKEN=생성한_Cloudflare_API_Token
```

설정을 저장한 뒤 백엔드 서버(`uvicorn main:app --reload --port 8000`)를 재기동하면, 이제 모든 데이터 적재(사용자 정보, 연동 계정, 예약 캠페인 등)가 로컬 파일이 아닌 **Cloudflare D1 클라우드 데이터베이스에 직접 실시간으로 저장 및 조회**됩니다!
