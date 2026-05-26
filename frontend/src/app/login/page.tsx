"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, ShieldCheck, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = zod.object({
  email: zod.string().email({ message: "올바른 이메일 형식을 입력해주세요." }).or(zod.literal("")),
  password: zod.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }).or(zod.literal("")),
});

const registerSchema = zod.object({
  name: zod.string().min(2, { message: "이름은 최소 2자 이상이어야 합니다." }),
  email: zod.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: zod.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
  confirmPassword: zod.string().min(6, { message: "비밀번호 확인을 입력해주세요." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

function AuthFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRegisterParam = searchParams.get("register") === "true";
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: any) => api.login(email, password),
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => {
      // Simulate registration delay
      return new Promise((resolve) => setTimeout(resolve, 1200));
    },
    onSuccess: () => {
      setIsRegister(false);
      router.push("/login");
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@threadpulse.com", password: "password123" },
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onLogin = (data: any) => {
    const email = data.email || "demo@threadpulse.com";
    const password = data.password || "password123";
    loginMutation.mutate({ email, password });
  };

  const onRegister = (data: any) => {
    registerMutation.mutate({ name: data.name, email: data.email, password: data.password });
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-center items-center px-6 relative bg-[#0A0A0A] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] pointer-events-none opacity-25 blur-[120px]">
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#FF007A] to-[#A000FF]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-gradient-to-bl from-[#00F0FF] to-[#A000FF]" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 mb-2">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007A] via-[#A000FF] to-[#00F0FF] p-[1.5px] flex items-center justify-center">
            <span className="w-full h-full rounded-[10px] bg-[#0A0A0A] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </span>
          </span>
          <span className="font-heading text-2xl font-black text-white">
            Thread<span className="threads-gradient">Pulse</span>
          </span>
        </Link>

        {/* Card wrapper */}
        <Card className="w-full glassmorphism bg-[#121212]/60 border-white/5 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-heading text-xl font-bold text-white">
                  {isRegister ? "회원가입" : "로그인"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isRegister ? "스레드 채널 자동 성장의 첫걸음을 내딛으세요." : "이메일 계정으로 안전하게 로그인하세요."}
                </p>
              </div>

              {/* Form Content switcher with animations */}
              <AnimatePresence mode="wait">
                {isRegister ? (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegisterSubmit(onRegister)}
                    className="flex flex-col gap-4"
                  >
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> 이름
                      </label>
                      <Input
                        type="text"
                        placeholder="홍길동"
                        {...registerRegister("name")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {registerErrors.name && (
                        <span className="text-[10px] text-rose-500 font-semibold">{registerErrors.name.message}</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> 이메일
                      </label>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...registerRegister("email")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {registerErrors.email && (
                        <span className="text-[10px] text-rose-500 font-semibold">{registerErrors.email.message}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> 비밀번호
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...registerRegister("password")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {registerErrors.password && (
                        <span className="text-[10px] text-rose-500 font-semibold">{registerErrors.password.message}</span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 비밀번호 확인
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...registerRegister("confirmPassword")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {registerErrors.confirmPassword && (
                        <span className="text-[10px] text-rose-500 font-semibold">{registerErrors.confirmPassword.message}</span>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="glowing-btn bg-white text-black hover:bg-white/90 text-sm font-bold h-10 rounded-lg transition-all mt-2">
                      {isLoading ? "생성 중..." : "회원가입 완료"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLoginSubmit(onLogin)}
                    className="flex flex-col gap-4"
                  >
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> 이메일
                      </label>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...loginRegister("email")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {loginErrors.email && (
                        <span className="text-[10px] text-rose-500 font-semibold">{loginErrors.email.message}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> 비밀번호
                        </label>
                        <a href="#" className="text-[10px] text-purple-400 hover:text-purple-300 font-medium">비밀번호 분실?</a>
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...loginRegister("password")}
                        className="bg-white/5 border-white/5 hover:border-white/10 focus:border-purple-500/50 text-white rounded-lg transition-all h-10"
                      />
                      {loginErrors.password && (
                        <span className="text-[10px] text-rose-500 font-semibold">{loginErrors.password.message}</span>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="glowing-btn bg-white text-black hover:bg-white/90 text-sm font-bold h-10 rounded-lg transition-all mt-2">
                      {isLoading ? "로그인 중..." : "대시보드 입장"}
                    </Button>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">
                      ℹ️ 데모 모드: 이메일/비밀번호가 비어있어도 버튼만 누르면 바로 대시보드로 입장 가능합니다.
                    </span>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Form Footer */}
              <div className="text-center text-xs mt-4">
                {isRegister ? (
                  <span className="text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <button
                      onClick={() => setIsRegister(false)}
                      className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                    >
                      로그인하기
                    </button>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    아직 계정이 없으신가요?{" "}
                    <button
                      onClick={() => setIsRegister(true)}
                      className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                    >
                      무료 회원가입
                    </button>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Link href="/" className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
          메인 화면으로 돌아가기 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        로드 중...
      </div>
    }>
      <AuthFormContent />
    </Suspense>
  );
}
