import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  // 1. 사용할 로그인 서비스 설정 (Github)
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  
  // 2. 보안 설정
  secret: process.env.NEXTAUTH_SECRET,

  // 3. 커스텀 페이지 설정 (선택 사항)
  pages: {
    signIn: '/login', // 로그인이 필요할 때 자동으로 보낼 경로
  },

  // 4. 세션 설정 (기본값은 JWT)
  session: {
    strategy: "jwt",
  },
})

// Next.js App Router에서는 GET과 POST 요청을 모두 처리하도록 내보내야 합니다.
export { handler as GET, handler as POST }