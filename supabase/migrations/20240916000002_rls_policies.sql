-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Profiles policies
-- Users can read all profiles (for displaying author info)
create policy "Anyone can view profiles" on public.profiles
  for select using (true);

-- Users can insert their own profile
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Users can delete their own profile
create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

-- Posts policies
-- Anyone can read posts
create policy "Anyone can view posts" on public.posts
  for select using (true);

-- Authenticated users can create posts
create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.role() = 'authenticated' and auth.uid() = author_id);

-- Authors can update their own posts
create policy "Authors can update own posts" on public.posts
  for update using (auth.uid() = author_id);

-- Authors can delete their own posts
create policy "Authors can delete own posts" on public.posts
  for delete using (auth.uid() = author_id);

-- Comments policies
-- Anyone can read comments
create policy "Anyone can view comments" on public.comments
  for select using (true);

-- Authenticated users can create comments
create policy "Authenticated users can create comments" on public.comments
  for insert with check (auth.role() = 'authenticated' and auth.uid() = author_id);

-- Authors can update their own comments
create policy "Authors can update own comments" on public.comments
  for update using (auth.uid() = author_id);

-- Authors can delete their own comments
create policy "Authors can delete own comments" on public.comments
  for delete using (auth.uid() = author_id);

-- Storage policies for image uploads
-- Create storage bucket for post images
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

-- Allow authenticated users to upload images
create policy "Authenticated users can upload post images" on storage.objects
  for insert with check (
    bucket_id = 'post-images' and
    auth.role() = 'authenticated'
  );

-- Allow anyone to view images
create policy "Anyone can view post images" on storage.objects
  for select using (bucket_id = 'post-images');

-- Allow users to update their own images
create policy "Users can update own post images" on storage.objects
  for update using (
    bucket_id = 'post-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
create policy "Users can delete own post images" on storage.objects
  for delete using (
    bucket_id = 'post-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );