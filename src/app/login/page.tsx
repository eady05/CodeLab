'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Github } from "lucide-react"; // lucide-react가 설치되어 있어야 함

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Card className="w-[350px] border-slate-800 bg-slate-900 text-slate-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter">
            Code <span className="text-blue-500">Lab</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            당신의 알고리즘을 컴파일하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full bg-slate-50 text-slate-950 hover:bg-slate-200"
          >
            <Github className="mr-2 h-4 w-4" />
            Github로 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}