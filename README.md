<div align="center">
  <br />
  <h1>🚀 ThreadPulse</h1>
  <p>
    <strong>AI 기반 스레드(Threads) 마케팅 자동화 및 카드뉴스 생성 플랫폼</strong>
  </p>
  <p>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Frontend-Next.js%2016-black" alt="Frontend" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Backend-FastAPI-009688" alt="Backend" /></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB" alt="Python" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node-20%2B-339933" alt="Node" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
  </p>
</div>

<br />

**ThreadPulse**는 구글 Gemini AI와 Meta Threads API를 결합하여 소셜 미디어 마케팅의 전 과정을 자동화하는 혁신적인 플랫폼입니다. 
몇 번의 클릭만으로 바이럴을 일으킬 수 있는 카드뉴스를 생성하고, 매력적인 본문을 작성하며, 원하는 시간에 자동으로 스레드에 업로드합니다.

---

## ✨ 주요 기능 (Key Features)

* **🤖 AI 카드뉴스 & 본문 생성 (Gemini 2.5 Flash / Imagen 3.0)**
  * 주제만 입력하면 3~5장의 고화질 카드뉴스 이미지 자동 생성
  * 이미지 내 어그로를 끄는 카피라이팅 동적 렌더링 (Smart Edge Detection)
  * 레퍼런스 이미지를 업로드하여(OCR 및 스타일 분석) 유사한 톤앤매너로 생성 가능
* **🔗 Meta Threads 공식 API 연동**
  * 안전하고 신뢰할 수 있는 OAuth 2.0 기반 계정 연동
  * 이미지 및 텍스트 게시물 실시간 업로드
* **👤 다중 페르소나 및 어그로 강도 조절**
  * 전문가, 마케터, 일반인 등 타겟 오디언스에 맞춘 페르소나 설정 기능
  * 1단계(정보성)부터 4단계(극강의 바이럴/어그로)까지 톤앤매너 조절 가능
* **📅 대시보드 및 자동화**
  * 생성된 카드뉴스를 일괄 다운로드하거나 갤러리 형태로 미리보기
  * 게시글 관리 및 모니터링 (개발 예정)

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS, Framer Motion (애니메이션)
- **UI Components:** shadcn/ui, Lucide React (아이콘)
- **State Management:** React Query (TanStack Query)
- **Utils:** JSZip, FileSaver.js (일괄 다운로드)

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** SQLite (로컬 기본값), SQLModel (ORM)
- **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash, Imagen 3.0)
- **Image Processing:** Pillow (PIL) - 엣지 디텍션 기반 텍스트 자동 레이아웃
- **Network:** httpx (비동기 HTTP 요청)

---

## 🚀 시작하기 (Quick Start)

팀원들의 빠른 협업을 위해 아래 가이드를 순서대로 진행해주세요.

### 1️⃣ 사전 준비사항 (Prerequisites)
시스템에 아래 도구들이 설치되어 있어야 합니다.
* **Node.js** `v20.0.0` 이상
* **Python** `v3.10.0` 이상
* **Git**

### 2️⃣ 저장소 클론 (Clone Repository)
```bash
git clone https://github.com/your-org/threadpulse.git
cd threadpulse
```

### 3️⃣ 백엔드 설정 (Backend Setup)
백엔드는 FastAPI와 Python 환경으로 구성되어 있습니다.

```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상환경(venv) 생성 (Mac/Linux 기준)
python3 -m venv venv

# 가상환경 활성화
# Mac/Linux:
source venv/bin/activate
# Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# 필수 패키지 설치
pip install -r requirements.txt
```

> **환경 변수 설정 (`backend/.env`)**
> `backend` 폴더 최상단에 `.env` 파일을 생성하고 아래 내용을 입력합니다.
> (API Key 등은 팀 슬랙이나 노션을 참고하여 채워주세요.)

```ini
# Meta (Threads) API 설정
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:8000/api/v1/auth/threads/callback

# Google Gemini API 설정 (카드뉴스 및 텍스트 생성용)
GEMINI_API_KEY=your_gemini_api_key_here

# 데이터베이스 설정 (로컬 SQLite 사용)
DATABASE_URL=sqlite:///./threadpulse.db
DB_MODE=local
ENABLE_MOCK_DATA=false
```

백엔드 서버 실행:
```bash
uvicorn main:app --reload --port 8000
# 실행 완료 후 http://localhost:8000/docs 에 접속하면 Swagger API 문서를 볼 수 있습니다.
```

### 4️⃣ 프론트엔드 설정 (Frontend Setup)
새로운 터미널 창을 열고 프론트엔드 설정을 진행합니다.

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 패키지 설치
npm install
```

> **환경 변수 설정 (`frontend/.env.local`)**
> `frontend` 폴더 최상단에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

프론트엔드 서버 실행:
```bash
npm run dev
# 실행 완료 후 http://localhost:3000 에 접속하여 서비스를 확인합니다.
```

---

## 🧩 디렉토리 구조 (Project Structure)

```text
threadpulse/
├── backend/               # FastAPI 백엔드 애플리케이션
│   ├── api/               # API 라우터 (Auth, AI 등)
│   ├── core/              # 설정 및 데이터베이스 연결
│   ├── models/            # SQLModel 데이터베이스 스키마
│   ├── services/          # 핵심 비즈니스 로직 (Gemini, Threads 등)
│   ├── main.py            # FastAPI 엔트리포인트
│   └── requirements.txt   # Python 의존성 목록
├── frontend/              # Next.js 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── app/           # Next.js App Router (페이지 라우팅)
│   │   ├── components/    # 재사용 가능한 UI 컴포넌트 (shadcn/ui 등)
│   │   └── lib/           # 유틸리티 함수 및 API 클라이언트
│   ├── package.json       # Node.js 의존성 목록
│   └── tailwind.config.ts # Tailwind CSS 설정
└── README.md              # 프로젝트 메인 가이드 (현재 파일)
```

---

## 💡 주요 기능 사용 가이드 (Usage Guide)

1. **계정 연동하기**
   - 좌측 사이드바의 `Settings` 메뉴로 이동합니다.
   - `[Meta 계정 연동]` 버튼을 클릭하여 본인의 Threads 계정을 연동합니다.
   - *주의:* 개발 모드(Dev Mode)에서는 Meta 앱 대시보드에 테스터로 등록된 계정만 연동이 가능합니다.
2. **AI 카드뉴스 생성하기**
   - 대시보드의 `Card News Builder`로 이동합니다.
   - 생성하고 싶은 주제(예: "비트코인 폭락장에 살아남는 법")를 입력합니다.
   - 페르소나와 어그로 강도를 선택한 후 `생성하기` 버튼을 누릅니다.
3. **스마트 텍스트 레이아웃**
   - 생성된 이미지는 백엔드의 **Edge Detection 알고리즘**을 통해 그림의 주요 오브젝트를 가리지 않도록 상/하단 중 여백이 많은 곳에 자동으로 텍스트가 합성됩니다.
4. **일괄 다운로드 및 스레드 발행**
   - 우측 갤러리 탭에서 `[일괄 다운로드]` 버튼을 눌러 이미지를 ZIP으로 받을 수 있습니다.
   - 하단의 `[스레드에 게시]` 버튼을 누르면 연동된 계정으로 즉시 업로드됩니다.

---

## 🐛 문제 해결 (Troubleshooting)

**Q. 프론트엔드에서 API 요청 시 CORS 에러가 발생합니다.**
> 백엔드 `main.py`의 CORS 설정이 `http://localhost:3000`을 허용하고 있는지 확인하세요. 프론트엔드 주소가 `127.0.0.1:3000`으로 잡혀있다면 에러가 발생할 수 있습니다.

**Q. 이미지 생성이 계속 실패하고 에러 화면만 뜹니다.**
> Google Imagen API는 안전 필터(Safety Filter)가 매우 강력합니다. 프롬프트에 사람의 얼굴/신체, 폭력성, 지나친 우울감 등이 포함되면 렌더링을 차단합니다. 백엔드에서 강도를 `BLOCK_LOW_AND_ABOVE`로 강제 적용 중이며, AI가 스스로 건전한 백그라운드 이미지를 그리도록 시스템 프롬프트가 세팅되어 있습니다.

**Q. `ModuleNotFoundError: No module named 'google.genai'` 에러가 뜹니다.**
> 가상환경(venv)이 켜져 있는지 터미널을 확인하세요. `source venv/bin/activate`를 실행한 후 `pip install -r requirements.txt`를 다시 실행해 주세요.

---

## 🤝 기여하기 (Contributing)

협업을 위한 브랜치 및 커밋 컨벤션입니다.

1. `main` 브랜치를 최신 상태로 `pull` 받습니다.
2. 기능 개발을 위한 새 브랜치를 생성합니다. (예: `git checkout -b feat/ai-image-logic`)
3. 변경 사항을 커밋합니다. (예: `git commit -m "feat: 스마트 텍스트 배치 알고리즘 추가"`)
   * **feat**: 새로운 기능 추가
   * **fix**: 버그 수정
   * **docs**: 문서 수정
   * **style**: 코드 포맷팅, 세미콜론 누락 등 (코드 로직 변경 없음)
   * **refactor**: 코드 리팩토링
4. 브랜치를 Push 합니다. (예: `git push origin feat/ai-image-logic`)
5. GitHub에서 **Pull Request (PR)**를 생성하고 코드 리뷰를 요청합니다.

---

## 📝 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
