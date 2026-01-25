/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
    ],
  },
  typescript: {
    // 빌드 시 타입 에러가 있어도 배포를 강행함
    ignoreBuildErrors: true, 
  },
  eslint: {
    // 빌드 시 ESLint 에러(미사용 변수 등)를 무시함
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
