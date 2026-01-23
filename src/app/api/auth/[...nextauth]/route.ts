import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// 디버깅용: 서버 터미널에 Prisma가 제대로 잡히는지 출력합니다.
//console.log("=== Prisma 초기화 체크 ===");
//console.log("Prisma instance exist:", !!prisma);
//if (prisma) {
//  console.log("Prisma keys:", Object.keys(prisma));
//}

export const authOptions = {
  // adapter를 함수 형태로 감싸서 호출 시점에 prisma를 확실히 참조하게 합니다.
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) (session.user as any).id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };