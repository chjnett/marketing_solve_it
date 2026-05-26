# ThreadPulse: UI/UX 디자인 가이드 및 화면 구성서

본 문서는 다크 모드 기반의 프리미엄 웹사이트 디자인 톤앤매너와 ThreadPulse SaaS 플랫폼의 특성을 결합하여, **shadcn/ui** 컴포넌트 생태계를 기반으로 구현할 수 있도록 표준 마크다운(MD) 규격으로 작성된 가이드라인입니다.

---

## 1. 디자인 시스템 (Design System)

### 1.1. 색상 팔레트 (Color Palette)
`shadcn/ui` (Tailwind CSS)의 `dark` 테마 변수 설정을 기준으로 하며, 세련된 프리미엄 무드를 위해 솔리드 다크 톤과 은은한 글래스모피즘 틴트를 조합합니다.

| Token | CSS Variable / Tailwind Class | Hex Value | Description |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` / `bg-background` | `#0A0A0A` | 깊이감 있는 메인 솔리드 다크 톤 |
| **Card / Surface** | `--card` / `bg-card` | `#121212` | 은은한 반투명 블러가 적용되는 카드 배경 |
| **Border** | `--border` / `border-border` | `#1E1E1E` | 대비를 최소화한 심리스한 경계선 |
| **Primary Text** | `--primary-foreground` / `text-foreground` | `#FFFFFF` | 강렬한 대비를 창출하는 메인 타이포그래피 |
| **Secondary Text** | `--muted-foreground` / `text-muted-foreground` | `#A0A0A0` | 본문, 캡션 및 부가 설명 텍스트 |
| **Accent Color** | `--accent` / `text-accent` | `Linear Gradient` | Meta 스레드 감성의 프리미엄 그레이디언트 포인트 |

### 1.2. 타이포그래피 (Typography)
* **Font Family:** `Pretendard`, `Inter`, `Outfit` (현대적이고 가독성이 뛰어난 산세리프)
* **Hero Heading:** `scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl`
    * 레퍼런스의 대담한 타이포그래피(Big Typography) 스타일을 차용하여 자간(`tracking-wider` 또는 `tracking-widest`)을 넓게 설정하고 시각적 공간감을 확보합니다.

---

## 2. 주요 화면 구성 및 shadcn/ui 컴포넌트 매핑

### 2.1. 랜딩 페이지 (Landing Page)

#### Header (Navigation)
* **구조:** 좌측 미니멀 로고 심볼 + 우측 내비게이션 링크 및 햄버거 메뉴
* **적용 컴포넌트:** `Navigation Menu`, `Sheet` (모바일 반응형 햄버거 메뉴용)

#### Hero Section
* **구조:** 대형 볼드 타이포그래피 카피 배치 + 하단 마이크로 애니메이션 스크롤 아이콘
* **핵심 카피:** `"AUTOMATE YOUR THREADS, AMPLIFY YOUR PULSE."`
* **적용 컴포넌트:** `Button` (Glow 효과 프레임워크 결합)

#### Feature Showcase (기능 소개 카드 섹션)
* **구조:** 전체 너비를 꽉 채우는 4분할 그리드 레이아웃 (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
* **콘텐츠 매핑:** `스마트 예약`, `AI 카피 생성`, `크로스 부스팅`, `다중 계정 관리`
* **적용 컴포넌트:** `Card`
    * **인터랙션:** 카드 호버 시 배경이 부드럽게 감속하며 중앙에 `View More` 오버레이 및 인터랙션 액션 노출.

---

### 2.2. 대시보드 메인 (SaaS Dashboard)

#### GNB / LNB (사이드바 내비게이션)
* **구조:** 아이콘 중심의 슬림형 좌측 사이드바 구조 (축소/확장 대응)
* **탑바:** 워크스페이스 스위처, 토큰 만료 및 시스템 알림, 프로필 설정
* **적용 컴포넌트:** `Sidebar` (shadcn 최신 규격), `Select` (워크스페이스 선택), `Popover` (프로필/알림)

#### Dashboard Summary (요약 현황판)
* **구조:** 주요 메트릭 지표(노출수, 상호작용 등) 및 미니멀 꺾은선 차트 그리드 레이아웃
* **적용 컴포넌트:** `Card`, `Chart` (shadcn/ui 내장 Recharts 래퍼 컴포넌트 활용)

---

### 2.3. AI 스레드 빌더 창 (AI Thread Builder)

```
+------------------------------------+------------------------------------+
|                                    |                                    |
|      [좌측: Control Panel]         |        [우측: Live Preview]        |
|                                    |                                    |
|  - 주제 키워드 입력 (Input)         |  ┌──────────────────────────────┐  |
|  - 어그로 레벨 조절 (Slider)        |  │                              │  |
|  - 페르소나 선택 (Select)           |  │    모바일 앱 목업 (Mockup)     |  |
|  - 톤앤매너 설정 (Toggle Group)     |  │    실시간 스레드 피드 프리뷰   |  |
|                                    |  │                              │  |
|                                    |  └──────────────────────────────┘  |
+------------------------------------+------------------------------------+
```

* **구조:** 50:50 좌우 분할 편집 화면 (Split View)
* **적용 컴포넌트:** `Resizable` (분할 레이아웃 조절 패널)
    * **좌측 조작계:** `Input`, `Slider` (어그로 레벨 조절), `Select` (페르소나 드롭다운), `Toggle Group` (톤앤매너)
    * **우측 프리뷰:** 모바일 기기 프레임 테두리를 적용하여 인앱 피드 환경을 실시간 모킹 (`Live Preview`)

---

### 2.4. 스케줄링 캘린더 (Scheduling Calendar)

* **구조:** 불필요한 테두리와 격자선을 최소화하여 투박함을 걷어낸 심리스(Seamless) 디자인의 월간/주간 스케줄러
* **적용 컴포넌트:** `Calendar` 커스텀 확장 뷰
    * **인터랙션:** `Framer Motion` 혹은 외부 드래그앤드롭 라이브러리를 연동하여, 생성된 캠페인 카드를 달력 내 날짜 간 드래그앤드롭으로 직관적 스케줄링 조정 가능.

---

## 3. UI/UX 인터랙션 및 애니메이션 (Micro-interactions)

* **Glow & Hover Effect:** 주요 상호작용 컴포넌트(`Card`, `Button`) 마우스 호버 시, 미세한 외곽선 글로우 효과 및 은은한 백그라운드 블러 변조 적용 (`transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`).
* **Scroll Animation:** 페이지 스크롤 동작 시 섹션별 `Fade-up` 트랜지션을 매끄럽게 처리하기 위해 `Framer Motion`을 `shadcn/ui` 마크업 구조 내부에 결합하여 배치.
* **High-Density Wireframing:** 컴포넌트 개발 및 UI 프로토타이핑 단계에서 가상의 플레이스홀더를 배제하고, 실제 마케팅/운영 데이터 스트링과 밀도 높은 비주얼 에셋을 기본 탑재하여 다크 모드 특유의 댄스(Density)와 프리미엄 질감을 완성.

