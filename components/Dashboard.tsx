'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ExternalLink, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Bookmark {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export default function Dashboard({ initialBookmarks, userId }: { initialBookmarks: Bookmark[], userId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Realtime subscription
    const channel = supabase
      .channel('realtime bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newUrl) return

    const { error } = await supabase.from('bookmarks').insert({
      title: newTitle,
      url: newUrl,
      user_id: userId
    })

    if (error) {
      console.error('Error adding bookmark:', error.message, error.details, error.hint)
      alert(`Error adding bookmark: ${error.message}`)
    } else {
      setNewTitle('')
      setNewUrl('')
    }
  }

  const deleteBookmark = async (id: string) => {
    // Optimistic update: Remove immediately
    const bookmarkToDelete = bookmarks.find(b => b.id === id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    
    if (error) {
        console.error('Error deleting bookmark:', error.message, error.details, error.hint)
        alert(`Error deleting bookmark: ${error.message}`)
        // Revert if error
        if (bookmarkToDelete) {
            setBookmarks(prev => [...prev, bookmarkToDelete])
        }
    }
  }

  const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.refresh()
  }

  return (
    <div>
        <div className="mb-8 flex justify-end">
            <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Sign out
            </button>
        </div>

      <form onSubmit={addBookmark} className="mb-8 rounded-lg bg-white p-6 shadow-sm border">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Add New Bookmark</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={!newTitle || !newUrl}
          >
            <Plus className="h-5 w-5" />
            Add
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-10 w-10 min-w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {bookmark.title.charAt(0).toUpperCase()}
                </div>
              <div className="truncate">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:text-blue-600 flex items-center gap-2"
                >
                  <span className="truncate">{bookmark.title}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <p className="text-sm text-gray-500 truncate">{bookmark.url}</p>
              </div>
            </div>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete bookmark"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        {bookmarks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                No bookmarks yet. Add one above!
            </div>
        )}
      </div>
    </div>
  )
}
