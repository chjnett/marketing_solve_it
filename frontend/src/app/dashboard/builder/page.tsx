"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  const [generateMode, setGenerateMode] = useState<"thread" | "card_news">("thread");
  const [generatedCardNews, setGeneratedCardNews] = useState<any[]>([]);
  
  const [generatedThreads, setGeneratedThreads] = useState<string[]>([
    "Threads는 텍스트 중심의 소통을 위한 완벽한 공간입니다. 🚀 오늘부터 ThreadPulse를 활용하여 비즈니스의 심박수를 높여보세요! #스레드 #자동화",
    "2/ AI 스레드 빌더는 단순한 카피 생성을 넘어, 실시간 모바일 렌더링 피드를 제공합니다. 실제 발행 전에 글의 가독성을 즉각 검증해보세요.",
    "3/ 세련된 프리미엄 다크 테마 디자인과 스마트 스케줄러가 결합할 때, 진정한 무중력 마케팅 채널 성장이 실현됩니다. 지금 바로 무료 시작하기!",
  ]);

  const generateMutation = useMutation({
    mutationFn: ({ topic, persona, level }: any) => {
      console.log(`%c[Builder Page] 📡 useMutation triggered. Calling api.generateThreads with topic: "${topic}", persona: "${persona}", aggroLevel: ${level}`, "color: #3B82F6; font-weight: bold;");
      return api.generateThreads(topic, persona, level);
    },
    onSuccess: (data) => {
      console.log(`%c[Builder Page] 🏆 Mutation successful! Setting generatedThreads state to:`, "color: #10B981; font-weight: bold;", data);
      setGeneratedThreads(data);
    },
    onError: (err) => {
      console.error(`%c[Builder Page] 💥 Mutation error occurred:`, "color: #EF4444; font-weight: bold;", err);
    }
  });

  const generateCardNewsMutation = useMutation({
    mutationFn: ({ topic, persona, level }: any) => {
      console.log(`%c[Builder Page] 📡 useMutation triggered. Calling api.generateCardNews with topic: "${topic}", persona: "${persona}", aggroLevel: ${level}`, "color: #3B82F6; font-weight: bold;");
      return api.generateCardNews(topic, persona, level);
    },
    onSuccess: (data) => {
      console.log(`%c[Builder Page] 🏆 Mutation successful! Setting generatedCardNews state to:`, "color: #10B981; font-weight: bold;", data);
      setGeneratedCardNews(data);
    },
    onError: (err) => {
      console.error(`%c[Builder Page] 💥 Mutation error occurred:`, "color: #EF4444; font-weight: bold;", err);
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ title, text, time, persona }: any) => {
      console.log(`%c[Builder Page] 📡 Schedule campaign mutation triggered. Calling api.scheduleCampaign...`, "color: #3B82F6; font-weight: bold;");
      return api.scheduleCampaign(title, text, time, persona);
    },
    onSuccess: (data) => {
      console.log(`%c[Builder Page] 🏆 Campaign scheduled successfully:`, "color: #10B981; font-weight: bold;", data);
      alert(`🎉 스레드 캠페인이 정상 등록되었습니다!\n(캠페인 ID: ${data.campaignId}, 상태: ${data.status})`);
    },
    onError: (err) => {
      console.error(`%c[Builder Page] 💥 Campaign schedule error:`, "color: #EF4444; font-weight: bold;", err);
    }
  });

  const isGenerating = generateMode === "thread" ? generateMutation.isPending : generateCardNewsMutation.isPending;

  const handleGenerate = () => {
    console.log(`\n%c[Builder Page] 🖱️ AI Generate Button Clicked!`, "color: #F59E0B; font-weight: bold;");
    console.log(`[Builder Page] - Mode: "${generateMode}"`);
    console.log(`[Builder Page] - Topic: "${topic}"`);
    console.log(`[Builder Page] - Persona: "${persona}"`);
    console.log(`[Builder Page] - Aggro Level: ${aggroLevel[0]}`);
    console.log(`[Builder Page] - Tone: "${tone}"`);
    
    try {
      const modeStr = Array.isArray(generateMode) ? generateMode[0] : generateMode;
      if (modeStr === "thread") {
        console.log(`[Builder Page] 🚀 Starting Thread Generation...`);
        generateMutation.mutate({
          topic,
          persona,
          level: aggroLevel[0],
        });
      } else if (modeStr === "card_news") {
        console.log(`[Builder Page] 🚀 Starting Card News Generation...`);
        generateCardNewsMutation.mutate({
          topic,
          persona,
          level: aggroLevel[0],
        });
      } else {
        console.error(`[Builder Page] ❌ Invalid generateMode detected: ${generateMode}`);
      }
    } catch (err) {
      console.error(`[Builder Page] ❌ Exception caught during handleGenerate:`, err);
    }
  };

  const handleSchedule = () => {
    console.log(`%c[Builder Page] 🖱️ Campaign Schedule Button Clicked!`, "color: #F59E0B; font-weight: bold;");
    scheduleMutation.mutate({
      title: topic || "AI 생성 스레드 캠페인",
      text: generateMode === "thread" ? generatedThreads : generatedCardNews.map(c => c.text),
      time: "오늘 18:30",
      persona,
    });
  };

  const handleEditThread = (index: number, newText: string) => {
    console.log(`[Builder Page] ✏️ Editing thread index ${index}: "${newText}"`);
    const updated = [...generatedThreads];
    updated[index] = newText;
    setGeneratedThreads(updated);
  };

  const handleDeleteThread = (index: number) => {
    console.log(`[Builder Page] 🗑️ Deleting thread index ${index}`);
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
          <ResizablePanel defaultSize={generateMode === "card_news" ? 35 : 50} minSize={25}>
            <div className="h-full p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-bold text-white">1. 기획 및 파라미터 제어</h3>
                <p className="text-[10px] text-muted-foreground">AI가 어떤 성향과 톤앤매너로 작성할지 상세 조정합니다.</p>
              </div>

              {/* Generate Mode Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">콘텐츠 형태</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGenerateMode("thread")}
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg h-9 border transition-all cursor-pointer ${
                      generateMode === "thread"
                        ? "bg-white text-black border-white font-bold"
                        : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Layers className="w-4 h-4" /> 스레드 타래 (텍스트)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerateMode("card_news")}
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg h-9 border transition-all cursor-pointer ${
                      generateMode === "card_news"
                        ? "bg-white text-black border-white font-bold"
                        : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> 카드뉴스 (이미지)
                  </button>
                </div>
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
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border-0 outline-0
                  ${isGenerating
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-not-allowed animate-pulse"
                    : "bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {generateMode === "card_news" ? "카드뉴스 생성 중..." : "스레드 문장 조립 중..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-black" />
                    {generateMode === "card_news" ? "AI 카드뉴스 생성" : "AI 타래 스레드 생성"}
                  </>
                )}
              </button>

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    <span className="text-[11px] text-purple-300 font-semibold">
                      Gemini AI가 콘텐츠를 생성하고 있습니다
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(generateMode === "card_news"
                      ? ["페르소나 분석 중", "이미지 프롬프트 설계 중", "카드별 카피 작성 중", "JSON 구조화 완료 중"]
                      : ["페르소나 분석 중", "어그로 레벨 계산 중", "스레드 초안 작성 중", "문장 리듬 최적화 중"]
                    ).map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border-2 border-purple-400/50 border-t-purple-400 animate-spin shrink-0"
                          style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1s" }}
                        />
                        <span className="text-[10px] text-white/60">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{width: "60%", animation: "pulse 1.5s ease-in-out infinite"}} />
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 w-[1px] hover:bg-purple-500/30 transition-colors" />

          {/* Right Panel: Live Mobile Preview */}
          <ResizablePanel defaultSize={generateMode === "card_news" ? 35 : 50} minSize={30}>
            <div className="h-full bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
              
              {/* Phone Container */}
              <div className="w-[280px] min-h-[480px] rounded-[36px] border-[6px] border-[#1E1E1E] bg-[#0A0A0A] shadow-2xl relative overflow-hidden flex flex-col p-3 shrink-0">
                
                {/* Phone Notch/Island */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-3.5 rounded-full bg-[#1E1E1E] z-20" />

                {/* Phone Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-3 px-1.5 shrink-0">
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
                <div className="flex-1 overflow-y-auto py-3 px-1.5 flex flex-col gap-3 scrollbar-none relative">
                  {/* Mode indicator badge */}
                  <div className={`text-[9px] px-2 py-0.5 rounded-full self-start font-bold mb-1 ${generateMode === "card_news" ? "bg-purple-500/30 text-purple-300 border border-purple-500/50" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                    {generateMode === "card_news" ? "📸 카드뉴스 모드" : "💬 스레드 모드"}
                  </div>

                  {/* Skeleton Loader */}
                  {isGenerating && (
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
                  )}

                  {/* Card News Feed */}
                  {!isGenerating && generateMode === "card_news" && (
                    <div className="flex flex-col gap-5 pb-4">
                      {generatedCardNews.length === 0 && (
                        <div className="flex items-center justify-center text-xs text-muted-foreground py-8">
                          카드뉴스를 생성해주세요.
                        </div>
                      )}
                      {generatedCardNews.map((card, idx) => (
                        <div key={idx} className="flex gap-3 relative group">
                          {idx < generatedCardNews.length - 1 && (
                            <div className="absolute left-[15px] top-8 bottom-[-24px] w-[1px] bg-white/10" />
                          )}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-lg">
                            {persona === "tech_guru" ? "💻" : persona === "investor" ? "📈" : "🎨"}
                          </div>
                          <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <span className="text-[11px] font-bold text-white">
                              {persona === "tech_guru" ? "tech_insights" : persona === "investor" ? "market_pulse" : "viral_hacker"}
                            </span>
                            <textarea
                              value={card.text}
                              onChange={(e) => {
                                const updated = [...generatedCardNews];
                                updated[idx].text = e.target.value;
                                setGeneratedCardNews(updated);
                              }}
                              rows={3}
                              className="w-full bg-transparent border-0 outline-0 p-0 text-xs text-white/90 leading-relaxed resize-none focus:ring-0 focus:border-0 hover:bg-white/5 focus:bg-white/5 rounded p-1 transition-colors"
                            />
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/10 mt-1.5 shadow-md cursor-pointer">
                              {card.image_base64 ? (
                                <img
                                  src={`data:image/png;base64,${card.image_base64}`}
                                  alt={`Slide ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 gap-2">
                                  <Sparkles className="w-6 h-6 text-purple-400 opacity-50" />
                                  <span className="text-[9px] text-white/40 text-center px-2">이미지 생성 중...</span>
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-[9px] text-white/80 leading-tight line-clamp-2">
                                  <Sparkles className="w-2.5 h-2.5 inline mr-1 text-purple-400" />
                                  {card.image_prompt}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground text-[10px] mt-2">
                              <span className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                                <Smile className="w-3 h-3" /> 리액션
                              </span>
                              <span className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer">
                                <MessageCircle className="w-3 h-3" /> {idx * 7 + 12}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thread Feed */}
                  {!isGenerating && generateMode === "thread" && (
                    <div className="flex flex-col gap-3 pb-4">
                      {generatedThreads.map((thread, idx) => (
                        <div key={idx} className="flex gap-3 relative group">
                          {idx < generatedThreads.length - 1 && (
                            <div className="absolute left-[15px] top-8 bottom-[-24px] w-[1px] bg-white/10" />
                          )}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-lg">
                            {persona === "tech_guru" ? "💻" : persona === "investor" ? "📈" : "🎨"}
                          </div>
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
                            <textarea
                              value={thread}
                              onChange={(e) => handleEditThread(idx, e.target.value)}
                              rows={3}
                              className="w-full bg-transparent border-0 outline-0 p-0 text-xs text-white/90 leading-relaxed resize-none focus:ring-0 focus:border-0 hover:bg-white/5 focus:bg-white/5 rounded p-1 transition-colors"
                            />
                            <div className="flex items-center gap-3 text-muted-foreground text-[10px] mt-1">
                              <span className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                                <Smile className="w-3 h-3" /> 리액션
                              </span>
                              <span className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer">
                                <MessageCircle className="w-3 h-3" /> 23
                              </span>
                            </div>
                          </div>
                        </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Phone Footer CTA */}
                <div className="border-t border-white/5 pt-2 pb-1 px-1.5 shrink-0 flex gap-1.5">
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

          {/* Third Panel: Original Image Gallery (Only in Card News mode) */}
          {generateMode === "card_news" && (
            <>
              <ResizableHandle className="bg-white/5 w-[1px] hover:bg-purple-500/30 transition-colors" />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full p-4 overflow-y-auto bg-black/60 flex flex-col gap-4 border-l border-white/5">
                  <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
                    <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> AI 생성 원본 이미지
                    </h3>
                    <p className="text-[10px] text-muted-foreground">프롬프트를 바탕으로 실시간 렌더링된 고화질 이미지입니다.</p>
                  </div>
                  
                  {generatedCardNews.length === 0 && !isGenerating && (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                      카드뉴스를 생성해주세요.
                    </div>
                  )}

                  {isGenerating && (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map((idx) => (
                        <Skeleton key={idx} className="w-full aspect-square rounded-xl bg-white/5" />
                      ))}
                    </div>
                  )}

                  {!isGenerating && generatedCardNews.map((card, idx) => (
                    <div key={idx} className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                      <span className="text-xs font-bold text-white/80">슬라이드 {idx + 1}</span>
                      {card.image_base64 ? (
                        <img
                          src={`data:image/png;base64,${card.image_base64}`}
                          alt={`Slide ${idx + 1}`}
                          className="w-full rounded-lg object-cover aspect-square bg-black/50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-white/5 flex flex-col items-center justify-center gap-3">
                          <Sparkles className="w-8 h-8 text-purple-400 opacity-40" />
                          <span className="text-xs text-white/30 text-center px-4">이미지를 생성하려면<br/>백엔드 서버를 실행하세요</span>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed bg-black/30 p-2 rounded">
                        <span className="text-purple-400 font-bold mr-1">Prompt:</span>
                        {card.image_prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>
    </div>
  );
}
