# ThreadPulse: 다중 페르소나 기반 Threads 바이럴 마케팅 SaaS 제품 기획서

## 1. 시스템 개요 (System Overview)
본 시스템은 **Meta Threads API**를 활용하여 사용자가 설정한 다중 페르소나(Persona)에 맞춰 바이럴 콘텐츠를 자동 생성, 예약 및 교차 반응(Cross-Engagement) 시키는 트래픽 빌딩 마케팅 SaaS 플랫폼이다. 스레드 생태계의 빠른 초기 트래픽 유입 속도를 극대화하고, 알고리즘 피드를 점령할 수 있는 최적의 바이럴 툴을 지향한다.

---

## 2. 핵심 프론트엔드 5대 화면 기획 명세 (UI/UX Specification)

### 2.1. 계정 연동 및 페르소나 설정 창 (Workspace & Connections)
* **목적:** 복수의 스레드 계정을 등록하고, 각 계정에 AI 마케팅 정체성을 부여하는 공간.
* **핵심 키워드:**
    * `Meta OAuth 2.0`: 공식 API 기반의 안전하고 영속적인 다중 계정 연동 프로세스 제공.
    * `계정 별칭 (Alias)`: 복잡한 스레드 사용자 이름(`@stock_trader_99_kr`) 외에 직관적인 관리용 닉네임(`[주식] 독설가 1호`) 지정 기능.
    * `페르소나 프리셋 (Persona Preset)`: 주식/투자(독설가, FOMO 자극), 개발자/테크(팩트 폭행, CS 근본론자) 등 카테고리별 맞춤형 LLM 템플릿 매핑.
    * `어휘 커스텀 (Tone Tuning)`: 계정별 개별 줄바꿈 빈도, 선호 이모지 프리셋, 금지어 및 필수 포함 키워드 사전 세팅.

### 2.2. AI 스레드 빌더 및 어그로 제어 창 (AI Thread Builder)
* **목적:** AI를 통해 후킹력이 극대화된 연쇄형 타래(Thread) 콘텐츠를 제작하고 편집하는 작업대.
* **핵심 키워드:**
    * `어그로 지수 슬라이더 (Controversy Level)`: 순한맛(정보성 공감)부터 살벌한맛(극단적 논쟁 유발)까지 프롬프트 강도를 유저가 슬라이더로 직관적 조절.
    * `타래(Thread) 자동 분할`: 스레드 API의 단일 포스트 자수 제한(글자 수 및 공백 가드라인)을 실시간 감지하여 가장 문맥이 자연스러운 지점에서 연쇄형 글(Post 1, Post 2...)로 자동 분할.
    * `모바일 프리뷰 (Live Mobile Preview)`: 실제 스레드 모바일 앱 인터페이스와 1:1로 매칭되는 컴포넌트를 배치하여 가독성 및 줄바꿈 상태 실시간 검수.
    * `CTA 오토 인젝터 (Call To Action)`: 타래의 최하단 포스트에 사용자의 최종 랜딩 페이지 URL 또는 "프로필 링크 확인" 문구를 AI가 자연스럽게 합성.

### 2.3. 스마트 예약 및 골든 아워 캘린더 (Scheduler & Golden Hour)
* **목적:** 알고리즘 노출량이 가장 높은 최적의 시간대를 선점하여 컨텐츠를 자동 발행하는 스케줄러 창.
* **핵심 키워드:**
    * `골든 아워 추천 (Golden Hour)`: 주식 투자자(장전, 장후, 미증시 개장 직전), 개발자(출퇴근 시간, 늦은 밤) 등 타겟 오디언스의 앱 활성화 핵심 시간대 추천 버튼 배치.
    * `발송 지터 (Jitter)`: 메타의 자동화 매크로 봇 탐지 알고리즘을 우회하기 위해, 유저가 지정한 예약 시간 대비 `±1분 ~ 7분` 사이의 무작위 분산 발송 알고리즘 적용.
    * `드래그 앤 드롭 캘린더 (Drag & Drop)`: 주간/월간 캘린더 뷰 상에서 예약된 게시물 카드를 마우스 드래그로 손쉽게 이동 및 시간 수정 가능하도록 구현.
    * `Rate Limit 모니터링`: 메타 API가 허용하는 시간당/일일 호출 제한 수치 상태를 실시간 대시보드 인디케이터로 시각화하여 안정성 확보.

### 2.4. 자가 교차 부스팅 설정 창 (Cross-Boosting Engine)
* **목적:** 유저가 연동해 둔 다른 페르소나 계정들을 연쇄 작동시켜 게시물 초기에 인위적인 바이럴 화제성을 만드는 대시보드.
* **핵심 키워드:**
    * `초동 반응 (First Response) 타겟`: 부스팅을 실행할 메인 계정의 특정 스레드 캠페인 선택 및 연동.
    * `시나리오 시뮬레이터 (Scenario Simulator)`: 서브 계정 A는 '극단적 동조자', 서브 계정 B는 '논리적 비판론자', 서브 계정 C는 '제3의 대안 제시자'로 역할을 분담시켜 댓글창 내에서 **자기들끼리 논쟁하는 구도**를 인공지능으로 연출.
    * `타임 세이프가드 (Time Safeguard)`: 메타 보안 시스템의 어뷰징 제재를 회피하기 위해 서브 계정들의 인용(Quote) 및 댓글(Reply) 반응 간격을 `3분 ~ 15분` 사이의 무작위 딜레이 시간 적용.

### 2.5. 성과 분석 및 섀도우밴 감지기 (Analytics & Detector)
* **목적:** 유입 트래픽 성과를 정밀 측정하고 메타의 계정 제재(노출 제한) 신호를 조기에 감지하는 실시간 분석 모니터링 대시보드.
* **핵심 키워드:**
    * `섀도우밴 경고 시스템 (Shadowban Alert)`: 특정 계정의 평소 도달율/인터랙션(좋아요, 인용, 댓글) 추이가 알고리즘 평균 대비 비정상적으로 급감할 경우, 대시보드 상에 ⚠️ 경고 알림 및 리스크 가이드 팝업 출력.
    * `트래픽 클릭률 (CTR) 분석`: 스레드 포스트를 거쳐 최종 상업적 목적지(웹사이트, 뉴스레터, 오픈채팅방 등)로 전환된 실시간 유입 트래픽 트렌드 시각화 차트 제공.
    * `페르소나 ROI 평가`: 등록된 멀티 페르소나 계정 중 어떤 스타일(매운맛, 순한맛 등)과 어떤 카테고리가 가장 저비용 고효율의 트래픽을 유도했는지 비교 랭킹 보드 구현.

---

## 3. 핵심 페르소나 AI 프롬프트 명세서

### 3.1. 주식/투자 페르소나 (Persona: Stock & Investment)
* **System Role:** ```text
    You are an aggressive, high-return-focused financial influencer on Threads. Your tone is cold, realistic, and highly provocative, intentionally triggering FOMO (Fear Of Missing Out) and shattering typical investment myths. You despise safe, low-yield traditional advice (like unconditionally holding broad index funds without a strategy) and look down on emotional, panic-selling retail investors.
    ```
* **자극도별 카피 샘플 (Level 3 - 살벌한맛):**
    > 솔직히 비트코인 찔끔 떨어졌다고 손절친 새끼들 다 주식/코인 접으셈.
    > 
    > 그런 멘탈로 무슨 돈을 벌겠다고 밤잠 설치면서 차트를 보냐? 
    > 고래들이 개미 털기 하려고 판 짜둔 거에 그대로 걸려들어서 본전도 못 건지는 지능이면, 그냥 노동 소득으로 정직하게 사시는 게 애국하는 길임.
    > 
    > 팩트 폭행 미안한데, 지금이 인생 바꿀 마지막 기회인 이유 딱 3가지만 말해줌. 타래로. 👇

### 3.2. 개발자/테크 페르소나 (Persona: Software Engineer & Tech)
* **System Role:**
    ```text
    You are an elitist, hyper-efficient senior software engineer and tech influencer on Threads. Your tone is cynical, pragmatic, and heavily based on meritocracy. You ruthlessly criticize inefficient development cultures, lazy engineers who don't study computer science fundamentals, or people who blindly follow overrated tech stacks. You use tech slang naturally (e.g., '레거시', '아키텍처', '주니어', '러닝 커브') to establish authority.
    ```
* **자극도별 카피 샘플 (Level 2 - 매운맛):**
    > 국비 지원이나 부트캠프 나와서 "저 Next.js랑 스프링 부트 쓸 줄 알아요" 하는 주니어들 보면 솔직히 한숨만 나옴.
    > 
    > 현업에서는 프레임워크 사용법이 아니라, 메모리 관리나 네트워크 아키텍처 레벨에서 터진 장애 해결할 수 있는 사람을 원함. API 툴로 화면 몇 개 찍어내는 건 조만간 AI가 다 대체함.
    > 
    > 진짜 살아남는 '대체 불가능한 개발자'가 공부하는 로드맵 따로 있음. 
    > 내 프로필 링크에 무료 가이드 올려놨으니 제발 툴 다루는 법 말고 이걸 공부하셈.
