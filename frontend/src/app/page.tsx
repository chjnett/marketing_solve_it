"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare, Zap, Target, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LandingPage() {
  const features = [
    {
      title: "스마트 예약 (Smart Scheduling)",
      description: "Meta Threads 최적 시간대 분석을 통해 오디언스가 가장 활성화된 타이밍에 맞춰 글을 자동 발행합니다.",
      icon: Zap,
    },
    {
      title: "AI 카피 생성 (AI Copilot)",
      description: "Gemini 1.5 엔진을 활용하여 주제 키워드와 어그로 레벨 조정을 통해 바이럴 가능한 완벽한 스레드 타래를 만듭니다.",
      icon: Sparkles,
    },
    {
      title: "크로스 부스팅 (Cross Boosting)",
      description: "본인 소유의 서브 계정들을 스케줄러와 연동하여 발행 직후 자연스러운 교차 댓글 및 인게이지먼트를 자가 형성합니다.",
      icon: Target,
    },
    {
      title: "다중 계정 관리 (Multi-Account)",
      description: "여러 개의 스레드 브랜드 채널을 대시보드 하나에서 손쉽게 전환하며 토큰 관리부터 통계 분석까지 원스톱으로 처리합니다.",
      icon: Users,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden selection:bg-white/10 selection:text-white">
      {/* Background decoration: Minimal single-color subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-purple-600 blur-[160px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-white">
              Thread<span className="font-black text-purple-400">Pulse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            <a href="#features" className="hover:text-white transition-colors">주요 기능</a>
            <a href="#pricing" className="hover:text-white transition-colors">요금제</a>
            <a href="#about" className="hover:text-white transition-colors">소개</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-xs font-bold text-white/80 hover:text-white hover:bg-white/5 h-9 px-4 rounded-lg">
                로그인
              </Button>
            </Link>
            <Link href="/login?register=true">
              <Button className="bg-white text-black hover:bg-white/90 text-xs font-bold px-5 h-9 rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                무료 시작하기
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger className="md:hidden text-white hover:bg-white/5 flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0A0A0A] border-white/5 text-white">
              <div className="flex flex-col gap-6 mt-8">
                <a href="#features" className="text-lg font-semibold hover:text-purple-400 transition-colors">주요 기능</a>
                <a href="#pricing" className="text-lg font-semibold hover:text-purple-400 transition-colors">요금제</a>
                <a href="#about" className="text-lg font-semibold hover:text-purple-400 transition-colors">소개</a>
                <hr className="border-white/5 my-2" />
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">로그인</Button>
                </Link>
                <Link href="/login?register=true" className="w-full">
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">무료 시작하기</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center gap-6 md:gap-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Threads Copilot</span>
          </div>

          {/* Headline: Clean Monochrome layout */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-heading tracking-tighter leading-[0.95] text-white">
            AUTOMATE YOUR THREADS,<br />
            <span className="text-white/40">AMPLIFY YOUR PULSE.</span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground font-normal leading-relaxed">
            최첨단 Gemini AI 카피 생성과 자가 교차 부스팅 기술로 계정 도달률과 참여도를 폭발적으로 극대화합니다.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link href="/login?register=true" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-black hover:bg-white/90 text-sm font-bold px-8 h-11 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                지금 무료로 시작하기 <ArrowRight className="w-4 h-4 text-black" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-white text-sm font-semibold px-8 h-11 rounded-lg backdrop-blur-sm transition-all">
                서비스 알아보기
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-4 h-7 rounded-full border border-white/10 flex justify-center p-1"
          >
            <div className="w-1 h-1 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 w-full relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">FEATURES</span>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-white">
            스레드 채널 성장을 위한 유일한 솔루션
          </h2>
          <p className="max-w-lg text-muted-foreground text-xs md:text-sm">
            간결한 디자인과 간편한 대시보드로 복잡한 스레드 마케팅 운영을 완전히 자동화하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="glassmorphism-card h-full min-h-[280px] relative overflow-hidden group border-white/5 bg-[#121212]/30 hover:bg-[#121212]/80 transition-all duration-300">
                  <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                    <div className="flex flex-col gap-6">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
                        <Icon className="w-4.5 h-4.5 text-white/80 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="font-heading text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Minimalist View More overlay on hover */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                      <p className="text-white font-heading font-semibold text-sm mb-4">
                        상세 기능 보기
                      </p>
                      <Link href="/login">
                        <Button size="sm" className="bg-white text-black hover:bg-white/90 font-bold text-xs flex items-center gap-1 rounded-lg">
                          지금 체험하기 <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#0A0A0A] py-8 text-center text-[10px] text-muted-foreground relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ThreadPulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
