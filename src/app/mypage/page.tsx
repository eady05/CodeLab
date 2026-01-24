import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyPageClient from "./MyPageClient"; // 클라이언트 컴포넌트 불러오기


// 💡 반드시 export default async function으로 선언해야 합니다!
export default async function MyPage() {
  const session = await getServerSession(authOptions);

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 1. 💡 세션 정보 대신 DB에서 "진짜 최신" 유저 정보를 가져옵니다.
  const dbUser = await prisma.user.findUnique({
    where: {
      id: Number((session.user as any).id)
    },
    // 스키마에 추가한 필드들이 확실히 포함되도록 합니다.
  });

  if (!dbUser) {
    redirect("/");
  }

  // 2. DB에서 데이터 가져오기
  const submissions = await prisma.submission.findMany({
    where: {
      userId: Number((session.user as any).id)
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // 클라이언트 컴포넌트에 데이터 전달
  return <MyPageClient user={dbUser} submissions={submissions} />;
}