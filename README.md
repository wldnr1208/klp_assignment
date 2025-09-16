# 커뮤니티 앱 MVP

간단한 커뮤니티 앱을 React Native와 Expo로 구현한 MVP 프로젝트입니다.

## 주요 기능

- 🔐 회원가입/로그인
- 📝 글 작성/목록/상세보기
- 🖼️ 이미지 첨부
- 💬 댓글 작성

## 기술 스택

### Frontend
- **React Native 0.81.4** - 크로스플랫폼 앱 개발
- **Expo ~54.0.7** - 빠른 개발과 배포를 위한 플랫폼
- **TypeScript** - 타입 안정성과 개발 경험 향상

### 상태 관리 및 데이터 페칭
- **Zustand** - 가볍고 직관적인 전역 상태 관리
- **React Query (@tanstack/react-query)** - 서버 상태 관리 및 캐싱

### 백엔드 & 데이터베이스
- **Supabase** - Backend as a Service (인증, 데이터베이스, 실시간 구독)

## 기술 선택 이유

### Zustand
- Redux 대비 간단한 설정과 적은 보일러플레이트
- TypeScript 지원 우수
- 작은 번들 사이즈

### React Query
- 서버 상태와 클라이언트 상태의 명확한 분리
- 자동 캐싱, 리패칭, 동기화
- 로딩, 에러 상태 관리 간편

### Supabase
- PostgreSQL 기반의 완전한 백엔드 솔루션
- 실시간 구독 지원으로 댓글 등 실시간 기능 구현 용이
- Row Level Security로 보안 관리
- 빌트인 인증 시스템

## 개발 스크립트

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹에서 실행
npm run web

# 린팅
npm run lint
```

## 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 스크립트, 패키지 매니저 등

### Scope (선택사항)
- `auth`: 인증 관련
- `post`: 게시글 관련
- `comment`: 댓글 관련
- `ui`: UI 컴포넌트
- `api`: API 관련
- `config`: 설정 관련

### 예시
```
feat(auth): 로그인 기능 구현

- 이메일/패스워드 로그인 폼 추가
- Supabase Auth 연동
- 로그인 상태 관리 추가

Closes #1
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── screens/        # 화면 컴포넌트
├── store/          # Zustand 스토어
├── api/            # API 호출 함수
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
└── constants/      # 상수 정의
```

## 개발 단계

1. ✅ 프로젝트 초기 설정
2. 🔄 패키지 설치 및 기본 구조 설정
3. ⏳ 인증 기능 구현
4. ⏳ 게시글 CRUD 기능
5. ⏳ 이미지 업로드 기능
6. ⏳ 댓글 기능
7. ⏳ UI/UX 개선

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
