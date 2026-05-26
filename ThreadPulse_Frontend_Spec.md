# ThreadPulse: 프론트엔드 기능 명세서 (Frontend Functional Specification)

본 문서는 프론트엔드와 백엔드 개발을 완전히 분리(Decoupling)하여 진행하기 위해, 프론트엔드 영역에서 반드시 구현해야 할 화면별 핵심 기능, API 연동 포인트, 인터랙션 요구사항을 정의한 명세서입니다.

## 1. 페이지 라우팅 및 화면별 구현 기능 (Page Routing & Features)

### 1.1. 퍼블릭 페이지 (Public Pages)
*   **`/` (Landing Page):**
    *   **기능:** 서비스 첫인상을 결정하는 마케팅 페이지. 회원가입/로그인으로 유도하는 CTA(Call to Action) 버튼 배치.
    *   **인터랙션:** Framer Motion을 활용한 부드러운 스크롤 애니메이션(Fade-up) 및 shadcn/ui 기반의 다크 모드 프리미엄 카드 UI(마우스 호버 시 글로우 효과 및 배경 블러 변조) 구현.
*   **`/login` & `/register` (Auth):**
    *   **기능:** 이메일/비밀번호 기반 로그인 및 회원가입 폼.
    *   **기술:** Zod + React Hook Form을 활용한 실시간 유효성 검사.
    *   **보안:** 백엔드에서 반환된 JWT Access Token을 HttpOnly 쿠키(또는 Local Storage)에 안전하게 저장 및 세션 관리.

### 1.2. 대시보드 (Protected Pages - 로그인 후 접근)
*   **`/dashboard` (Main Dashboard):**
    *   **기능:** 워크스페이스 요약 현황판. 진행 중인 캠페인 상태(성공, 대기, 실패) 요약.
    *   **차트 렌더링:** Recharts 등의 라이브러리를 활용하여 일자별 도달수/반응수 라인 차트 구현.
*   **`/dashboard/accounts` (계정 연동 관리):**
    *   **기능:** Meta OAuth를 통한 스레드(Threads) 계정 연동 및 관리.
    *   **UI:** 연동된 계정의 프로필 이미지, 닉네임, 할당된 페르소나(예: 투자전문가, 개발자)를 표시하는 카드 리스트 렌더링. 토큰 만료 시 경고 배지(Badge) 노출.
*   **`/dashboard/builder` (AI 스레드 빌더 - ⭐️ 핵심 화면):**
    *   **구조:** Resizable 컴포넌트를 활용한 50:50 좌우 분할 편집 화면 (Split View).
    *   **좌측 (Control Panel):**
        *   발행 주제 및 키워드 입력 필드 (Input).
        *   어그로 레벨(1~4단계) 조절 (Slider).
        *   답글로 달릴 서브 계정(교차 부스팅용) 및 페르소나 선택 (Select).
        *   톤앤매너 설정 (Toggle Group).
    *   **우측 (Live Preview):**
        *   API 통신 중 로딩 상태(Skeleton UI 뼈대 또는 스피너) 처리.
        *   모바일 기기 프레임 테두리를 적용하여 인앱 피드 환경을 실시간 모킹(Mocking)하며 렌더링. 텍스트 직접 수정(Edit) 모드 지원.
*   **`/dashboard/calendar` (스케줄링 캘린더):**
    *   **기능:** 발행 예약된 타래 목록을 달력 형태로 시각화. 불필요한 테두리와 격자선을 최소화한 심리스(Seamless) 디자인.
    *   **인터랙션:** Framer Motion 혹은 외부 드래그앤드롭 라이브러리를 연동하여, 생성된 캠페인 카드를 달력 내 날짜 간 드래그앤드롭으로 직관적 스케줄링 조정 (수정 즉시 백엔드 API 호출).

---

## 2. 프론트엔드 핵심 기술 및 상태 관리 요구사항

### 2.1. 서버 상태 관리 (Data Fetching & Caching)
*   **TanStack Query (React Query) v5 도입:**
    *   단순 fetch API 호출이 아닌, 데이터 캐싱, 백그라운드 동기화, 로딩/에러 상태 관리를 자동화하기 위해 필수적으로 사용합니다.
    *   예: AI 카피라이팅 요청 중 `isPending` 상태일 때 프론트엔드에서 화려한 로딩 애니메이션을 띄움.

### 2.2. 클라이언트 전역 상태 관리 (Client Global State)
*   **Zustand 또는 React Context API:**
    *   현재 선택된 '워크스페이스 ID', '사이드바 접힘/펼침 상태', '테마(Dark/Light)' 등 브라우저 단에서 기억해야 하는 가벼운 상태들을 전역으로 관리.

### 2.3. 백엔드 연동이 필요한 주요 API 인터페이스 설계
프론트엔드 개발자는 백엔드(FastAPI) 개발자와 맞추기 위해 아래와 같은 API 호출 래퍼(Wrapper) 함수들을 구현해야 합니다.

1.  `POST /api/v1/auth/login` : 사용자 인증 및 토큰 발급
2.  `GET /api/v1/meta/auth/url` : Meta 로그인 팝업을 띄우기 위한 URL 요청
3.  `POST /api/v1/ai/generate` : AI에게 텍스트 생성 요청
    *   Req Body 예시: `{ "topic": "AI 시장 전망", "persona": "TECH_GURU", "level": 3 }`
4.  `POST /api/v1/campaigns/schedule` : 확정된 텍스트와 예약 시간을 DB로 전송 (Jitter 처리는 백엔드가 알아서 수행)

---

## 3. UI/UX 디테일 및 컴포넌트 구조화 (Architecture)

### 3.1. 컴포넌트 폴더 구조 (예시)
*   `components/ui/`: shadcn/ui 기반 원자성 컴포넌트 (Button, Input, Card, Sheet 등)
*   `components/layout/`: 사이드바(Sidebar), 헤더 등 공통 레이아웃
*   `components/builder/`: AI 스레드 빌더 화면 전용 복합 컴포넌트 (미리보기 모바일 프레임, 컨트롤 폼 등)

### 3.2. 마이크로 인터랙션 구현 (프리미엄 체감 요소)
*   **Toast 알림 (Sonner 라이브러리 추천):** API 통신 성공/실패 시 화면 우측 하단에 다크 모드 감성의 깔끔한 팝업 알림 표시.
*   **Hover Animations:** 주요 상호작용 컴포넌트(Card, Button) 호버 시 미세한 외곽선 글로우 효과 및 은은한 백그라운드 블러 변조 적용 (`transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`).
*   **High-Density Wireframing:** 플레이스홀더를 배제하고, 실제 마케팅/운영 데이터 스트링과 밀도 높은 비주얼 에셋을 기본 탑재.
