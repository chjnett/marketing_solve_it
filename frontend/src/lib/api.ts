// Premium API Client for ThreadPulse with robust mock fallbacks
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Custom helper to handle API calls with automatic mock fallbacks when API is offline
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData: T
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[ThreadPulse API Client] Offline or error connecting to ${url}. Using high-fidelity mock fallback.`, error);
    // Simulate natural network latency for the mock data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fallbackData;
  }
}

export const api = {
  // 1. POST /api/v1/auth/login
  async login(email: string, password: string) {
    return apiFetch(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      {
        success: true,
        token: "mock-jwt-access-token-12345",
        user: { email, name: email.split("@")[0] },
      }
    );
  },

  // 2. GET /api/v1/meta/auth/url
  async getMetaAuthUrl() {
    return apiFetch(
      "/api/v1/meta/auth/url",
      { method: "GET" },
      {
        url: "https://www.threads.net/oauth/authorize?client_id=mock-client-id",
      }
    );
  },

  // 3. POST /api/v1/ai/generate
  async generateThreads(topic: string, persona: string, level: number) {
    return apiFetch(
      "/api/v1/ai/generate",
      {
        method: "POST",
        body: JSON.stringify({ topic, persona, level }),
      },
      [
        `🔥 [어그로 레벨 ${level}] 스레드로 매달 1,000만 명의 트래픽을 모으는 가장 충격적인 3가지 방법 (정보 공유 타래 👇)`,
        `2/ 첫째, 주제를 매우 구체적으로 쪼개고 'Outfit' 폰트 수준의 가독성 좋은 Big Typography로 도입부를 구성할 것.`,
        `3/ 둘째, ThreadPulse의 AI 페르소나(${
          persona === "tech_guru" ? "개발자 구루" : "투자전문가"
        }) 분석 기능으로 오디언스의 지적 결핍을 공략하세요.`,
        `4/ 마지막으로 발행 즉시 자가 서브 계정 부스팅 알고리즘을 태우세요. 알고리즘 도달률이 300% 이상 차이납니다. #비즈니스 #스레드마케팅`,
      ]
    );
  },

  // 4. POST /api/v1/campaigns/schedule
  async scheduleCampaign(title: string, text: string[], time: string, persona: string) {
    return apiFetch(
      "/api/v1/campaigns/schedule",
      {
        method: "POST",
        body: JSON.stringify({ title, text, time, persona }),
      },
      {
        success: true,
        campaignId: Math.floor(Math.random() * 1000),
        status: "scheduled",
      }
    );
  },
};
