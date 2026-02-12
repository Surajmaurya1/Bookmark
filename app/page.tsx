import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/Dashboard'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
        </header>
        <Dashboard initialBookmarks={bookmarks || []} userId={user.id} />
      </div>
    </main>
  )
}
