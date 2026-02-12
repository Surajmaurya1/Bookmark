-- Create a table for bookmarks
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table bookmarks enable row level security;

-- Create Policy: Users can select their own bookmarks
create policy "Users can select their own bookmarks"
on bookmarks for select
using ( auth.uid() = user_id );

-- Create Policy: Users can insert their own bookmarks
create policy "Users can insert their own bookmarks"
on bookmarks for insert
with check ( auth.uid() = user_id );

-- Create Policy: Users can delete their own bookmarks
create policy "Users can delete their own bookmarks"
on bookmarks for delete
using ( auth.uid() = user_id );

-- Enable Realtime for this table
alter publication supabase_realtime add table bookmarks;
