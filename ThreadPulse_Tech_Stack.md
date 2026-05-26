# ThreadPulse: 기술 스택 명세서 (Tech Stack Specification)

## 1. 프론트엔드 (Frontend)
* **Framework:** React (Next.js 14+ App Router 권장, SSR 및 SEO 최적화)
* **Styling:** Tailwind CSS + Shadcn UI (깔끔하고 모던한 다크모드 대시보드 인터페이스 구현)
* **State Management & Data Fetching:** TanStack Query (React Query) v5 (실시간 예약 상태 및 대시보드 실시간 동기화)
* **Deployment:** Cloudflare Pages (글로벌 엣지 네트워크 배포, 빌드 자동화 및 Edge Caching 활용)

## 2. 백엔드 (Backend)
* **Framework:** FastAPI (Python 3.11+)
    * 선정 이유: 비동기(Async/Await) 처리에 최적화되어 있어, Gemini API 및 Meta API의 동시 다발적 웹훅/요청을 최소한의 리소스로 속도 저하 없이 처리 가능. 자동 OpenAPI 문서화(Swagger) 지원.
* **Task Queue & Scheduler:** Celery + Redis 또는 APScheduler (Async 기반)
    * 목적: Meta API의 Rate Limit을 회피하기 위한 분산 발송 큐 및 Jitter(무작위 지연) 스케줄러 구현.
* **Deployment:** Cloudflare Workers 또는 AWS LightSail / VPS (독립 인스턴스)
    * 주의사항: Cloudflare Workers는 15분 이상의 롱러닝 백엔드 프로세스나 대규모 백그라운드 태스크(비동기 발송 큐) 유지가 까다로울 수 있으므로, API 서버 자체는 Cloudflare와 연동성이 뛰어난 Python 가상 서버 혹은 Workers의 Queue 아키텍처 활용 설계.

## 3. 데이터베이스 (Database)
* **Database:** Cloudflare D1 (Serverless SQL Database based on SQLite)
    * 선정 이유: Cloudflare 인프라와 네이티브하게 연동되며, 무제한에 가까운 읽기/쓰기 확장성 및 비용 효율성 극대화. Relational 데이터 모델링(유저-워크스페이스-계정-캠페인)에 최적화.
* **ORM:** SQLModel 또는 SQLAlchemy (Async)
    * D1과 FastAPI 비동기 드라이버를 매핑하여 Type-Safe한 데이터 적재 및 조회 구현.

## 4. 인공지능 엔진 (AI Engine)
* **LLM API:** Google Gemini 1.5 Pro / Flash API
    * 선정 이유: 압도적인 가성비, 초고속 추론 속도 및 강력한 프롬프트 준수 능력. 특히 `Gemini 1.5 Flash`는 카피라이팅 대량 생성 시 비용 부담을 거의 제로에 가깝게 절감 가능.
    * **System Instructions:** 다중 페르소나 매핑 및 어그로 레벨 컨트롤 팩터 주입.

## 5. 외부 연동 API
* **Meta Graph API (Threads Endpoint):** 유저 인증 및 스레드 텍스트/미디어 컨테이너 발행, 오디언스 인터랙션 데이터 수집.
