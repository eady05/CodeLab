export { default } from "next-auth/middleware"

// 이 경로들은 로그인이 되어 있어야만 접속 가능합니다.
export const config = { 
  matcher: [
    "/",                // 메인 페이지 보호
    "/problems/:path*", // 문제 리스트 및 상세 페이지 보호
    "/solve/:path*"     // 풀이 페이지 보호
  ] 
}