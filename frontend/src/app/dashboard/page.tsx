"use client";

import { motion } from "framer-motion";
import { 
  Users, MessageSquare, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, 
  Clock, CheckCircle, Play 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Recharts dummy traffic data styled for dark theme
const chartData = [
  { date: "05.20", views: 4200, interactions: 280 },
  { date: "05.21", views: 5100, interactions: 340 },
  { date: "05.22", views: 4800, interactions: 310 },
  { date: "05.23", views: 7200, interactions: 590 },
  { date: "05.24", views: 8900, interactions: 740 },
  { date: "05.25", views: 11000, interactions: 920 },
  { date: "05.26", views: 12500, interactions: 1100 },
];

const campaigns = [
  {
    id: 1,
    title: "AI 시장 전망 & 투자 트렌드 분석 스레드",
    persona: "투자전문가",
    status: "scheduled",
    time: "오늘 18:30 (예약)",
  },
  {
    id: 2,
    title: "Next.js 15 App Router 성능 극대화 가이드",
    persona: "개발자 구루",
    status: "published",
    time: "어제 14:00 (발행 완료)",
  },
  {
    id: 3,
    title: "스레드 크로스 부스팅 알고리즘 동작 설명",
    persona: "마케팅 전문가",
    status: "failed",
    time: "05.24 09:15 (토큰 만료 실패)",
  },
];

export default function DashboardPage() {
  const cards = [
    { title: "총 노출수 (Total Impressions)", value: "54.2K", desc: "지난 주 대비 +24.8%", icon: TrendingUp, color: "text-[#00F0FF]" },
    { title: "총 상호작용 (Total Interactions)", value: "4,280", desc: "지난 주 대비 +18.4%", icon: MessageSquare, color: "text-[#FF007A]" },
    { title: "연동 계정수 (Connected Accounts)", value: "5개", desc: "서브 계정 4개 포함", icon: Users, color: "text-[#A000FF]" },
    { title: "발행 성공률 (Success Rate)", value: "98.2%", desc: "총 120회 발행 중", icon: Sparkles, color: "text-yellow-400" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">워크스페이스의 전반적인 스레드 발행 상태 및 성과 메트릭을 요약합니다.</p>
        </div>
        <Button className="glowing-btn bg-white text-black hover:bg-white/90 text-xs font-bold px-4 h-9 rounded-md transition-all flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 fill-black" /> 캠페인 즉시 실행
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="bg-[#121212] border-white/5 bg-opacity-60 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
                  <Icon className={`w-4 h-4 ${card.color} opacity-80`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-white">{card.value}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Chart & Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart */}
        <Card className="lg:col-span-2 bg-[#121212] border-white/5 bg-opacity-60 backdrop-blur-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">채널 트래픽 분석</h3>
              <p className="text-xs text-muted-foreground">지난 7일간의 총 노출수 및 상호작용 성장 추세</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-white/90">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" /> 노출수
              </span>
              <span className="flex items-center gap-1.5 text-white/90">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF007A]" /> 상호작용
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF007A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#A0A0A0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#A0A0A0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                />
                <Area type="monotone" dataKey="views" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="interactions" stroke="#FF007A" strokeWidth={2} fillOpacity={1} fill="url(#colorInteractions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Campaign Schedule List */}
        <Card className="bg-[#121212] border-white/5 bg-opacity-60 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">최근 예약 및 발행 내역</h3>
              <p className="text-xs text-muted-foreground">현재 활성화된 캠페인 스케줄 현황</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 relative group hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white/95 leading-tight truncate">{camp.title}</span>
                    {camp.status === "scheduled" && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-bold">
                        <Clock className="w-2.5 h-2.5" /> 예약
                      </span>
                    )}
                    {camp.status === "published" && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                        <CheckCircle className="w-2.5 h-2.5" /> 완료
                      </span>
                    )}
                    {camp.status === "failed" && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400 font-bold">
                        <AlertCircle className="w-2.5 h-2.5" /> 에러
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {camp.persona} 페르소나
                    </span>
                    <span>{camp.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="ghost" className="w-full text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-white/5 h-9 rounded-md transition-all mt-4 flex items-center justify-center gap-1">
            전체 캠페인 관리 <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
