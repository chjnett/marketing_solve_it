import asyncio
import base64
from typing import List
from config import settings
from google import genai
from google.genai import types
import json

class GeminiAPIService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash"
        self.imagen_model = "imagen-4.0-fast-generate-001"

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


    async def _generate_image_base64(self, image_prompt: str, card_index: int) -> str | None:
        """Generate an image using Gemini Imagen API and return as Base64 string."""
        if not self.client:
            print(f"[Gemini Service] ⚠️ No client available for image generation (card {card_index})")
            return None
        
        try:
            print(f"[Gemini Service] 🖼️ Generating image for card {card_index} with Imagen model...")
            print(f"[Gemini Service]   - Image Prompt: '{image_prompt[:80]}...'")
            
            def _call_imagen():
                response = self.client.models.generate_images(
                    model=self.imagen_model,
                    prompt=image_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="1:1",
                        safety_filter_level="BLOCK_LOW_AND_ABOVE",
                        person_generation="DONT_ALLOW",
                    )
                )
                return response
            
            response = await asyncio.wait_for(
                asyncio.to_thread(_call_imagen),
                timeout=30.0
            )
            
            if response.generated_images and len(response.generated_images) > 0:
                image_bytes = response.generated_images[0].image.image_bytes
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                print(f"[Gemini Service] ✅ Image for card {card_index} generated successfully! Base64 size: {len(image_base64)} chars")
                return image_base64
            else:
                print(f"[Gemini Service] ⚠️ No images returned for card {card_index}")
                return None
                
        except asyncio.TimeoutError:
            print(f"[Gemini Service] ⏰ TIMEOUT: Imagen API did not respond in time for card {card_index}")
            return None
        except Exception as e:
            print(f"[Gemini Service] 💥 ERROR generating image for card {card_index}: {type(e).__name__}: {e}")
            return None


    async def analyze_reference_images(
        self,
        images_base64: List[str],
        analysis_mode: str = "full"  # "ocr_only" | "style_only" | "full"
    ) -> dict:
        """Analyze reference card news images with Gemini Vision and extract style/text info."""
        if not self.client:
            return {"error": "Gemini client not initialized. Check GEMINI_API_KEY."}

        mode_prompts = {
            "ocr_only": """
당신은 전문 OCR 엔진입니다. 주어진 카드뉴스 이미지에서 텍스트를 정확하게 추출하세요.

반드시 아래 JSON 형식으로만 응답하세요 (백틱 없이 순수 JSON):
{
  "extracted_texts": ["이미지1에서 추출한 전체 텍스트", "이미지2에서 추출한 전체 텍스트"],
  "main_headlines": ["각 카드의 핵심 헤드라인만 추출"],
  "content_structure": "텍스트 구조 설명 (예: 헤드라인 + 본문 + CTA 형식)",
  "language_tone": "언어 톤 분석 (예: 반말/존댓말, 직설적/부드러운 등)",
  "color_palette": null,
  "typography_style": null,
  "layout_pattern": null,
  "image_style_prompt": null
}
""",
            "style_only": """
당신은 전문 그래픽 디자인 분석가입니다. 주어진 카드뉴스 이미지의 시각적 스타일을 상세히 분석하세요. 텍스트 내용보다 디자인 요소에 집중하세요.

반드시 아래 JSON 형식으로만 응답하세요 (백틱 없이 순수 JSON):
{
  "color_palette": "주 배경색, 강조색, 텍스트색 등 색상 체계 상세 설명 (예: 딥 다크 네이비 #0a0a1a 배경, 네온 퍼플 #9b59b6 강조, 흰색 텍스트)",
  "typography_style": "폰트 스타일, 굵기, 크기 위계, 줄간격 특징 등 (예: 초대형 볼드 산세리프 헤드라인, 소문자 강조, 극단적 줄간격)",
  "layout_pattern": "레이아웃 구성 패턴 상세 설명 (예: 전체 배경 이미지 위 하단 그라디언트 오버레이 + 텍스트, 여백 최소화)",
  "visual_mood": "전체적인 무드와 감성 (예: 다크하고 긴박한 분위기, 프리미엄 럭셔리 느낌)",
  "image_style_prompt": "이 스타일을 재현하기 위한 Imagen API용 영어 프롬프트 (상세하고 구체적으로)",
  "design_elements": "특징적인 디자인 요소들 (아이콘, 그라디언트, 그림자, 테두리 등)",
  "extracted_texts": null,
  "main_headlines": null,
  "content_structure": null,
  "language_tone": null
}
""",
            "full": """
당신은 카드뉴스 전문 분석가입니다. 주어진 카드뉴스 이미지를 OCR 텍스트 추출과 시각적 디자인 스타일 두 가지 측면에서 완전히 분석하세요.

반드시 아래 JSON 형식으로만 응답하세요 (백틱 없이 순수 JSON):
{
  "extracted_texts": ["이미지별 전체 텍스트 내용 추출"],
  "main_headlines": ["각 카드의 핵심 헤드라인"],
  "content_structure": "콘텐츠 구조 설명 (헤드라인/본문/CTA 구성)",
  "language_tone": "언어 톤 분석 (반말/존댓말, 직설적/감성적, 자극적/정보성)",
  "color_palette": "주 배경색, 강조색, 텍스트색 체계 (가능하면 hex 포함)",
  "typography_style": "폰트 스타일, 굵기, 크기 위계, 특징적 표현 방식",
  "layout_pattern": "레이아웃 패턴 (이미지+텍스트 배치, 여백 처리 방식)",
  "visual_mood": "전체적인 무드와 감성",
  "design_elements": "특징적인 디자인 요소들",
  "image_style_prompt": "이 스타일 재현을 위한 Imagen API용 영어 프롬프트 (상세하게)"
}
"""
        }

        analysis_prompt = mode_prompts.get(analysis_mode, mode_prompts["full"])
        mode_label = {"ocr_only": "OCR 텍스트 추출", "style_only": "스타일 분석", "full": "통합 분석"}.get(analysis_mode, "통합 분석")

        print(f"[Gemini Service] 🔍 Starting reference analysis - Mode: '{mode_label}', Images: {len(images_base64)}")

        try:
            def _call_vision():
                # Build multimodal contents: [image, image, ..., text_prompt]
                contents = []
                for i, img_b64 in enumerate(images_base64[:5]):  # max 5 images
                    # Auto-detect mime type from base64 header bytes
                    raw = base64.b64decode(img_b64[:16])
                    if raw[:4] == b'\x89PNG':
                        mime = "image/png"
                    elif raw[:4] == b'RIFF':
                        mime = "image/webp"
                    else:
                        mime = "image/jpeg"
                    contents.append(
                        types.Part.from_bytes(
                            data=base64.b64decode(img_b64),
                            mime_type=mime
                        )
                    )
                    print(f"[Gemini Service]   - Attached image {i+1} (mime: {mime}, size: {len(img_b64)} chars)")
                contents.append(types.Part.from_text(text=analysis_prompt))

                # NOTE: Do NOT set response_mime_type="application/json" here.
                # It causes Gemini to truncate the response mid-JSON when the content
                # is long. We parse JSON manually instead.
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        max_output_tokens=4096,
                    )
                )

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_vision),
                timeout=60.0
            )

            raw_text = response.text.strip()
            print(f"[Gemini Service] 📥 Raw response length: {len(raw_text)} chars")

            # Robust JSON extraction: strip markdown fences, then find first { ... } block
            text_content = raw_text
            if "```json" in text_content:
                text_content = text_content.split("```json", 1)[1]
            if "```" in text_content:
                text_content = text_content.split("```")[0]
            text_content = text_content.strip()

            # If still not valid JSON, try to extract the first {...} block via regex
            if not text_content.startswith("{"):
                import re
                match = re.search(r'\{[\s\S]+\}', text_content)
                if match:
                    text_content = match.group(0)
                    print(f"[Gemini Service] 🔧 Extracted JSON block via regex")

            try:
                result = json.loads(text_content)
            except json.JSONDecodeError as je:
                # Last resort: try to fix common truncation by closing open strings/arrays
                print(f"[Gemini Service] ⚠️ JSONDecodeError at char {je.pos}: {je.msg}. Attempting partial fix...")
                # Truncate at the error position and close the object
                partial = text_content[:je.pos].rstrip().rstrip(',').rstrip('"').rstrip(',')
                # Count unclosed braces/brackets
                open_braces = partial.count('{') - partial.count('}')
                open_brackets = partial.count('[') - partial.count(']')
                closing = ']' * open_brackets + '}' * open_braces
                try:
                    result = json.loads(partial + '"' + closing)
                except Exception:
                    try:
                        result = json.loads(partial + closing)
                    except Exception:
                        print(f"[Gemini Service] 💥 Could not recover JSON. Returning partial raw analysis.")
                        return {
                            "error": None,
                            "analysis_mode": analysis_mode,
                            "image_count": len(images_base64),
                            "raw_analysis": raw_text[:1000],
                            "language_tone": "분석 결과를 파싱하는 데 실패했습니다. 다시 시도해주세요.",
                        }

            result["analysis_mode"] = analysis_mode
            result["image_count"] = len(images_base64)
            print(f"[Gemini Service] ✅ Reference analysis complete! Mode: {mode_label}")
            return result

        except asyncio.TimeoutError:
            print("[Gemini Service] ⏰ TIMEOUT during reference analysis")
            return {"error": "분석 시간이 초과되었습니다. 다시 시도해주세요.", "analysis_mode": analysis_mode}
        except Exception as e:
            print(f"[Gemini Service] 💥 ERROR during reference analysis: {type(e).__name__}: {e}")
            return {"error": f"분석 중 오류가 발생했습니다: {str(e)}", "analysis_mode": analysis_mode}


    async def generate_card_news(
        self, 
        topic: str, 
        preset: str, 
        level: int,
        forbidden: str = "",
        required: str = "",
        reference_style: dict | None = None
    ) -> List[dict]:
        """Call Google Gemini API to generate structured card news (image prompt + text + base64 image)"""
        system_instruction = self._get_persona_instruction(preset)

        # Build reference style section to inject into the prompt
        reference_section = ""
        if reference_style and not reference_style.get("error"):
            mode = reference_style.get("analysis_mode", "full")
            parts = []
            if reference_style.get("extracted_texts"):
                parts.append(f"- 레퍼런스 텍스트 스타일: {'; '.join(reference_style['extracted_texts'][:3])}")
            if reference_style.get("language_tone"):
                parts.append(f"- 언어 톤앤매너: {reference_style['language_tone']}")
            if reference_style.get("content_structure"):
                parts.append(f"- 콘텐츠 구조: {reference_style['content_structure']}")
            if reference_style.get("color_palette"):
                parts.append(f"- 색상 팔레트: {reference_style['color_palette']}")
            if reference_style.get("typography_style"):
                parts.append(f"- 타이포그래피: {reference_style['typography_style']}")
            if reference_style.get("layout_pattern"):
                parts.append(f"- 레이아웃 패턴: {reference_style['layout_pattern']}")
            if reference_style.get("visual_mood"):
                parts.append(f"- 비주얼 무드: {reference_style['visual_mood']}")
            if reference_style.get("image_style_prompt"):
                parts.append(f"- 이미지 스타일 기준 프롬프트: {reference_style['image_style_prompt']}")
            if parts:
                reference_section = f"""
7. [레퍼런스 스타일 적용 - 매우 중요] 업로드된 레퍼런스 카드뉴스를 분석한 결과를 바탕으로, 아래 스타일 지침을 반드시 따르세요:
{chr(10).join(parts)}
   → image_prompt는 위의 '이미지 스타일 기준 프롬프트'를 베이스로 주제에 맞게 변형하여 작성하세요.
   → 텍스트 구조, 언어 톤, 레이아웃 패턴을 레퍼런스와 유사하게 유지하세요.
"""
            print(f"[Gemini Service] 🎨 Reference style injected into prompt (mode: {mode})")
        
        controversy_desc = {
            1: "부드럽고 유용한 정보성 톤앤매너, 따뜻한 공감과 확실한 정보 전달 중심.",
            2: "일반적인 SNS 포스트 강도, 적당한 호기심을 유발하는 어조.",
            3: "선 넘지 않는 선에서 과감하고 확신에 찬 어조, 대중적 통념에 도전하거나 강한 주관 표출.",
            4: "극도로 자극적이고 도발적인 어조, 강한 FOMO 유발, 논쟁적인 화두 던지기로 극단적인 스크롤 스톱(어그로) 유도."
        }.get(level, "적당한 어조")

        prompt = f"""
다음 주제에 대해 인스타그램/스레드(Threads)에 업로드할 극도로 바이럴한 카드뉴스 기획안(3~5장의 슬라이드)을 작성해주세요.

주제: {topic}

[필수 작성 지침]
1. 자극도 / 어그로 강도: {controversy_desc}
2. 각 슬라이드별로 '이미지 묘사(프롬프트)'와 '슬라이드에 들어갈 텍스트'를 작성해야 합니다.
3. 첫 번째 슬라이드는 스크롤을 멈추게 만들 강력한 '후킹 문구'로 시작해야 합니다.
4. 다음 '금지 단어'들은 절대로 텍스트에 포함하면 안 됩니다: {forbidden if forbidden else "없음"}
5. 다음 '필수 키워드'들은 텍스트 속에 매우 자연스럽고 매끄럽게 녹여내야 합니다: {required if required else "없음"}
6. 이미지 묘사(image_prompt)는 반드시 영어로 작성하세요. Gemini Imagen API가 영어 프롬프트에 최적화되어 있습니다.
   예: "Dark moody background with glowing neon purple text, minimalist tech aesthetic, dramatic shadows"
{reference_section}
반드시 아래 JSON 스키마를 준수하여 출력하세요. 백틱(`) 없이 순수 JSON 배열만 반환하세요.
[
  {{
    "image_prompt": "Dark background with neon purple glowing text, minimalist design, high contrast",
    "text": "100억 매출 마케터가 숨기는 \\n단 1가지 비밀"
  }},
  ...
]
"""

        fallback_data = [
            {
                "image_prompt": "Dark background with red gradient warning icon centered, minimalist dramatic design, cinematic lighting",
                "text": f"🔥 [어그로 레벨 {level}] 스레드 마케팅 자동화\n가장 충격적인 3가지 방법",
                "image_base64": None
            },
            {
                "image_prompt": "Mobile smartphone screen with clean typography UI design, dark theme, glowing text elements",
                "text": f"1. 주제를 매우 구체적으로 쪼개고\n가독성 좋은 폰트를 쓸 것\n(키워드: {required if required else '자동화'})",
                "image_base64": None
            },
            {
                "image_prompt": "Artificial intelligence brain icon with holographic analysis charts floating, futuristic neon blue glow",
                "text": "2. ThreadPulse AI 페르소나로\n오디언스의 지적 결핍을 공략",
                "image_base64": None
            },
            {
                "image_prompt": "Rocket launching into space with data traffic lines surging upward, vibrant colorful illustration",
                "text": "알고리즘 도달률 300% 이상 차이\n#비즈니스 #스레드마케팅",
                "image_base64": None
            }
        ]

        if not settings.GEMINI_API_KEY or not self.client:
            print("[Gemini Service] ⚠️ WARNING: GEMINI_API_KEY is empty. Bypassing and returning mock card news.")
            return fallback_data

        try:
            print(f"[Gemini Service] ⚙️ Generating Card News with model='{self.model_name}'")
            
            def _call_gemini():
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.9,
                        max_output_tokens=2048,
                        response_mime_type="application/json"
                    )
                )

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_gemini),
                timeout=30.0
            )
            
            text_content = response.text.strip()
            # In case it wraps in markdown code block despite the prompt
            if text_content.startswith("```json"):
                text_content = text_content[7:]
            if text_content.endswith("```"):
                text_content = text_content[:-3]
            text_content = text_content.strip()
            
            parsed_data = json.loads(text_content)
            print(f"[Gemini Service] 🎉 Successfully parsed {len(parsed_data)} card news slides!")
            
            # Generate images concurrently for each card using Imagen API
            print(f"[Gemini Service] 🖼️ Starting concurrent image generation for {len(parsed_data)} cards...")
            image_tasks = [
                self._generate_image_base64(card.get("image_prompt", ""), idx)
                for idx, card in enumerate(parsed_data)
            ]
            image_results = await asyncio.gather(*image_tasks, return_exceptions=True)
            
            # Attach image_base64 to each card
            for idx, card in enumerate(parsed_data):
                result = image_results[idx]
                if isinstance(result, Exception):
                    print(f"[Gemini Service] ⚠️ Image generation exception for card {idx}: {result}")
                    card["image_base64"] = None
                else:
                    card["image_base64"] = result
            
            print(f"[Gemini Service] 🏁 Card news generation complete! {sum(1 for r in image_results if r and not isinstance(r, Exception))}/{len(parsed_data)} images generated.")
            return parsed_data
            
        except asyncio.TimeoutError:
            print(f"[Gemini Service] ⏰ TIMEOUT: Gemini API did not respond within 30 seconds.")
            return fallback_data
        except Exception as e:
            print(f"[Gemini Service] 💥 ERROR calling Gemini API for card news: {type(e).__name__}: {e}")
            return fallback_data

gemini_api_service = GeminiAPIService()
