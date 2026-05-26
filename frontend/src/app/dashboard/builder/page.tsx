"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Smartphone, Edit3, Trash2, Send, 
  MessageCircle, RefreshCw, Layers, Smile, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuilderPage() {
  const [topic, setTopic] = useState("");
  const [aggroLevel, setAggroLevel] = useState([2]);
  const [persona, setPersona] = useState("tech_guru");
  const [tone, setTone] = useState("informative");
  
  const [generatedThreads, setGeneratedThreads] = useState<string[]>([
    "Threads는 텍스트 중심의 소통을 위한 완벽한 공간입니다. 🚀 오늘부터 ThreadPulse를 활용하여 비즈니스의 심박수를 높여보세요! #스레드 #자동화",
    "2/ AI 스레드 빌더는 단순한 카피 생성을 넘어, 실시간 모바일 렌더링 피드를 제공합니다. 실제 발행 전에 글의 가독성을 즉각 검증해보세요.",
    "3/ 세련된 프리미엄 다크 테마 디자인과 스마트 스케줄러가 결합할 때, 진정한 무중력 마케팅 채널 성장이 실현됩니다. 지금 바로 무료 시작하기!",
  ]);

  const generateMutation = useMutation({
    mutationFn: ({ topic, persona, level }: any) => 
      api.generateThreads(topic, persona, level),
    onSuccess: (data) => {
      setGeneratedThreads(data);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ title, text, time, persona }: any) => 
      api.scheduleCampaign(title, text, time, persona),
    onSuccess: (data) => {
      alert(`🎉 스레드 캠페인이 정상 등록되었습니다!\n(캠페인 ID: ${data.campaignId}, 상태: ${data.status})`);
    },
  });

  const isGenerating = generateMutation.isPending;

  const handleGenerate = () => {
    generateMutation.mutate({
      topic,
      persona,
      level: aggroLevel[0],
    });
  };

  const handleSchedule = () => {
    scheduleMutation.mutate({
      title: topic || "AI 생성 스레드 캠페인",
      text: generatedThreads,
      time: "오늘 18:30",
      persona,
    });
  };�� 3가지 방법 (정보 공유 타래 👇)`,
        `2/ 첫째, 주제를 매우 구체적으로 쪼개고 'Outfitt' 폰트 수준의 가독성 좋은 Big Typography로 도입부를 구성할 것.`,
        `3/ 둘째, ThreadPulse의 AI 페르소나(${persona === "tech_guru" ? "개발자 구루" : "투자전문가"}) 분석 기능으로 오디언스의 지적 결핍을 공략하세요.`,
        `4/ 마지막으로 발행 즉시 자가 서브 계정 부스팅 알고리즘을 태우세요. 알고리즘 도달률이 300% 이상 차이납니다. #비즈니스 #스레드마케팅`,
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleEditThread = (index: number, newText: string) => {
    const updated = [...generatedThreads];
    updated[index] = newText;
    setGeneratedThreads(updated);
  };

  const handleDeleteThread = (index: number) => {
    const updated = generatedThreads.filter((_, i) => i !== index);
    setGeneratedThreads(updated);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-6 -m-4 p-4 overflow-hidden">
      {/* Page Header */}
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            AI 스레드 빌더 <Sparkles className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Gemini AI를 결합하여 스레드 타래 글을 생성하고 실시간 모킹 화면에서 검수합니다.</p>
        </div>
      </div>

      {/* Resizable Panel Layout */}
      <div className="flex-1 border border-white/5 rounded-2xl overflow-hidden bg-[#121212]/30 backdrop-blur-sm">
        <ResizablePanelGroup orientation="horizontal">
          
          {/* Left Panel: Control Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-bold text-white">1. 기획 및 파라미터 제어</h3>
                <p className="text-[10px] text-muted-foreground">AI가 어떤 성향과 톤앤매너로 작성할지 상세 조정합니다.</p>
              </div>

              {/* Topic Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">발행 주제 또는 핵심 키워드</label>
                <Input
                  placeholder="예: 초보자를 위한 Next.js 14 성능 개선 및 이미지 최적화 팁"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg h-10 transition-all"
                />
              </div>

              {/* Aggro Slider */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">어그로 (Viral Hook) 레벨</label>
                  <span className="text-xs font-bold text-purple-400">Level {aggroLevel[0]}</span>
                </div>
                <Slider
                  defaultValue={[2]}
                  max={4}
                  min={1}
                  step={1}
                  value={aggroLevel}
                  onValueChange={(val) => {
                    if (typeof val === "number") {
                      setAggroLevel([val]);
                    } else {
                      setAggroLevel(Array.from(val));
                    }
                  }}
                  className="py-2"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Level 1 (점잖음)</span>
                  <span>Level 2 (일반)</span>
                  <span>Level 3 (과감함)</span>
                  <span>Level 4 (도발적)</span>
                </div>
              </div>

              {/* Persona Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground font-heading">AI 페르소나 (AI Persona)</label>
                <Select value={persona} onValueChange={(val) => val && setPersona(val)}>
                  <SelectTrigger className="bg-white/5 border-white/5 hover:border-white/10 text-white h-10">
                    <SelectValue placeholder="페르소나 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/5 text-white">
                    <SelectItem value="tech_guru">💻 개발자 구루 (Tech Insights)</SelectItem>
                    <SelectItem value="investor">📈 투자전문가 (Market Pulse)</SelectItem>
                    <SelectItem value="marketer">🎨 마케팅 구루 (Viral Hacker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tone Toggle Group */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">톤앤매너 설정</label>
                <div className="flex flex-wrap gap-2 justify-start">
                  {[
                    { id: "informative", label: "ℹ️ 정보 전달형" },
                    { id: "storytelling", label: "📖 스토리텔링형" },
                    { id: "challenging", label: "⚡ 도발/자극형" },
                  ].map((item) => {
                    const isActive = tone === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTone(item.id)}
                        className={`text-xs py-1.5 px-3 h-8 rounded-lg border transition-all cursor-pointer ${
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

              <hr className="border-white/5" />

              {/* Submit CTA */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="glowing-btn bg-white text-black hover:bg-white/90 font-bold h-11 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    스레드 문장 조립 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black fill-black" />
                    AI 타래 스레드 생성
                  </>
                )}
              </Button>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 w-[1px] hover:bg-purple-500/30 transition-colors" />

          {/* Right Panel: Live Mobile Preview */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full bg-black/40 flex items-center justify-center p-8 overflow-y-auto">
              
              {/* Phone Container */}
              <div className="w-[340px] h-[640px] rounded-[48px] border-[8px] border-[#1E1E1E] bg-[#0A0A0A] shadow-2xl relative overflow-hidden flex flex-col p-4">
                
                {/* Phone Notch/Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-[#1E1E1E] z-20" />

                {/* Phone Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mt-4 px-2 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-muted-foreground" /> 실시간 모바일 프리뷰
                  </span>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                </div>

                {/* Phone Feed Scroll Area */}
                <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-4 scrollbar-none relative">
                  <AnimatePresence mode="popLayout">
                    {isGenerating ? (
                      // Skeleton UI Loader
                      <div className="flex flex-col gap-6">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="flex gap-3">
                            <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
                            <div className="flex-1 flex flex-col gap-2">
                              <Skeleton className="w-24 h-3 bg-white/5" />
                              <Skeleton className="w-full h-12 bg-white/5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Real-time Threads Feed Mockup
                      generatedThreads.map((thread, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex gap-3 relative group"
                        >
                          {/* Thread Connector Line */}
                          {idx < generatedThreads.length - 1 && (
                            <div className="absolute left-[15px] top-8 bottom-[-24px] w-[1px] bg-white/10" />
                          )}

                          {/* Profile Avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-lg">
                            {persona === "tech_guru" ? "💻" : persona === "investor" ? "📈" : "🎨"}
                          </div>

                          {/* Thread bubble body */}
                          <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-white">
                                {persona === "tech_guru" ? "tech_insights" : persona === "investor" ? "market_pulse" : "viral_hacker"}
                              </span>
                              <div className="hidden group-hover:flex items-center gap-1.5 shrink-0">
                                <button className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteThread(idx)} className="text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Editable textarea mockup */}
                            <textarea
                              value={thread}
                              onChange={(e) => handleEditThread(idx, e.target.value)}
                              rows={3}
                              className="w-full bg-transparent border-0 outline-0 p-0 text-xs text-white/90 leading-relaxed resize-none focus:ring-0 focus:border-0 hover:bg-white/5 focus:bg-white/5 rounded p-1 transition-colors border-dashed border-white/5"
                            />

                            {/* Thread micro reactions */}
                            <div className="flex items-center gap-3 text-muted-foreground text-[10px] mt-1">
                              <span className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                                <Smile className="w-3 h-3" /> 리액션
                              </span>
                              <span className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer">
                                <MessageCircle className="w-3 h-3" /> 23
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone Footer CTA */}
                <div className="border-t border-white/5 pt-3 pb-1 px-2 shrink-0 flex gap-2">
                  <Button variant="outline" className="flex-1 border-white/5 hover:bg-white/5 text-[10px] h-8 rounded-lg text-white">
                    <Layers className="w-3.5 h-3.5 mr-1 text-purple-400" /> 임시저장
                  </Button>
                  <Button 
                    onClick={handleSchedule}
                    disabled={scheduleMutation.isPending || generatedThreads.length === 0}
                    className="flex-1 bg-gradient-to-r from-[#FF007A] to-[#00F0FF] text-white hover:opacity-90 font-bold text-[10px] h-8 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {scheduleMutation.isPending ? "등록 중..." : "예약등록"} <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </div>

            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
}
