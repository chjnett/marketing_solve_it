// Premium API Client for ThreadPulse with robust mock fallbacks
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Custom helper to handle API calls with automatic mock fallbacks when API is offline
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData: T
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const method = options.method || "GET";
  
  console.log(`\n%c[ThreadPulse API] 🚀 Dispatching Endpoint: ${method} ${url}`, "color: #A000FF; font-weight: bold;");
  if (options.body) {
    try {
      console.log(`%c[ThreadPulse API] 📦 Request Body:`, "color: #94A3B8;", JSON.parse(options.body as string));
    } catch {
      console.log(`%c[ThreadPulse API] 📦 Request Body (Raw):`, "color: #94A3B8;", options.body);
    }
  }

  try {
    const startTime = performance.now();
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const duration = (performance.now() - startTime).toFixed(1);
    console.log(`%c[ThreadPulse API] 📥 Response Status: ${response.status} (${response.statusText}) in ${duration}ms`, "color: #10B981; font-weight: bold;");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    console.log(`%c[ThreadPulse API] 🎉 Success! Response JSON parsed:`, "color: #10B981;", data);
    return data as T;
  } catch (error) {
    console.error(`%c[ThreadPulse API] ❌ Network/CORS Error connecting to ${url}:`, "color: #EF4444; font-weight: bold;", error);
    console.warn(`%c[ThreadPulse API] ⚠️ Offline or connection refused. Falling back to mock data.`, "color: #F59E0B; font-weight: bold;");
    
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

  // 5. GET /api/v1/accounts
  async getAccounts() {
    return apiFetch<any[]>(
      "/api/v1/accounts",
      { method: "GET" },
      [
        {
          id: 1,
          username: "tech_insights",
          name: "Tech Insights (메인)",
          avatar: "💻",
          persona: "개발자 구루 (Tech Insights)",
          personaPreset: "tech_guru",
          tokenStatus: "valid",
          role: "main",
          expiresIn: "58일 남음",
          aggroLevel: 2,
          emojiPreference: "normal",
          lineBreaks: "normal",
          forbiddenKeywords: "가즈아, 영차",
          requiredKeywords: "Next.js, CS근본",
        },
        {
          id: 2,
          username: "market_pulse",
          name: "Market Pulse",
          avatar: "📈",
          persona: "투자전문가 (Market Pulse)",
          personaPreset: "investor",
          tokenStatus: "warning",
          role: "booster",
          expiresIn: "2일 남음 (만료 임박)",
          aggroLevel: 3,
          emojiPreference: "often",
          lineBreaks: "frequent",
          forbiddenKeywords: "장기투자, 안전성",
          requiredKeywords: "FOMO, 수익률, 독설",
        },
        {
          id: 3,
          username: "viral_hacker",
          name: "Viral Hacker",
          avatar: "🎨",
          persona: "마케팅 구루 (Viral Hacker)",
          personaPreset: "marketer",
          tokenStatus: "expired",
          role: "booster",
          expiresIn: "만료됨 (재인증 필요)",
          aggroLevel: 2,
          emojiPreference: "often",
          lineBreaks: "normal",
          forbiddenKeywords: "어려운 용어, 학술적",
          requiredKeywords: "바이럴, 해킹, 트렌드",
        },
        {
          id: 4,
          username: "booster_alpha",
          name: "Booster Alpha",
          avatar: "🚀",
          persona: "일반 교양/유머",
          personaPreset: "general",
          tokenStatus: "valid",
          role: "booster",
          expiresIn: "45일 남음",
          aggroLevel: 1,
          emojiPreference: "normal",
          lineBreaks: "normal",
          forbiddenKeywords: "극단적, 어그로",
          requiredKeywords: "일상, 꿀팁, 공감",
        }
      ]
    );
  },

  // 6. PUT /api/v1/accounts/{id}/persona
  async updateAccountPersona(id: number, data: any) {
    const snakeData = {
      name: data.name,
      persona: data.persona,
      persona_preset: data.personaPreset,
      aggro_level: data.aggroLevel,
      emoji_preference: data.emojiPreference,
      line_breaks: data.lineBreaks,
      forbidden_keywords: data.forbiddenKeywords,
      required_keywords: data.requiredKeywords,
    };
    return apiFetch<any>(
      `/api/v1/accounts/${id}/persona`,
      {
        method: "PUT",
        body: JSON.stringify(snakeData),
      },
      { success: true, ...data }
    );
  },

  // 7. DELETE /api/v1/accounts/{id}
  async deleteAccount(id: number) {
    return apiFetch<any>(
      `/api/v1/accounts/${id}`,
      { method: "DELETE" },
      { success: true }
    );
  },

  // 8. GET /api/v1/campaigns
  async getCampaigns() {
    return apiFetch<any[]>(
      "/api/v1/campaigns",
      { method: "GET" },
      []
    );
  },

  // 9. PUT /api/v1/campaigns/{id}/time
  async updateCampaignTime(id: number, time: string) {
    return apiFetch<any>(
      `/api/v1/campaigns/${id}/time`,
      {
        method: "PUT",
        body: JSON.stringify({ time }),
      },
      { success: true }
    );
  },

  // 10. DELETE /api/v1/campaigns/{id}
  async deleteCampaign(id: number) {
    return apiFetch<any>(
      `/api/v1/campaigns/${id}`,
      { method: "DELETE" },
      { success: true }
    );
  }
};

