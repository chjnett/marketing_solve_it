# ThreadPulse: 데이터베이스 스키마 정의서 (Database Schema Definition)

본 문서는 Cloudflare D1 (SQLite 기반)에 구축될 관계형 데이터베이스 명세서이다. 모든 ID 체계는 분산 환경에 최적화된 UUIDv4 문자열 형식을 채택한다.

## 1. ERD 테이블 구조 명세

### 1.1. `users` (사용자 테이블)
SaaS 가입 기본 유저 정보 및 메인 인증 상태를 보관한다.
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                  -- UUID v4
    email TEXT UNIQUE NOT NULL,           -- 이메일 주소
    password_hash TEXT NOT NULL,         -- 비밀번호 해시
    plan_type TEXT DEFAULT 'FREE',        -- FREE, PRO, GROWTH
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2. `workspaces` (워크스페이스 테이블)
한 명의 유저가 여러 마케팅 브랜드/채널을 분리하여 관리할 수 있는 가상 공간.
```sql
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,                  -- UUID v4
    user_id TEXT NOT NULL,                -- FK: users.id
    name TEXT NOT NULL,                   -- 워크스페이스 명칭
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 1.3. `connected_accounts` (연동된 Threads 계정 테이블)
Meta OAuth 2.0을 통해 획득한 각 스레드 계정의 API 인증 정보 및 관리 페르소나 정보를 관리한다.
```sql
CREATE TABLE connected_accounts (
    id TEXT PRIMARY KEY,                  -- UUID v4
    workspace_id TEXT NOT NULL,            -- FK: workspaces.id
    threads_user_id TEXT UNIQUE NOT NULL, -- Meta API 제공 고유 계정 고유 ID
    threads_username TEXT NOT NULL,       -- 스레드 실 사용자 이름 (예: @marketing_bot)
    account_alias TEXT,                   -- 대시보드 식별용 별칭 (예: [주식] 독설가 1호)
    profile_picture_url TEXT,             -- 프로필 이미지 주소
    access_token TEXT NOT NULL,           -- Meta API 호출 토큰 (AES-256 암호화 권장)
    persona_type TEXT NOT NULL,           -- STOCK_CONTROVERSY, DEV_PRAGMATIC 등
    status TEXT DEFAULT 'ACTIVE',          -- ACTIVE, EXPIRED, SUSPENDED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
```

### 1.4. `post_campaigns` (발행 캠페인/스케줄 테이블)
스레드에 발행할 최상위 타래 묶음 단위의 마케팅 스케줄링 데이터.
```sql
CREATE TABLE post_campaigns (
    id TEXT PRIMARY KEY,                  -- UUID v4
    workspace_id TEXT NOT NULL,            -- FK: workspaces.id
    title TEXT NOT NULL,                   -- 캠페인 관리 이름
    status TEXT DEFAULT 'DRAFT',          -- DRAFT, SCHEDULED, PROCESSING, COMPLETED, FAILED
    scheduled_at DATETIME NOT NULL,       -- 유저가 지정한 목표 발행 일시
    actual_published_at DATETIME,         -- Jitter 연산 후 실제 발행 완료된 일시
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
```

### 1.5. `post_items` (개별 타래 구성 요소 테이블)
하나의 캠페인(타래)을 이루는 개별 스레드 텍스트 포스트 목록.
```sql
CREATE TABLE post_items (
    id TEXT PRIMARY KEY,                  -- UUID v4
    campaign_id TEXT NOT NULL,             -- FK: post_campaigns.id
    account_id TEXT NOT NULL,              -- FK: connected_accounts.id
    content_text TEXT NOT NULL,           -- Gemini가 생성한 본문 카피 (최대 500자 가드)
    sequence_order INTEGER NOT NULL,      -- 타래 순서 (1 = 첫 번째 Hook 글, 2 = 본문, 3 = CTA 등)
    meta_container_id TEXT,               -- Meta API 1단계 검증 컨테이너 ID
    threads_post_id TEXT,                 -- Meta API 최종 발행 완료 후 리턴된 실 포스트 고유 ID
    status TEXT DEFAULT 'PENDING',        -- PENDING, SUCCESS, FAILED
    error_message TEXT,                   -- 실패 시 에러 백로그 기록
    FOREIGN KEY (campaign_id) REFERENCES post_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE
);
```

### 1.6. `boosting_logs` (자가 교차 부스팅 로그 테이블)
초동 반응 유도를 위해 서브 계정들이 메인 계정에 남긴 댓글/인용 매크로 히스토리 데이터.
```sql
CREATE TABLE boosting_logs (
    id TEXT PRIMARY KEY,
    parent_post_item_id TEXT NOT NULL,     -- FK: post_items.id (부스팅 대상 메인 글)
    boosting_account_id TEXT NOT NULL,     -- FK: connected_accounts.id (댓글 다는 서브 계정)
    scenario_role TEXT NOT NULL,          -- CRITIC(비판자), SUPPORTER(동조자) 등
    reply_text TEXT NOT NULL,             -- Gemini 생성 부스팅 댓글 본문
    meta_container_id TEXT,
    threads_reply_id TEXT,
    status TEXT DEFAULT 'PENDING',
    triggered_at DATETIME NOT NULL,       -- 타임 가드가 반영된 실행 목표 시각
    FOREIGN KEY (parent_post_item_id) REFERENCES post_items(id) ON DELETE CASCADE,
    FOREIGN KEY (boosting_account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE
);
```
