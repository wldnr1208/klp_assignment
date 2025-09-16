-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table for user data
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 20),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint title_length check (char_length(title) >= 1 and char_length(title) <= 200),
  constraint content_length check (char_length(content) >= 1 and char_length(content) <= 5000)
);

-- Create comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint content_length check (char_length(content) >= 1 and char_length(content) <= 1000)
);

-- Create indexes for better performance
create index posts_author_id_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index comments_post_id_idx on public.comments(post_id);
create index comments_author_id_idx on public.comments(author_id);
create index comments_created_at_idx on public.comments(created_at desc);

-- Create a view for posts with author info and comment count
create view public.posts_with_details as
select
  p.*,
  pr.username as author_username,
  pr.avatar_url as author_avatar_url,
  coalesce(c.comments_count, 0) as comments_count
from public.posts p
left join public.profiles pr on p.author_id = pr.id
left join (
  select
    post_id,
    count(*) as comments_count
  from public.comments
  group by post_id
) c on p.id = c.post_id;

-- Create a view for comments with author info
create view public.comments_with_details as
select
  c.*,
  pr.username as author_username,
  pr.avatar_url as author_avatar_url
from public.comments c
left join public.profiles pr on c.author_id = pr.id;

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_posts
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_comments
  before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- Function to create profile when user signs up
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

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();