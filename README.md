# 코딩 테스트 플랫폼 (Coding Test Platform)

온라인 코딩 테스트 문제를 풀고 관리하는 **올인원 플랫폼**입니다. 백준(Baekjoon), 프로그래머스 등 다양한 플랫폼의 문제를 한곳에서 풀 수 있으며, 푼 코드를 GitHub에 자동으로 커밋할 수 있습니다.

## 🚀 주요 기능

- **문제 검색 & 풀이**: 백준, 프로그래머스 등의 문제를 검색하고 에디터에서 직접 풀이
- **코드 에디터**: CodeMirror 기반의 다중 언어 지원 (Python, JavaScript, C++)
- **GitHub 연동**: 푼 코드를 자동으로 GitHub 저장소에 커밋
- **풀이 기록**: PostgreSQL 데이터베이스에 모든 제출 내역 저장
- **사용자 계정**: NextAuth.js를 통한 안전한 소셜 로그인
- **다크/라이트 모드**: 사용자 선호도에 따른 테마 지원

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: shadcn/ui (Radix UI 기반)
- **코드 에디터**: CodeMirror 6
- **스타일링**: Tailwind CSS
- **폼 관리**: React Hook Form

### Backend
- **런타임**: Node.js
- **API**: Next.js Server Actions
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **인증**: NextAuth.js
- **웹 스크래핑**: Cheerio

### DevTools
- **린터**: ESLint
- **CSS 프로세싱**: PostCSS
- **타입 체크**: TypeScript

## 📋 프로젝트 구조

```
codingtest/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지
│   │   ├── layout.tsx            # 레이아웃
│   │   ├── login/                # 로그인 페이지
│   │   ├── mypage/               # 마이페이지
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/ # NextAuth 설정
│   │   └── globals.css           # 글로벌 스타일
│   ├── components/
│   │   ├── shared/               # Navbar, ThemeToggle 등
│   │   ├── domain/               # 기능별 컴포넌트
│   │   │   ├── editor/           # 코드 에디터
│   │   │   └── problem/          # 문제 검색/뷰어
│   │   └── ui/                   # shadcn/ui 컴포넌트들
│   ├── services/
│   │   ├── bjh-crawler.ts        # 백준 크롤러
│   │   └── solved-api.ts         # Solved API 연동
│   ├── actions/
│   │   └── problem-action.ts     # Server Actions
│   ├── store/                    # Zustand 스토어
│   ├── types/                    # TypeScript 타입 정의
│   └── lib/
│       ├── prisma.ts             # Prisma 클라이언트
│       └── utils.ts              # 유틸리티 함수
├── prisma/
│   └── schema.prisma             # 데이터베이스 스키마
├── public/                        # 정적 자산
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 🗄️ 데이터베이스 스키마

### User (사용자)
- `id`: 고유 ID
- `email`: 이메일 (유니크)
- `name`: 사용자명
- `baekjoonId`: 백준 아이디
- `tier`: 백준 티어 (숫자)
- `solvedCount`: 해결한 문제 수
- `programmersId`: 프로그래머스 아이디
- `githubToken`: GitHub API 토큰
- `githubRepo`: GitHub 저장소 (예: `username/algo-repo`)

### Submission (제출 기록)
- `id`: 고유 ID
- `problemId`: 문제 번호
- `title`: 문제 제목
- `level`: 난이도 (Bronze, Silver 등)
- `code`: 풀이 코드
- `language`: 프로그래밍 언어
- `platform`: 플랫폼 (BAEKJOON, PROGRAMMERS)
- `userId`: 사용자 ID
- `createdAt`: 생성 시간

## 📦 설치 및 실행

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repository-url>
cd codingtest
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
# NextAuth.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:4000

# GitHub OAuth
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/codingtest_db

# 기타 API
SOLVED_AC_API=https://solved.ac/api/v3
```

### 3. 데이터베이스 설정
```bash
# Prisma 마이그레이션 및 클라이언트 생성
npm run db
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:4000](http://localhost:4000) 접속

## 🏃 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 서버 실행
```bash
npm start
```

### ESLint 실행
```bash
npm run lint
```

## 📝 주요 페이지

| 페이지 | 설명 |
|--------|------|
| `/` | 메인 페이지 - 문제 검색 및 풀이 |
| `/login` | 로그인 페이지 |
| `/mypage` | 마이페이지 - 제출 기록 및 통계 |

## 🔌 API & Server Actions

### fetchProblemAction
문제 정보를 조회하고 반환합니다.

```typescript
const problem = await fetchProblemAction(problemId);
```

### GitHub 연동
푼 코드를 자동으로 GitHub에 커밋합니다.

## 🎨 디자인 및 UI

- **다크/라이트 모드**: `ThemeToggle` 컴포넌트로 테마 전환
- **반응형 디자인**: Tailwind CSS로 모바일, 태블릿, 데스크톱 대응
- **UI 컴포넌트**: shadcn/ui의 다양한 컴포넌트 사용
  - 버튼, 입력창, 다이얼로그, 탭, 토글 등

## 📚 코드 에디터 기능

- **다중 언어 지원**:
  - Python
  - JavaScript/TypeScript
  - C++
- **테마**: One Dark (다크 모드)
- **코드 하이라이팅**: 문법 강조
- **자동 포맷팅**: 코드 정렬 기능

## 🔐 보안

- **NextAuth.js**: 안전한 세션 관리
- **OAuth 2.0**: GitHub, 기타 소셜 로그인
- **TypeScript**: 타입 안전성
- **환경 변수**: 민감한 정보 보호

## 🚀 추가 기능 (개발 계획)

- [ ] 코드 채점 자동화 (온라인 저지 API 연동)
- [ ] AI 기반 코드 분석 및 최적화 제안
- [ ] 팀 협업 기능
- [ ] 실시간 채팅 (코드 리뷰)
- [ ] 알고리즘 강의 자료 연동
- [ ] 성적 분석 및 통계 대시보드

## 🤝 기여

이슈나 풀 리퀘스트는 언제든 환영합니다!

## 📞 문의

문제가 있거나 제안사항이 있으면 이슈를 등록해주세요.

---

**개발자**: Godaye  
**최종 업데이트**: 2026년 1월 25일
