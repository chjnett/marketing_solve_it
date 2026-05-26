"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { 
  MessageSquare, LayoutDashboard, Sparkles, Calendar, Settings, 
  Users, Bell, ChevronsUpDown, LogOut, PanelLeftClose, PanelLeft, Plus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const {
    activeWorkspace,
    isSidebarCollapsed,
    workspaces,
    setActiveWorkspace,
    setSidebarCollapsed,
    addWorkspace,
  } = useWorkspaceStore();

  const menuItems = [
    { name: "대시보드", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI 스레드 빌더", path: "/dashboard/builder", icon: Sparkles },
    { name: "예약 캘린더", path: "/dashboard/calendar", icon: Calendar },
    { name: "계정 연동 관리", path: "/dashboard/accounts", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden text-white font-sans">
      {/* GNB/LNB: Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full bg-[#0A0A0A] border-r border-white/5 flex flex-col z-30 shrink-0"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF007A] via-[#A000FF] to-[#00F0FF] p-[1px] flex items-center justify-center">
                  <span className="w-full h-full rounded-[7px] bg-[#0A0A0A] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </span>
                </span>
                <span className="font-heading text-base font-bold tracking-tight text-white">
                  Thread<span className="threads-gradient font-black">Pulse</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isSidebarCollapsed && (
            <div className="w-full flex justify-center">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF007A] via-[#A000FF] to-[#00F0FF] p-[1px] flex items-center justify-center">
                <span className="w-full h-full rounded-[7px] bg-[#0A0A0A] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </span>
              </span>
            </div>
          )}

          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Sidebar Workspace Switcher */}
        <div className="p-3 border-b border-white/5">
          <Popover>
            <PopoverTrigger className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left text-sm font-semibold transition-all cursor-pointer">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded-md bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {activeWorkspace[0]}
                </div>
                {!isSidebarCollapsed && (
                  <span className="truncate text-white/90">{activeWorkspace}</span>
                )}
              </div>
              {!isSidebarCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[236px] bg-[#121212] border-white/5 text-white p-1 rounded-lg">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">워크스페이스 선택</div>
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  onClick={() => setActiveWorkspace(ws)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-white/5 transition-colors"
                >
                  <span className={activeWorkspace === ws ? "text-purple-400 font-bold" : "text-white/80"}>
                    {ws}
                  </span>
                  {activeWorkspace === ws && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
              <hr className="border-white/5 my-1" />
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> 워크스페이스 추가
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 p-3 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger>
                  <Link href={item.path}>
                    <span
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                        isActive 
                          ? "bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/20 text-white" 
                          : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-purple-400" : ""}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                      {isActive && !isSidebarCollapsed && (
                        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#A000FF]" />
                      )}
                    </span>
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right" className="bg-[#121212] border-white/5 text-white">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 flex flex-col gap-2">
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="w-full text-muted-foreground hover:text-white hover:bg-white/5 h-10"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          )}

          <Popover>
            <PopoverTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left text-sm transition-all cursor-pointer">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                  CH
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-bold text-white/90">cheonhj</span>
                    <span className="truncate text-[10px] text-muted-foreground">Premium Plan</span>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-[236px] bg-[#121212] border-white/5 text-white p-1 rounded-lg">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">계정 정보</div>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-white/5 text-left text-white/80 transition-colors">
                <Settings className="w-3.5 h-3.5" /> 계정 설정
              </button>
              <hr className="border-white/5 my-1" />
              <button 
                onClick={() => router.push("/")}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-rose-950/20 text-left text-rose-400 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> 로그아웃
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span>워크스페이스</span>
            <span>/</span>
            <span className="text-white">{activeWorkspace}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Popover */}
            <Popover>
              <PopoverTrigger className="relative text-muted-foreground hover:text-white hover:bg-white/5 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#EF4444]" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 bg-[#121212] border-white/5 text-white p-3 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold">알림 내역</span>
                  <button className="text-[10px] text-purple-400 hover:underline">모두 읽음 표시</button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs flex flex-col gap-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-400 flex items-center gap-1">⚠️ Meta 토큰 만료 알림</span>
                      <span className="text-[10px] text-muted-foreground">10분 전</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      연동된 '투자전문가' 페르소나 계정의 API Access Token 만료가 임박했습니다. 재연동이 필요합니다.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs flex flex-col gap-1 opacity-70">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-400 flex items-center gap-1">✅ 스마트 예약 완료</span>
                      <span className="text-[10px] text-muted-foreground">1시간 전</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      'AI 트렌드 분석' 타래 스레드가 예정대로 정상 발행되었습니다.
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-6 w-[1px] bg-white/5" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">상태:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                API 정상 연결됨
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page contents */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
