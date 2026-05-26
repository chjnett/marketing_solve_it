"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, RefreshCw, Key, ShieldCheck, AlertCircle, 
  Trash2, ShieldAlert, Sparkles, Check, Settings, X, Info,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/api";


interface LinkedAccount {
  id: number;
  username: string;
  name: string;
  avatar: string;
  persona: string;
  personaPreset: "tech_guru" | "investor" | "marketer" | "general";
  tokenStatus: "valid" | "warning" | "expired";
  role: "main" | "booster";
  expiresIn: string;
  aggroLevel: number;
  emojiPreference: "often" | "normal" | "none";
  lineBreaks: "frequent" | "normal" | "rare";
  forbiddenKeywords: string;
  requiredKeywords: string;
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const integrationErrorMessage =
    searchParams.get("integration") === "error"
      ? searchParams.get("message") || "Meta OAuth 연동에 실패했습니다."
      : "";
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [activeTab, setActiveTab] = useState<"threads" | "instagram" | "x">("threads");

  // States for Persona Configuration Sheet
  const [editingAccount, setEditingAccount] = useState<LinkedAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editPersonaPreset, setEditPersonaPreset] = useState<"tech_guru" | "investor" | "marketer" | "general">("tech_guru");
  const [editAggroLevel, setEditAggroLevel] = useState([2]);
  const [editEmojiPreference, setEditEmojiPreference] = useState<"often" | "normal" | "none">("normal");
  const [editLineBreaks, setEditLineBreaks] = useState<"frequent" | "normal" | "rare">("normal");
  const [editForbiddenKeywords, setEditForbiddenKeywords] = useState("");
  const [editRequiredKeywords, setEditRequiredKeywords] = useState("");

  // Notification Toast state
  const [notification, setNotification] = useState({ show: false, message: "" });

  const triggerToast = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3500);
  };

  const mapBackendAccount = (acc: any): LinkedAccount => ({
    id: acc.id,
    username: acc.username,
    name: acc.name,
    avatar: acc.avatar || "💻",
    persona: acc.persona,
    personaPreset: acc.persona_preset || "general",
    tokenStatus: acc.token_status || "valid",
    role: acc.role || "booster",
    expiresIn: acc.expires_in || "60일 남음",
    aggroLevel: acc.aggro_level || 2,
    emojiPreference: acc.emoji_preference || "normal",
    lineBreaks: acc.line_breaks || "normal",
    forbiddenKeywords: acc.forbidden_keywords || "",
    requiredKeywords: acc.required_keywords || "",
  });

  // Load accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const rawAccounts = await api.getAccounts();
        const mapped = rawAccounts.map(mapBackendAccount);
        setAccounts(mapped);
      } catch (err) {
        console.error("Failed to fetch accounts from backend", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleLinkMeta = () => {
    setIsLinking(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    window.location.href = `${apiBaseUrl}/api/v1/auth/threads/login`;
  };

  const handleDelete = async (id: number) => {
    const accToDelete = accounts.find(a => a.id === id);
    try {
      await api.deleteAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      if (accToDelete) {
        triggerToast(`🗑️ @${accToDelete.username} 계정이 연동 해제되었습니다.`);
      }
    } catch (err) {
      console.error("Failed to delete account from database", err);
      triggerToast("❌ 계정 연동 해제에 실패했습니다.");
    }
  };

  const handleOpenSettings = (acc: LinkedAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditPersonaPreset(acc.personaPreset);
    setEditAggroLevel([acc.aggroLevel]);
    setEditEmojiPreference(acc.emojiPreference);
    setEditLineBreaks(acc.lineBreaks);
    setEditForbiddenKeywords(acc.forbiddenKeywords);
    setEditRequiredKeywords(acc.requiredKeywords);
  };

  const presetToPersonaName = (preset: "tech_guru" | "investor" | "marketer" | "general") => {
    switch (preset) {
      case "tech_guru": return "개발자 구루 (Tech Insights)";
      case "investor": return "투자전문가 (Market Pulse)";
      case "marketer": return "마케팅 구루 (Viral Hacker)";
      case "general": return "일반 교양/유머";
    }
  };

  const handleSaveSettings = async () => {
    if (!editingAccount) return;

    const updatedData = {
      name: editName,
      personaPreset: editPersonaPreset,
      persona: presetToPersonaName(editPersonaPreset),
      aggroLevel: editAggroLevel[0],
      emojiPreference: editEmojiPreference,
      lineBreaks: editLineBreaks,
      forbiddenKeywords: editForbiddenKeywords,
      requiredKeywords: editRequiredKeywords,
    };

    try {
      await api.updateAccountPersona(editingAccount.id, updatedData);
      
      setAccounts(prev => prev.map(acc => {
        if (acc.id === editingAccount.id) {
          return {
            ...acc,
            ...updatedData
          };
        }
        return acc;
      }));

      triggerToast(`✨ @${editingAccount.username} 계정의 페르소나 및 톤 설정이 반영되었습니다.`);
      setEditingAccount(null);
    } catch (err) {
      console.error("Failed to save persona settings to database", err);
      triggerToast("❌ 페르소나 설정 저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Accounts Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">계정 연동 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">Meta OAuth API를 활용하여 메인 계정 및 자가 교차 부스팅용 서브 계정을 동기화하고, AI 마케팅 페르소나를 매핑합니다.</p>
        </div>
        <Button 
          onClick={handleLinkMeta}
          disabled={isLinking}
          className="glowing-btn bg-white text-black hover:bg-white/90 text-xs font-bold px-4 h-9 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {isLinking ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
              Meta 로그인 연동 중...
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Meta Threads 계정 연동
            </>
          )}
        </Button>
      </div>

      {/* Platform Navigation Tabs */}
      {integrationErrorMessage ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-200">
          Meta 연동 오류: {integrationErrorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4 shrink-0">
        <button 
          onClick={() => setActiveTab("threads")}
          className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "threads" 
              ? "bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-purple-500/20 text-white shadow-[0_0_12px_rgba(160,0,255,0.15)]"
              : "bg-white/5 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-400" /> Threads (스레드)
        </button>

        <button 
          onClick={() => setActiveTab("instagram")}
          className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer relative group ${
            activeTab === "instagram"
              ? "bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-purple-500/20 text-white shadow-[0_0_12px_rgba(160,0,255,0.15)]"
              : "bg-white/5 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg> Instagram (인스타그램)
          <span className="shrink-0 text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black scale-90">Coming Soon</span>
        </button>

        <button 
          onClick={() => setActiveTab("x")}
          className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer relative group ${
            activeTab === "x"
              ? "bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-purple-500/20 text-white shadow-[0_0_12px_rgba(160,0,255,0.15)]"
              : "bg-white/5 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
          }`}
        >
          <span className="font-black text-xs group-hover:scale-110 transition-transform w-4 text-center">X</span> X (트위터)
          <span className="shrink-0 text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black scale-90">Coming Soon</span>
        </button>
      </div>

      {/* Threads Active Platform Content */}
      {activeTab === "threads" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="bg-[#121212] border-white/5 bg-opacity-60 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/10 transition-all p-6">
              <div className="flex justify-between items-start gap-4">
                
                {/* User Info */}
                <div className="flex gap-4">
                  {/* Custom Avatar container */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:border-purple-500/30 transition-colors">
                    {acc.avatar}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-bold text-white leading-none">{acc.name}</span>
                      {acc.role === "main" ? (
                        <Badge className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold py-0 px-2 rounded-full">
                          메인 채널
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold py-0 px-2 rounded-full">
                          부스터 서브
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">@{acc.username}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {acc.tokenStatus === "valid" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                      <ShieldCheck className="w-2.5 h-2.5" /> 토큰 안전
                    </span>
                  )}
                  {acc.tokenStatus === "warning" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] text-yellow-400 font-bold animate-pulse">
                      <AlertCircle className="w-2.5 h-2.5" /> 만료 임박
                    </span>
                  )}
                  {acc.tokenStatus === "expired" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400 font-bold">
                      <ShieldAlert className="w-2.5 h-2.5" /> 토큰 만료됨
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-semibold">{acc.expiresIn}</span>
                </div>

              </div>

              <hr className="border-white/5 my-4" />

              {/* Persona selector and delete */}
              <div className="flex justify-between items-center text-xs">
                <button 
                  onClick={() => handleOpenSettings(acc)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-purple-400 transition-colors group/edit cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover/edit:scale-110 transition-transform" />
                  <span>페르소나 매핑:</span>
                  <span className="text-white font-semibold underline decoration-dashed decoration-white/20 group-hover/edit:decoration-purple-400">{acc.persona}</span>
                  <Settings className="w-3 h-3 ml-1 opacity-0 group-hover/edit:opacity-100 transition-opacity text-purple-400" />
                </button>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleOpenSettings(acc)}
                    variant="outline" 
                    size="sm" 
                    className="border-white/5 hover:bg-white/5 text-[10px] py-1 px-2.5 h-7 rounded-md text-white font-bold flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-purple-400" /> 설정
                  </Button>
                  {acc.tokenStatus !== "valid" && (
                    <Button variant="outline" size="sm" className="border-white/5 hover:bg-white/5 text-[10px] py-1 px-2 h-7 rounded-md text-white font-bold">
                      재인증
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(acc.id)}
                    className="text-muted-foreground hover:text-rose-400 hover:bg-rose-950/10 rounded-md w-7 h-7"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {/* Blurred Coming Soon Screen for Instagram & X */}
      {activeTab !== "threads" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-white/5 rounded-2xl bg-[#121212]/30 backdrop-blur-sm p-12 text-center flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center mb-6">
            {activeTab === "instagram" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-400 animate-pulse">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            ) : (
              <span className="text-2xl font-black text-amber-400 animate-pulse">X</span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading text-white mb-2">
            {activeTab === "instagram" ? "Instagram" : "X (Twitter)"} 연동 서비스 준비 중
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
            {activeTab === "instagram" ? "인스타그램 피드 및 릴스" : "X 타임라인 및 트윗 스레드"} 최적화 발행, AI 페르소나 카피라이팅, 자가 교차 부스팅 기능이 곧 확장 지원될 예정입니다. 조금만 기다려주세요!
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setActiveTab("threads")}
              className="glowing-btn bg-white text-black hover:bg-white/90 text-xs font-bold px-4 h-9 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Threads (스레드)로 돌아가기
            </Button>
          </div>
        </motion.div>
      )}

      {/* Slide-out Sheet for Detailed Persona Configuration */}
      <Sheet open={editingAccount !== null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <SheetContent className="bg-[#0A0A0A] border-l border-white/5 text-white w-[420px] max-w-full overflow-y-auto flex flex-col p-0">
          {editingAccount && (
            <>
              {/* Sheet Header */}
              <div className="p-6 border-b border-white/5 shrink-0 flex flex-col gap-1 pr-12 relative">
                <SheetHeader className="p-0 gap-0.5">
                  <SheetTitle className="text-white font-heading text-lg font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" /> AI 페르소나 및 톤 설정
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground text-xs font-normal">
                    @{editingAccount.username} 채널에 발행할 컨텐츠의 정체성을 부여합니다.
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Sheet Body (Scrollable form) */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {/* 1. Account Alias */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">채널 별칭 (Alias)</label>
                  <Input 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="별칭 입력"
                    className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg h-10 transition-all"
                  />
                </div>

                {/* 2. Persona Preset Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground font-heading">AI 페르소나 프리셋 (Persona Preset)</label>
                  <Select 
                    value={editPersonaPreset} 
                    onValueChange={(val) => val && setEditPersonaPreset(val as any)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/5 hover:border-white/10 text-white h-10">
                      <SelectValue placeholder="페르소나 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/5 text-white">
                      <SelectItem value="tech_guru">💻 개발자 구루 (CS 근본론자, 팩트 폭행)</SelectItem>
                      <SelectItem value="investor">📈 투자전문가 (고수익 유도, FOMO 자극)</SelectItem>
                      <SelectItem value="marketer">🎨 마케팅 구루 (트렌드 해킹, 바이럴 카피)</SelectItem>
                      <SelectItem value="general">🚀 일반 교양/유머 (정보 큐레이션, 공감)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    {editPersonaPreset === "tech_guru" && (
                      <span><strong>개발자 구루:</strong> 고도로 머릿속을 파고드는 기술 단어(`레거시`, `러닝커브`)를 쓰고, 정통 컴퓨터 과학의 기틀을 강조하는 차갑고 실용적인 개발자 톤을 형성합니다.</span>
                    )}
                    {editPersonaPreset === "investor" && (
                      <span><strong>투자전문가:</strong> 예금이나 일반 인덱스에 만족하는 개미들을 자극하고, 시장의 핵심 변곡점과 압도적 수익 기회를 설파하며 적극적 FOMO를 유도합니다.</span>
                    )}
                    {editPersonaPreset === "marketer" && (
                      <span><strong>마케팅 구루:</strong> 트렌디한 후킹 문구와 스토리텔링을 결합하여, 독자가 즉각 반응하고 공유하고 싶어 지는 바이럴 성장 기법을 전파합니다.</span>
                    )}
                    {editPersonaPreset === "general" && (
                      <span><strong>일반 교양:</strong> 일상의 소소한 공감대와 상식 큐레이팅을 섞어, 누구나 쉽게 좋아요를 누르고 공유할 수 있는 편안한 톤을 유도합니다.</span>
                    )}
                  </div>
                </div>

                {/* 3. controversy Level Slider */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground">기본 자극도 (Controversy Level)</label>
                    <span className="text-xs font-bold text-purple-400">Level {editAggroLevel[0]}</span>
                  </div>
                  <Slider 
                    defaultValue={[2]}
                    max={4}
                    min={1}
                    step={1}
                    value={editAggroLevel}
                    onValueChange={(val) => {
                      if (typeof val === "number") {
                        setEditAggroLevel([val]);
                      } else {
                        setEditAggroLevel(Array.from(val));
                      }
                    }}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Level 1 (순함)</span>
                    <span>Level 2 (보통)</span>
                    <span>Level 3 (매움)</span>
                    <span>Level 4 (살벌함)</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-white">어휘 커스텀 & 톤 튜닝 (Tone Tuning)</span>
                  <span className="text-[10px] text-muted-foreground">스레드 AI 카피 발행 시 적용될 문체적 규칙을 세팅합니다.</span>
                </div>

                {/* 4. Emoji Preference */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">이모지 사용 선호도</label>
                  <div className="flex gap-2">
                    {[
                      { id: "often", label: "✨ 자주 사용" },
                      { id: "normal", label: "💬 보통" },
                      { id: "none", label: "❌ 사용 안 함" },
                    ].map((item) => {
                      const isActive = editEmojiPreference === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setEditEmojiPreference(item.id as any)}
                          className={`flex-1 text-xs py-1.5 px-3 h-9 rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "bg-purple-600/20 border-purple-500/30 text-purple-400 font-bold"
                              : "bg-white/5 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Line Break spacing */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">줄바꿈 빈도 (Spacing)</label>
                  <div className="flex gap-2">
                    {[
                      { id: "frequent", label: "↕️ 줄바꿈 자주" },
                      { id: "normal", label: "↔️ 보통" },
                      { id: "rare", label: "⏹️ 밀도 높게" },
                    ].map((item) => {
                      const isActive = editLineBreaks === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setEditLineBreaks(item.id as any)}
                          className={`flex-1 text-xs py-1.5 px-3 h-9 rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "bg-purple-600/20 border-purple-500/30 text-purple-400 font-bold"
                              : "bg-white/5 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Forbidden Words */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">금지 단어 필터 (Forbidden Words)</label>
                  <Input 
                    value={editForbiddenKeywords}
                    onChange={(e) => setEditForbiddenKeywords(e.target.value)}
                    placeholder="예: 가즈아, 대박, 급등 (콤마로 구분)"
                    className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg h-10 transition-all text-xs"
                  />
                </div>

                {/* 7. Required Keywords */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">필수 포함 단어 (Required Keywords)</label>
                  <Input 
                    value={editRequiredKeywords}
                    onChange={(e) => setEditRequiredKeywords(e.target.value)}
                    placeholder="예: 꿀팁, 아키텍처, 수익률 (콤마로 구분)"
                    className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg h-10 transition-all text-xs"
                  />
                </div>

              </div>

              {/* Sheet Footer */}
              <div className="p-6 border-t border-white/5 shrink-0 flex gap-3">
                <Button 
                  onClick={() => setEditingAccount(null)}
                  variant="outline" 
                  className="flex-1 border-white/5 hover:bg-white/5 text-white font-bold h-10 text-xs rounded-lg"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  className="flex-1 glowing-btn bg-white text-black hover:bg-white/90 font-bold h-10 text-xs rounded-lg cursor-pointer"
                >
                  설정 저장
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Premium Notification Toast Overlay */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-purple-500/20 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 w-80 max-w-full backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 text-[11px] font-bold leading-relaxed text-white">
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
