import asyncio
from typing import List
from config import settings
from google import genai
from google.genai import types

class GeminiAPIService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash"

    def _get_persona_instruction(self, preset: str) -> str:
        if preset == "tech_guru":
            return (
                "당신은 스레드(Threads)에서 활동하는 10년 차 '시니컬한 시니어 개발자'이자 테크 인플루언서입니다.\n"
                "말투: 완전히 격식 없는 '반말(~다, ~임, ~지, ~음)'을 사용하며, 어투는 매우 냉소적이고 현실적입니다.\n"
                "성격 및 콘텐츠 특성:\n"
                "- 어설픈 국비지원 출신, CS 기초도 모르면서 트렌디한 기술 스택만 쫓는 주니어, 기술 부채를 양산하는 조직 문화, 오버 엔지니어링을 매우 차갑고 날카롭게 비판(팩폭)합니다.\n"
                "- 실력 지상주의 관점이며, 본인의 깊은 경험에서 우러나오는 통찰을 짧고 강렬하게 공유합니다.\n"
                "- 개발자 업계 은어 및 실무 용어(레거시, 피처, 기술 부채, 아키텍처, 리팩토링, 주니어, 시니어, 롤백, 배포)를 아주 자연스럽게 문맥에 녹여 씁니다.\n"
                "⚠️ 절대 금지: AI처럼 상투적인 인사말('안녕하세요!', '개발자 여러분!'), 교과서적인 정보 요약, 긍정적이고 훈훈한 마무리('함께 성장해봅시다!', '화이팅!')는 절대 금지합니다. 첫 문장부터 바로 팩폭이나 본론으로 진입하세요."
            )
        elif preset == "investor":
            return (
                "당신은 스레드(Threads)에서 활동하는 극도로 냉철하고 이성적인 '현실주의 자산 투자 전문가'입니다.\n"
                "말투: 차갑고 단호한 '반말(~다, ~임, ~네)' 혹은 극도로 현실적이고 뼈를 때리는 '직설적인 존댓말(~요, ~죠)'을 사용합니다.\n"
                "성격 및 콘텐츠 특성:\n"
                "- 대중의 조급한 뇌동매매, 근거 없는 급등주 추격 매수, FOMO(포모)에 휩싸인 투기 행태를 무자비하게 꼬집습니다.\n"
                "- 예적금만 믿는 무지함과 자산 인플레이션을 이해하지 못하는 태도를 냉정하게 지적하며, 오직 현금흐름과 본질적인 가치 투자를 강조합니다.\n"
                "- 부자가 되는 과정은 지루하고 고통스럽다는 진실을 말합니다.\n"
                "- 투자 용어(뇌동매매, 분할매수, 우량주, 포모, 현금흐름, 복리 효과, 자산 배분)를 자연스럽게 사용합니다.\n"
                "⚠️ 절대 금지: '부자 되세요!', '화이팅!' 같은 상투적이고 따뜻한 위로나 희망 고문, 긍정적인 엔딩은 절대 사절합니다. 차가운 팩트로 시작해 팩트로 끝맺으세요."
            )
        elif preset == "marketer":
            return (
                "당신은 스레드(Threads)에서 활동하는 트래픽과 전환율에 미친 '실전 100억 매출 마케팅 에이전시 대표'이자 그로스 해커입니다.\n"
                "말투: 프로페셔널하면서도 자신감 넘치고 명확한 '존댓말(~요, ~죠)' 또는 확신에 찬 어조를 사용합니다.\n"
                "성격 및 콘텐츠 특성:\n"
                "- 스크롤을 멈추게 만드는 강력한 한 줄의 훅(Hook)을 최우선으로 여깁니다.\n"
                "- 책에서 배운 껍데기 마케팅이 아닌, 실제 수치(CTR 12%, ROAS 500%, 오가닉 트래픽 등)와 실천적인 카피라이팅 공식, 매출 퍼널 설계 기법을 전수합니다.\n"
                "- 모바일 가독성을 위해 줄바꿈을 극단적으로 자주 하여 여백을 주고, 번호(1., 2.)나 이모지(🔥, 💡)를 가이드성으로 깔끔하게 배치합니다.\n"
                "⚠️ 절대 금지: '마케터란 무엇일까요?' 같은 초보적인 정의나 지루한 서론은 버리십시오. 당장 실무 마케터들이 메모장을 켜고 받아 적을 수밖에 없는 극강의 꿀팁과 방법론을 즉각 제시하세요."
            )
        else: # general
            return (
                "당신은 스레드(Threads)에서 활동하는 센스 넘치고 유머 감각이 뛰어난 '일상 공감 큐레이터'입니다.\n"
                "말투: 친근하고 말랑말랑한 '존댓말(~요!, ~죠?)' 또는 친구에게 조잘거리듯 말하는 친근한 '반말'을 유연하게 씁니다.\n"
                "성격 및 콘텐츠 특성:\n"
                "- 직장 생활의 애환(퇴사 고민, 월요병, 아메리카노 수혈), 인간관계의 현타, 요즘 유행하는 밈(Meme) 등을 재치 있고 뼈 때리는 웃음 코드로 터치합니다.\n"
                "- 독자가 읽자마자 '나만 그런 게 아니구나', '진짜 찐공감이다'라며 무조건 하트(좋아요)나 리포스트를 누르게 만드는 마력이 있습니다.\n"
                "- 귀엽고 공감되는 일상 이모지(☕️, 😭, 🫠, 💻)를 적재적소에 1~2개 섞어 씁니다.\n"
                "⚠️ 절대 금지: 진지하거나 설명적인 어투, 훈계조의 도덕 교과서적인 말은 절대 금지합니다. 가볍고 위트 있게 웃으며 공감할 수 있는 에피소드나 한 줄 생각으로 작성하세요."
            )


    async def generate_social_thread(
        self, 
        topic: str, 
        preset: str, 
        level: int,
        forbidden: str = "",
        required: str = ""
    ) -> List[str]:
        """Call Google Gemini API to generate viral social thread posts using new google.genai SDK"""
        system_instruction = self._get_persona_instruction(preset)
        
        # Build controversy factor in Korean
        controversy_desc = {
            1: "부드럽고 유용한 정보성 톤앤매너, 따뜻한 공감과 확실한 정보 전달 중심.",
            2: "일반적인 SNS 포스트 강도, 적당한 호기심을 유발하는 어조.",
            3: "선 넘지 않는 선에서 과감하고 확신에 찬 어조, 대중적 통념에 도전하거나 강한 주관 표출.",
            4: "극도로 자극적이고 도발적인 어조, 강한 FOMO 유발, 논쟁적인 화두 던지기로 극단적인 스크롤 스톱(어그로) 유도."
        }.get(level, "적당한 어조")

        prompt = f"""
다음 주제에 대해 스레드(Threads)에 업로드할 극도로 바이럴한 연쇄 타래글(3~4개의 연속된 포스트)을 한국어로 작성해주세요.

주제: {topic}

[필수 작성 지침]
1. 자극도 / 어그로 강도: {controversy_desc}
2. 전체 타래는 3~4개의 포스트로 긴밀하게 연결되어야 하며, 각 개별 포스트의 시작 부분에 반드시 '[POST]' 태그를 붙여서 구분해주세요.
   (예: [POST] 첫 번째 포스트 본문 ... [POST] 두 번째 포스트 본문 ...)
3. 모바일 화면에서의 가독성을 위해 각 포스트 본문은 1~2문장 단위로 극단적으로 줄바꿈(엔터)을 자주 하여 시원시원한 여백을 제공하세요.
4. 첫 번째 포스트는 스크롤을 멈추게 만들 강력한 '후킹 문구'로 시작해야 합니다.
5. 절대로 AI가 쓴 글처럼 무의미한 첫인사, 껍데기뿐인 훈계, 뻔한 요약, 또는 훈훈한 긍정적 마무리('개발자 화이팅!', '부자됩시다!' 등)로 글을 끝맺지 마십시오. 실제 SNS 헤비 유저가 모바일에서 날것 그대로 솔직하게 써 내려간 듯한 현실적인 트렌디함을 100% 반영하십시오.
6. 다음 '금지 단어'들은 절대로 글에 포함하면 안 됩니다 (우회 표현 사용 권장): {forbidden if forbidden else "없음"}
7. 다음 '필수 키워드'들은 본문 속에 매우 자연스럽고 매끄럽게 녹여내야 합니다: {required if required else "없음"}
"""

        # Fallback response for testing if Gemini Key is not set or API is unreachable
        fallback_data = [
            f"🔥 [어그로 레벨 {level}] 스레드 마케팅 자동화로 매달 1,000만 명의 트래픽을 모으는 가장 충격적인 3가지 방법 (타래 👇)",
            f"2/ 첫째, 주제를 매우 구체적으로 쪼개고 'Outfit' 폰트 수준의 가독성 좋은 Big Typography로 도입부를 구성할 것. (필수단어: {required if required else '자동화'})",
            f"3/ 둘째, ThreadPulse의 AI 페르소나 분석 기능으로 오디언스의 지적 결핍을 공략하세요. (금지단어: {forbidden if forbidden else '없음'} 우회)",
            f"4/ 마지막으로 발행 즉시 자가 서브 계정 부스팅 알고리즘을 태우세요. 알고리즘 도달률이 300% 이상 차이납니다. #비즈니스 #마케팅자동화"
        ]

        if not settings.GEMINI_API_KEY or not self.client:
            print("[Gemini Service] ⚠️ WARNING: GEMINI_API_KEY is empty in backend/.env. Bypassing Google API and returning mock fallback_data.")
            return fallback_data

        try:
            print(f"[Gemini Service] ⚙️ Using google.genai SDK (new) with model='{self.model_name}'")
            print(f"[Gemini Service]   - System Instruction Vibe: '{system_instruction[:80]}...'")
            print(f"[Gemini Service] 📡 Sending request to Gemini API...")
            print(f"[Gemini Service]   - Topic: '{topic}'")
            print(f"[Gemini Service]   - Prompt length: {len(prompt)} chars")

            # Use asyncio.to_thread to run the synchronous SDK call without blocking
            def _call_gemini():
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.9,
                        max_output_tokens=2048,
                    )
                )
                return response

            # Add a 30-second timeout to prevent infinite hangs
            response = await asyncio.wait_for(
                asyncio.to_thread(_call_gemini),
                timeout=30.0
            )
            
            print("[Gemini Service] 📥 Google API response received successfully! Extracting text body...")
            text_content = response.text
            print(f"[Gemini Service] 📄 Raw generated text content length: {len(text_content)} chars.")
            print(f"[Gemini Service] 📄 Raw content:\n{text_content}\n")
            
            # Parse posts split by '[POST]'
            print("[Gemini Service] 🧩 Splitting text body using '[POST]' tag partition...")
            raw_posts = text_content.split("[POST]")
            parsed_posts = [p.strip() for p in raw_posts if p.strip()]
            
            if len(parsed_posts) < 2:
                print("[Gemini Service] ⚠️ Split found less than 2 posts. Falling back to newline separator double enter split...")
                parsed_posts = [p.strip() for p in text_content.split("\n\n") if p.strip()]

            print(f"[Gemini Service] 🎉 Parsed {len(parsed_posts)} individual sequential thread cards successfully!")
            for idx, post in enumerate(parsed_posts, 1):
                print(f"   [Card {idx}]: '{post[:45]}...'")
                
            return parsed_posts if parsed_posts else fallback_data
        except asyncio.TimeoutError:
            print(f"[Gemini Service] ⏰ TIMEOUT: Gemini API did not respond within 30 seconds.")
            print("[Gemini Service] Falling back to default mock copywriting data.")
            return fallback_data
        except Exception as e:
            print(f"[Gemini Service] 💥 ERROR calling Gemini API endpoint: {type(e).__name__}: {e}")
            print("[Gemini Service] Falling back to default mock copywriting data to prevent application crash.")
            return fallback_data


gemini_api_service = GeminiAPIService()
