"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, Plus, RefreshCw, Key, ShieldCheck, AlertCircle, 
  Trash2, ShieldAlert, Sparkles, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LinkedAccount {
  id: number;
  username: string;
  name: string;
  avatar: string;
  persona: string;
  tokenStatus: "valid" | "warning" | "expired";
  role: "main" | "booster";
  expiresIn: string;
}

const mockAccounts: LinkedAccount[] = [
  {
    id: 1,
    username: "tech_insights",
    name: "Tech Insights (메인)",
    avatar: "💻",
    persona: "개발자 구루 (Tech Insights)",
    tokenStatus: "valid",
    role: "main",
    expiresIn: "58일 남음",
  },
  {
    id: 2,
    username: "market_pulse",
    name: "Market Pulse",
    avatar: "📈",
    persona: "투자전문가 (Market Pulse)",
    tokenStatus: "warning",
    role: "booster",
    expiresIn: "2일 남음 (만료 임박)",
  },
  {
    id: 3,
    username: "viral_hacker",
    name: "Viral Hacker",
    avatar: "🎨",
    persona: "마케팅 구루 (Viral Hacker)",
    tokenStatus: "expired",
    role: "booster",
    expiresIn: "만료됨 (재인증 필요)",
  },
  {
    id: 4,
    username: "booster_alpha",
    name: "Booster Alpha",
    avatar: "🚀",
    persona: "일반 교양/유머",
    tokenStatus: "valid",
    role: "booster",
    expiresIn: "45일 남음",
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>(mockAccounts);
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkMeta = () => {
    setIsLinking(true);
    // Mock Meta Graph API redirect or link sequence
    setTimeout(() => {
      const newAccount: LinkedAccount = {
        id: accounts.length + 1,
        username: `new_creator_${Math.floor(Math.random() * 100)}`,
        name: "New Brand Channel",
        avatar: "✨",
        persona: "일반 교양/유머",
        tokenStatus: "valid",
        role: "booster",
        expiresIn: "60일 남음",
      };
      setAccounts(prev => [...prev, newAccount]);
      setIsLinking(false);
    }, 1500);
  };

  const handleDelete = (id: number) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Accounts Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">계정 연동 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">Meta OAuth API를 활용하여 메인 계정 및 자가 교차 부스팅용 서브 계정을 동기화합니다.</p>
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

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="bg-[#121212] border-white/5 bg-opacity-60 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all p-6">
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
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>페르소나 매핑:</span>
                  <span className="text-white font-semibold">{acc.persona}</span>
                </div>
                <div className="flex gap-2">
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
    </div>
  );
}
