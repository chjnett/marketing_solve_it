"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Clock, CheckCircle, AlertCircle, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Calendar campaign mock data
interface ScheduledItem {
  id: number;
  day: number;
  time: string;
  title: string;
  persona: string;
  status: "scheduled" | "published" | "failed";
}

const mockCampaigns: ScheduledItem[] = [
  { id: 1, day: 12, time: "18:00", title: "AI 시장 전망 & 투자 트렌드 분석", persona: "투자전문가", status: "published" },
  { id: 2, day: 15, time: "14:30", title: "Next.js App Router 최적화 기법", persona: "개발자 구루", status: "published" },
  { id: 3, day: 26, time: "18:30", title: "스레드 크로스 부스팅 알고리즘 설명", persona: "마케팅 전문가", status: "scheduled" },
  { id: 4, day: 26, time: "21:00", title: "SaaS 플랫폼 디자인 시스템 설계", persona: "개발자 구루", status: "scheduled" },
  { id: 5, day: 28, time: "09:00", title: "글로벌 테크 마켓 브리핑", persona: "투자전문가", status: "scheduled" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 26)); // May 2026
  const [campaigns, setCampaigns] = useState<ScheduledItem[]>(mockCampaigns);
  const [draggedItem, setDraggedItem] = useState<ScheduledItem | null>(null);

  const daysInMonth = 31;
  const startOffset = 5; // Friday (May 1, 2026 starts on Friday)

  // Generate date cells
  const dateCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: startOffset }, (_, i) => null);
  const allCells = [...emptyCells, ...dateCells];

  const handleDragStart = (item: ScheduledItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: number) => {
    if (!draggedItem) return;
    
    // Update the item's scheduled day
    setCampaigns(prev => 
      prev.map(item => item.id === draggedItem.id ? { ...item, day } : item)
    );
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">예약 캘린더</h1>
          <p className="text-sm text-muted-foreground mt-1">심리스 디자인으로 구현되어 Drag & Drop 방식으로 일정을 간편하게 이동 조정합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 p-1 rounded-lg">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-white rounded-md">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold font-heading px-3 text-white">2026년 5월</span>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-white rounded-md">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button className="glowing-btn bg-white text-black hover:bg-white/90 text-xs font-bold px-4 h-9 rounded-md transition-all flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> 새 예약 등록
          </Button>
        </div>
      </div>

      {/* Grid Seamless Calendar */}
      <div className="border border-white/5 rounded-2xl bg-[#121212]/30 backdrop-blur-sm p-6 overflow-hidden flex flex-col gap-6">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground border-b border-white/5 pb-3">
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {allCells.map((day, idx) => {
            const dayCampaigns = day ? campaigns.filter(c => c.day === day) : [];
            const isToday = day === 26;

            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={() => day && handleDrop(day)}
                className={`min-h-[120px] rounded-xl border border-transparent p-2.5 flex flex-col gap-2 transition-all relative ${
                  day ? "bg-[#121212]/40 hover:bg-[#1C1C1C]/40 hover:border-white/5" : "bg-transparent cursor-default"
                } ${isToday ? "bg-purple-950/20 border-purple-500/20" : ""}`}
              >
                {/* Date number */}
                {day && (
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isToday ? "text-purple-400 font-extrabold" : "text-white/80"}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 text-purple-400 px-1.5 py-0.5 rounded-full font-bold">
                        오늘
                      </span>
                    )}
                  </div>
                )}

                {/* Campaign items inside day cell */}
                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto scrollbar-none">
                  <AnimatePresence>
                    {dayCampaigns.map((camp) => (
                      <motion.div
                        key={camp.id}
                        layoutId={`campaign-${camp.id}`}
                        draggable
                        onDragStart={() => handleDragStart(camp)}
                        className={`text-[9px] p-1.5 rounded-lg border flex items-center justify-between gap-1 cursor-grab active:cursor-grabbing select-none group relative transition-all ${
                          camp.status === "published"
                            ? "bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/20 text-emerald-400"
                            : camp.status === "failed"
                            ? "bg-rose-950/20 border-rose-500/10 hover:border-rose-500/20 text-rose-400"
                            : "bg-purple-950/20 border-purple-500/10 hover:border-purple-500/20 text-purple-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <GripVertical className="w-2.5 h-2.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="truncate leading-tight font-semibold text-white/90">{camp.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-muted-foreground text-[8px]">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{camp.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Info Legend */}
      <div className="flex items-center gap-6 justify-end text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 발행 완료</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#A000FF]" /> 예약 대기</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> 에러 발생</span>
      </div>
    </div>
  );
}
