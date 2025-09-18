# 데이터베이스 스키마 문서

## 개요
커뮤니티 앱의 PostgreSQL 데이터베이스 스키마 설계 및 Supabase Row Level Security(RLS) 정책입니다.

## 테이블 구조

### 1. profiles
사용자 프로필 정보를 저장하는 테이블입니다.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**컬럼 설명:**
- `id`: Supabase Auth 사용자 ID와 연결되는 기본 키
- `username`: 고유한 사용자명 (3-20자, 영문/숫자/언더스코어만 허용)
- `email`: 사용자 이메일
- `avatar_url`: 프로필 이미지 URL (선택사항)
- `created_at`: 계정 생성 시간
- `updated_at`: 마지막 수정 시간

**제약 조건:**
- `username_length`: 사용자명은 3-20자 제한
- `username_format`: 영문자, 숫자, 언더스코어만 허용

### 2. posts
게시글 정보를 저장하는 테이블입니다.

```sql
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**컬럼 설명:**
- `id`: 게시글 고유 ID
- `title`: 게시글 제목 (1-200자)
- `content`: 게시글 내용 (1-5000자)
- `image_url`: 첨부 이미지 URL (선택사항)
- `author_id`: 작성자 ID (profiles 테이블 참조)
- `created_at`: 게시글 작성 시간
- `updated_at`: 마지막 수정 시간

**제약 조건:**
- `title_length`: 제목은 1-200자 제한
- `content_length`: 내용은 1-5000자 제한

### 3. comments
댓글 정보를 저장하는 테이블입니다.

```sql
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**컬럼 설명:**
- `id`: 댓글 고유 ID
- `content`: 댓글 내용 (1-1000자)
- `post_id`: 댓글이 달린 게시글 ID
- `author_id`: 댓글 작성자 ID
- `created_at`: 댓글 작성 시간
- `updated_at`: 마지막 수정 시간

**제약 조건:**
- `content_length`: 댓글 내용은 1-1000자 제한

## 인덱스

성능 최적화를 위한 인덱스 설정:

```sql
-- 게시글 관련 인덱스
create index posts_author_id_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- 댓글 관련 인덱스
create index comments_post_id_idx on public.comments(post_id);
create index comments_author_id_idx on public.comments(author_id);
create index comments_created_at_idx on public.comments(created_at desc);
```

## 뷰 (Views)

### posts_with_details
게시글 정보와 작성자 정보, 댓글 수를 함께 조회하는 뷰:

```sql
create view public.posts_with_details as
select
  p.*,
  pr.username as author_username,
  pr.avatar_url as author_avatar_url,
  coalesce(c.comments_count, 0) as comments_count
from public.posts p
left join public.profiles pr on p.author_id = pr.id
left join (
  select post_id, count(*) as comments_count
  from public.comments
  group by post_id
) c on p.id = c.post_id;
```

### comments_with_details
댓글 정보와 작성자 정보를 함께 조회하는 뷰:

```sql
create view public.comments_with_details as
select
  c.*,
  pr.username as author_username,
  pr.avatar_url as author_avatar_url
from public.comments c
left join public.profiles pr on c.author_id = pr.id;
```

## 트리거 및 함수

### 자동 updated_at 업데이트
모든 테이블의 `updated_at` 컬럼을 자동으로 업데이트하는 트리거:

```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;
```

### 자동 프로필 생성
새 사용자가 회원가입할 때 자동으로 프로필을 생성하는 트리거:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;
```

## Row Level Security (RLS) 정책

### Profiles 테이블
- **조회**: 모든 사용자가 프로필 조회 가능
- **생성**: 자신의 프로필만 생성 가능
- **수정/삭제**: 자신의 프로필만 수정/삭제 가능

### Posts 테이블
- **조회**: 모든 사용자가 게시글 조회 가능
- **생성**: 인증된 사용자만 게시글 작성 가능
- **수정/삭제**: 작성자만 자신의 게시글 수정/삭제 가능

### Comments 테이블
- **조회**: 모든 사용자가 댓글 조회 가능
- **생성**: 인증된 사용자만 댓글 작성 가능
- **수정/삭제**: 작성자만 자신의 댓글 수정/삭제 가능

## Storage 정책

### post-images 버킷
이미지 파일 업로드를 위한 Supabase Storage 버킷:

- **업로드**: 인증된 사용자만 이미지 업로드 가능
- **조회**: 모든 사용자가 이미지 조회 가능
- **수정/삭제**: 업로드한 사용자만 자신의 이미지 수정/삭제 가능

## 사용법

### 마이그레이션 적용
1. Supabase 프로젝트에서 SQL Editor를 열기
2. `supabase/migrations/20240916000001_initial_schema.sql` 파일 내용을 실행
3. `supabase/migrations/20240916000002_rls_policies.sql` 파일 내용을 실행

### TypeScript 타입 생성
Supabase CLI를 사용하여 TypeScript 타입을 자동 생성할 수 있습니다:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```