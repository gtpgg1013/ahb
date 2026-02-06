# As Human Being (AHB)

> AI 시대에 인간만이 줄 수 있는 영감을 연결하는 플랫폼

AI가 실행과 생산을 담당하는 시대, 인간 고유의 가치인 **영감(Inspiration)**을 주고받는 공간입니다.

## 주요 기능

- **영감 기록** - 텍스트, 이미지 URL, 링크로 영감 포스팅
- **영감 탐색** - 피드 형태로 다른 사람의 영감 탐색 및 검색
- **상호작용** - 공감(Resonate), 댓글, 북마크 기능
- **알림** - 실시간 알림 (공감, 댓글, 북마크)
- **AI 기능** - 자동 태그 추천, 영감 요약, 개인화 추천

## 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: Claude API (Anthropic)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key  # AI 기능용 (선택)
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 4. 시드 데이터 (선택)

```bash
npx tsx scripts/seed.ts
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── recommendations/  # 개인화 추천
│   │   ├── suggest-tags/     # AI 태그 추천
│   │   └── summarize/        # AI 요약
│   ├── explore/           # 탐색 페이지
│   ├── inspiration/[id]/  # 영감 상세
│   ├── login/             # 로그인
│   ├── new/               # 새 영감 작성
│   ├── profile/           # 프로필
│   └── signup/            # 회원가입
├── components/            # 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── header.tsx        # 헤더
│   └── notifications.tsx # 알림
└── lib/                   # 유틸리티
    └── supabase/         # Supabase 클라이언트
```

## 데이터베이스 스키마

- `profiles` - 사용자 프로필
- `inspirations` - 영감 게시물
- `comments` - 댓글
- `resonates` - 공감
- `bookmarks` - 북마크
- `notifications` - 알림

## 라이선스

MIT
