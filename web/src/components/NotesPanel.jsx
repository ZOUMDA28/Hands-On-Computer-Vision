import { useState } from 'react'
import { X, Plus, Trash2, Edit3, Check, BookMarked, StickyNote } from 'lucide-react'

export default function NotesPanel({ isOpen, onClose, notesHook, currentNotebook, language }) {
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'bookmarks'
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [newNote, setNewNote] = useState('')

  const t = language === 'zh' ? {
    notes: '笔记',
    bookmarks: '书签',
    close: '关闭',
    addNote: '添加笔记',
    noNotes: '暂无笔记',
    noBookmarks: '暂无书签',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    placeholder: '写下你的笔记...',
    all: '全部',
    current: '当前章节'
  } : {
    notes: 'Notes',
    bookmarks: 'Bookmarks',
    close: 'Close',
    addNote: 'Add Note',
    noNotes: 'No notes yet',
    noBookmarks: 'No bookmarks yet',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    placeholder: 'Write your note...',
    all: 'All',
    current: 'Current'
  }

  const currentNotes = currentNotebook ? (notesHook.notes[currentNotebook] || []) : []
  const allNotes = Object.entries(notesHook.notes).flatMap(([nbId, nbNotes]) =>
    nbNotes.map(n => ({ ...n, notebookId: nbId }))
  )

  const handleAddNote = () => {
    if (!newNote.trim() || !currentNotebook) return
    notesHook.addNote(currentNotebook, newNote.trim(), '')
    setNewNote('')
  }

  const handleStartEdit = (note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = (notebookId, noteId) => {
    notesHook.updateNote(notebookId, noteId, editContent)
    setEditingId(null)
    setEditContent('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩 */}
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl border-l transition-theme"
        style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        {/* 头部 */}
        <div 
          className="h-14 flex items-center justify-between px-4 border-b transition-theme"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors`}
              style={{ 
                color: activeTab === 'notes' ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === 'notes' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <StickyNote size={16} className="inline mr-1.5 -mt-0.5" />
              {t.notes}
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors`}
              style={{ 
                color: activeTab === 'bookmarks' ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === 'bookmarks' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <BookMarked size={16} className="inline mr-1.5 -mt-0.5" />
              {t.bookmarks}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-opacity-10 hover:bg-gray-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
          {activeTab === 'notes' ? (
            <div className="space-y-4">
              {/* 添加笔记 */}
              {currentNotebook && (
                <div 
                  className="p-4 rounded-xl border"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full p-3 rounded-lg text-sm resize-none outline-none border"
                    style={{ 
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-3 py-1.5 text-sm rounded-lg text-white disabled:opacity-50"
                      style={{ background: 'var(--accent)' }}
                    >
                      <Plus size={14} className="inline mr-1 -mt-0.5" />
                      {t.addNote}
                    </button>
                  </div>
                </div>
              )}

              {/* 笔记列表 */}
              {allNotes.length === 0 ? (
                <div 
                  className="text-center py-16 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <StickyNote size={32} className="mx-auto mb-3 opacity-30" />
                  {t.noNotes}
                </div>
              ) : (
                <div className="space-y-3">
                  {allNotes.map(note => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl border"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                    >
                      {editingId === note.id ? (
                        <>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 rounded-lg text-sm resize-none outline-none border"
                            style={{ 
                              background: 'var(--bg-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text)'
                            }}
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 text-sm rounded-lg"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => handleSaveEdit(note.notebookId, note.id)}
                              className="px-3 py-1 text-sm rounded-lg text-white"
                              style={{ background: 'var(--accent)' }}
                            >
                              <Check size={14} className="inline mr-1 -mt-0.5" />
                              {t.save}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span className="truncate max-w-[180px]">{note.notebookId}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStartEdit(note)}
                                className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500"
                                title={t.edit}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => notesHook.deleteNote(note.notebookId, note.id)}
                                className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500"
                                style={{ color: 'var(--error)' }}
                                title={t.delete}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {notesHook.bookmarks.length === 0 ? (
                <div 
                  className="text-center py-16 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BookMarked size={32} className="mx-auto mb-3 opacity-30" />
                  {t.noBookmarks}
                </div>
              ) : (
                <div className="space-y-2">
                  {notesHook.bookmarks.map(bm => (
                    <div
                      key={bm.id}
                      className="p-3 rounded-xl border flex items-start justify-between"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                          {bm.title}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {bm.notebookId}
                        </div>
                      </div>
                      <button
                        onClick={() => notesHook.toggleBookmark(bm.notebookId, bm.title, bm.anchor)}
                        className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 flex-shrink-0"
                        style={{ color: 'var(--error)' }}
                        title={t.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
