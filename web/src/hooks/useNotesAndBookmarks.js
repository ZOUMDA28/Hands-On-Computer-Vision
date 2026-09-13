import { useState, useEffect, useCallback } from 'react'

export function useNotesAndBookmarks() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('cv-tutorial-notes')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('cv-tutorial-bookmarks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cv-tutorial-notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem('cv-tutorial-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const addNote = useCallback((notebookId, content, anchor) => {
    const noteId = Date.now().toString()
    setNotes(prev => ({
      ...prev,
      [notebookId]: [
        ...(prev[notebookId] || []),
        { id: noteId, content, anchor, createdAt: new Date().toISOString() }
      ]
    }))
    return noteId
  }, [])

  const updateNote = useCallback((notebookId, noteId, content) => {
    setNotes(prev => ({
      ...prev,
      [notebookId]: (prev[notebookId] || []).map(n =>
        n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
      )
    }))
  }, [])

  const deleteNote = useCallback((notebookId, noteId) => {
    setNotes(prev => ({
      ...prev,
      [notebookId]: (prev[notebookId] || []).filter(n => n.id !== noteId)
    }))
  }, [])

  const getNotes = useCallback((notebookId) => {
    return notes[notebookId] || []
  }, [notes])

  const toggleBookmark = useCallback((notebookId, title, anchor) => {
    setBookmarks(prev => {
      const existing = prev.find(b => b.notebookId === notebookId && b.anchor === anchor)
      if (existing) {
        return prev.filter(b => b.id !== existing.id)
      }
      return [...prev, {
        id: Date.now().toString(),
        notebookId,
        title,
        anchor,
        createdAt: new Date().toISOString()
      }]
    })
  }, [])

  const isBookmarked = useCallback((notebookId, anchor) => {
    return bookmarks.some(b => b.notebookId === notebookId && b.anchor === anchor)
  }, [bookmarks])

  return {
    notes,
    bookmarks,
    addNote,
    updateNote,
    deleteNote,
    getNotes,
    toggleBookmark,
    isBookmarked
  }
}
