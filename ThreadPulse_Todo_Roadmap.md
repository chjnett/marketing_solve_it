# ThreadPulse: 개발 Todo 리스트 및 마일스톤 (Development Todo & Milestone)

## Phase 1: 개발 환경 구성 및 MVP 인프라 구축 (1~2주차)
- [ ] **Cloudflare 인프라 초기 셋업**
  - [ ] Cloudflare Pages 프로젝트 생성 (React 배포 환경)
  - [ ] Cloudflare D1 데이터베이스 인스턴스 생성 및 스키마 Migration 스크립트 작성
- [ ] **FastAPI 백엔드 보일러플레이트 구성**
  - [ ] 프로젝트 구조 디렉토리 셋업 (app/api, app/core, app/models, app/services)
  - [ ] SQLModel 기반 D1 비동기 DB 커넥션 유틸 작성
- [ ] **React 프론트엔드 기본 뼈대 구성**
  - [ ] Next.js/React + Tailwind CSS + Shadcn UI 의존성 세팅
  - [ ] 대시보드 기본 Layout 컴포넌트(사이드바, 탑바) 설계

## Phase 2: 핵심 AI 엔진 및 API 연동 개발 (3~4주차)
- [ ] **Gemini API 서비스 레이어 개발**
  - [ ] Google AI Studio API 연동 테스트 및 래퍼 클래스 구현
  - [ ] 주식/투자 및 개발자 페르소나별 시스템 프롬프트 조립 로직 작성
  - [ ] 어그로 레벨(Level 1~4) 파라미터 동적 변경 테스트
- [ ] **Meta Threads API OAuth 및 계정 연동 파이프라인**
  - [ ] Meta Developer App 세팅 (Threads API 권한 요청)
  - [ ] 백엔드 OAuth 2.0 리다이렉션 핸들러 가동 및 Access Token 저장 로직 구현
- [ ] **AI 스레드 빌더 창 프론트엔드 및 API 코어 연결**
  - [ ] 입력 폼(키워드, 슬라이더) 컴포넌트 및 모바일 실시간 프리뷰어 구현
  - [ ] Gemini 카피 생성 -> 타래 글 분할 백엔드 API 연동

## Phase 3: 분산 큐 기반 예약 캘린더 및 부스팅 엔진 (5~6주차)
- [ ] **스마트 비동기 예약 스케줄러 구축**
  - [ ] `post_campaigns` 예약 상태 체커 백그라운드 태스크 구현
  - [ ] 예약 시간 분산 알고리즘(발송 Jitter: 랜덤 초/분 유도) 적용
- [ ] **자가 교차 부스팅(Cross-Boosting) 자동화 서비스**
  - [ ] 메인 글 발행 완료 웹훅/폴링 캐치 로직 구현
  - [ ] 지정된 서브 계정 시나리오 풀 가동 및 타임 가드(3~15분 랜덤 대기) 생성기 연동
- [ ] **스마트 예약 캘린더 UI 구현**
  - [ ] 드래그 앤 드롭 지원 캘린더 대시보드 화면 완성

## Phase 4: 대시보드 고도화, 안정성 확보 및 릴리즈 (7주차~)
- [ ] **성과 지표 및 섀도우밴 감지기 연동**
  - [ ] Threads API 프로필 계정 도달 지표 수집 스케줄러 구현
  - [ ] 직전 일주일 대비 조회수/인터랙션 급감 분석 기반 섀도우밴 경고 임계값 로직 개발
- [ ] **토큰 만료 예외 처리 및 최종 통합 테스트**
  - [ ] Meta API 토큰 만료 에러 발생 시 유저 이메일 알림 및 UI 상태 업데이트 기능
  - [ ] Cloudflare Pages 최종 프로덕션 빌드 배포 및 전체 연동 시나리오 테스트
