"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Smartphone, Edit3, Trash2, Send, 
  MessageCircle, RefreshCw, Layers, Smile, AlertCircle,
  ImagePlus, ScanSearch, CheckCircle2, X, Upload, Download
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

  // Reference image analysis state
  const [referenceImages, setReferenceImages] = useState<{ file: string; preview: string }[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"ocr_only" | "style_only" | "full">("full");
  const [referenceStyle, setReferenceStyle] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    mutationFn: ({ topic, persona, level, refStyle }: any) => {
      console.log(`%c[Builder Page] 📡 useMutation triggered. Calling api.generateCardNews with topic: "${topic}", persona: "${persona}", aggroLevel: ${level}, hasRef: ${!!refStyle}`, "color: #3B82F6; font-weight: bold;");
      return api.generateCardNews(topic, persona, level, refStyle);
    },
    onSuccess: (data) => {
      console.log(`%c[Builder Page] 🏆 Mutation successful! Setting generatedCardNews state to:`, "color: #10B981; font-weight: bold;", data);
      setGeneratedCardNews(data);
    },
    onError: (err) => {
      console.error(`%c[Builder Page] 💥 Mutation error occurred:`, "color: #EF4444; font-weight: bold;", err);
    }
  });

  const analyzeReferenceMutation = useMutation({
    mutationFn: ({ images, mode }: { images: string[]; mode: "ocr_only" | "style_only" | "full" }) => {
      console.log(`%c[Builder Page] 🔍 Analyzing ${images.length} reference images, mode: ${mode}`, "color: #8B5CF6; font-weight: bold;");
      return api.analyzeReference(images, mode);
    },
    onSuccess: (data) => {
      console.log(`%c[Builder Page] ✅ Reference analysis complete:`, "color: #10B981; font-weight: bold;", data);
      setReferenceStyle(data);
    },
    onError: (err) => {
      console.error(`%c[Builder Page] 💥 Reference analysis error:`, "color: #EF4444; font-weight: bold;", err);
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
  const isAnalyzing = analyzeReferenceMutation.isPending;

  // Convert File to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data:image/...;base64, prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).slice(0, 5 - referenceImages.length);
    const newImages = await Promise.all(
      fileArr.map(async (file) => ({
        file: await fileToBase64(file),
        preview: URL.createObjectURL(file),
      }))
    );
    setReferenceImages((prev) => [...prev, ...newImages].slice(0, 5));
    // Reset previous analysis when new images added
    setReferenceStyle(null);
  }, [referenceImages.length, fileToBase64]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleImageFiles(e.dataTransfer.files);
  }, [handleImageFiles]);

  // Global paste handler — active only in card_news mode
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (generateMode !== "card_news") return;
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItems = items.filter(item => item.type.startsWith("image/"));
    if (imageItems.length === 0) return;
    e.preventDefault();
    const files = imageItems
      .map(item => item.getAsFile())
      .filter((f): f is File => f !== null);
    if (files.length > 0) {
      console.log(`%c[Builder Page] 📋 Paste detected: ${files.length} image(s)`, "color: #8B5CF6; font-weight: bold;");
      await handleImageFiles(files);
    }
  }, [generateMode, handleImageFiles]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleGenerate = () => {
    console.log(`\n%c[Builder Page] 🖱️ AI Generate Button Clicked!`, "color: #F59E0B; font-weight: bold;");
    console.log(`[Builder Page] - Mode: "${generateMode}"`);
    console.log(`[Builder Page] - Topic: "${topic}"`);
    console.log(`[Builder Page] - Persona: "${persona}"`);
    console.log(`[Builder Page] - Aggro Level: ${aggroLevel[0]}`);
    console.log(`[Builder Page] - Tone: "${tone}"`);
    console.log(`[Builder Page] - Reference Style: ${referenceStyle ? '✅ Applied' : '❌ None'}`);
    
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
          refStyle: referenceStyle,
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

  const handleDownloadAllImages = async () => {
    if (generatedCardNews.length === 0) return;
    
    const zip = new JSZip();
    let hasImages = false;

    generatedCardNews.forEach((card, index) => {
      if (card.image_base64) {
        hasImages = true;
        // Add base64 string to zip
        zip.file(`cardnews_slide_${index + 1}.jpg`, card.image_base64, { base64: true });
      }
    });

    if (!hasImages) {
      alert("다운로드할 수 있는 이미지가 없습니다.");
      return;
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "threadpulse_cardnews.zip");
    } catch (error) {
      console.error("ZIP 생성 오류:", error);
      alert("ZIP 파일 생성 중 오류가 발생했습니다.");
    }
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

              {/* Reference Image Upload — only shown in card_news mode */}
              {generateMode === "card_news" && (
                <>
                  <hr className="border-white/5" />
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                        <ScanSearch className="w-4 h-4 text-purple-400" />
                        2. 레퍼런스 분석 <span className="text-[10px] font-normal text-muted-foreground ml-1">(선택)</span>
                      </h3>
                      <p className="text-[10px] text-muted-foreground">카드뉴스 레퍼런스 이미지를 올리면 Gemini Vision이 스타일을 분석해 생성에 반영합니다.</p>
                    </div>

                    {/* Analysis Mode Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">분석 범위</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([
                          { id: "ocr_only", label: "📝 텍스트만", desc: "OCR 추출" },
                          { id: "style_only", label: "🎨 스타일만", desc: "디자인 분석" },
                          { id: "full", label: "⚡ 통합분석", desc: "텍스트+스타일" },
                        ] as const).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setAnalysisMode(m.id)}
                            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                              analysisMode === m.id
                                ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                                : "bg-white/3 border-white/8 text-muted-foreground hover:border-white/20"
                            }`}
                          >
                            <span className="text-[11px] font-bold">{m.label}</span>
                            <span className="text-[9px] opacity-70">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => referenceImages.length < 5 && fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[80px] ${
                        isDragOver
                          ? "border-purple-400 bg-purple-500/10"
                          : referenceImages.length > 0
                          ? "border-white/10 bg-white/3 hover:border-white/20"
                          : "border-white/10 hover:border-purple-400/40 hover:bg-purple-500/5"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                      />

                      {referenceImages.length === 0 ? (
                        <>
                          <Upload className="w-6 h-6 text-purple-400/60" />
                          <div className="text-center">
                            <p className="text-xs text-white/60 font-semibold">드래그 · 클릭 · 붙여넣기</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">최대 5장 · JPG, PNG, WEBP</p>
                            <p className="text-[9px] text-purple-400/60 mt-1">⌘V / Ctrl+V 로도 추가 가능</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full">
                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {referenceImages.map((img, i) => (
                              <div key={i} className="relative group aspect-square">
                                <img
                                  src={img.preview}
                                  alt={`ref ${i + 1}`}
                                  className="w-full h-full object-cover rounded-lg border border-white/10"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReferenceImages((prev) => prev.filter((_, idx) => idx !== i));
                                    setReferenceStyle(null);
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                            {referenceImages.length < 5 && (
                              <div className="aspect-square rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                                <ImagePlus className="w-4 h-4 text-white/30" />
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] text-muted-foreground text-center">
                            {referenceImages.length}/5장 업로드됨 · 클릭하여 추가
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Analyze Button */}
                    {referenceImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => analyzeReferenceMutation.mutate({
                          images: referenceImages.map(i => i.file),
                          mode: analysisMode,
                        })}
                        disabled={isAnalyzing}
                        className={`w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                          referenceStyle
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
                            : isAnalyzing
                            ? "bg-purple-600/20 border-purple-500/30 text-purple-300 cursor-not-allowed"
                            : "bg-purple-600/15 border-purple-500/30 text-purple-300 hover:bg-purple-600/25"
                        }`}
                      >
                        {isAnalyzing ? (
                          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gemini Vision 분석 중...</>
                        ) : referenceStyle ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> 분석 완료 — 재분석하기</>
                        ) : (
                          <><ScanSearch className="w-3.5 h-3.5" /> 레퍼런스 분석 시작</>
                        )}
                      </button>
                    )}

                    {/* Analysis Result Card */}
                    {referenceStyle && !referenceStyle.error && (
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-bold text-emerald-300">분석 완료 · 생성 시 자동 적용됩니다</span>
                        </div>
                        {referenceStyle.language_tone && (
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-purple-400 shrink-0 w-14">언어 톤</span>
                            <span className="text-[9px] text-white/70 leading-relaxed">{referenceStyle.language_tone}</span>
                          </div>
                        )}
                        {referenceStyle.color_palette && (
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-purple-400 shrink-0 w-14">색상</span>
                            <span className="text-[9px] text-white/70 leading-relaxed line-clamp-2">{referenceStyle.color_palette}</span>
                          </div>
                        )}
                        {referenceStyle.layout_pattern && (
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-purple-400 shrink-0 w-14">레이아웃</span>
                            <span className="text-[9px] text-white/70 leading-relaxed line-clamp-2">{referenceStyle.layout_pattern}</span>
                          </div>
                        )}
                        {referenceStyle.visual_mood && (
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-purple-400 shrink-0 w-14">무드</span>
                            <span className="text-[9px] text-white/70 leading-relaxed">{referenceStyle.visual_mood}</span>
                          </div>
                        )}
                        {referenceStyle.main_headlines?.length > 0 && (
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-purple-400 shrink-0 w-14">헤드라인</span>
                            <span className="text-[9px] text-white/70 leading-relaxed line-clamp-2">{referenceStyle.main_headlines.join(" / ")}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => { setReferenceStyle(null); }}
                          className="text-[9px] text-red-400/60 hover:text-red-400 transition-colors mt-1 text-left cursor-pointer"
                        >
                          ✕ 레퍼런스 적용 해제
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

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
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" /> AI 생성 이미지 갤러리
                      </h3>
                      {generatedCardNews.length > 0 && !isGenerating && (
                        <Button 
                          onClick={handleDownloadAllImages}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-purple-300 hover:text-white hover:bg-purple-500/20"
                        >
                          <Download className="w-3 h-3 mr-1" /> 일괄 다운로드
                        </Button>
                      )}
                    </div>
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
                          <span className="text-xs text-white/30 text-center px-4">이미지 생성 차단<br/><span className="text-[10px]">(AI 정책: 인물/폭력적 묘사 제한)</span></span>
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
