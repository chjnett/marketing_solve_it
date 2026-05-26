import os
from dotenv import load_dotenv
from google import genai

# 1. .env 파일 로드
load_dotenv()

# 2. API Key 확인
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ .env 파일에서 GEMINI_API_KEY를 찾을 수 없습니다.")

print(f"✅ API Key 로드 성공! (앞자리 확인: {api_key[:5]}...)")

# 3. Gemini 클라이언트 초기화
client = genai.Client()

print("\n🤖 [사용 가능한 Gemini 모델 목록]")
print("-" * 50)

try:
    # 필터링 없이 일단 모든 모델 리스트를 가져와 출력합니다.
    model_list = list(client.models.list())
    
    if not model_list:
        print("⚠️ 가져온 모델 목록이 비어 있습니다. API Key의 권한을 확인해 주세요.")
    else:
        for model in model_list:
            # 모델의 고유 이름(ID)만 깔끔하게 출력
            print(f"- {model.name}")
            
except Exception as e:
    print(f"❌ 모델 목록을 가져오는 중 오류가 발생했습니다: {e}")