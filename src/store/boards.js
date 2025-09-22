import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

export const useBoards = create(persist((set, get) => ({
  boards: [],

  createBoard: (name, ownerEmail) => {
    const id = uid()
    const board = {
      id,
      name,
      owner: ownerEmail,
      members: [{ email: ownerEmail, role: 'owner' }],
      columns: [
        { id: uid(), title: 'To Do', taskIds: [] },
        { id: uid(), title: 'In Progress', taskIds: [] },
        { id: uid(), title: 'Done', taskIds: [] },
      ],
      tasks: {},
      notifications: []
    }
    set(state => ({ boards: [...state.boards, board] }))
    return id
  },

  renameBoard: (boardId, name) => set(state => ({
    boards: state.boards.map(b => b.id === boardId ? { ...b, name } : b)
  })),

  deleteBoard: (boardId) => set(state => ({
    boards: state.boards.filter(b => b.id !== boardId)
  })),

  addColumn: (boardId, title) => {
    const newId = uid()
    set(state => ({
      boards: state.boards.map(b => b.id === boardId
        ? { ...b, columns: [...b.columns, { id: newId, title, taskIds: [] }] }
        : b)
    }))
    return newId
  },

  renameColumn: (boardId, columnId, title) => set(state => ({
    boards: state.boards.map(b => b.id === boardId ? {
      ...b,
      columns: b.columns.map(c => c.id === columnId ? ({ ...c, title }) : c)
    } : b)
  })),

  deleteColumn: (boardId, columnId) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b
      const idsToRemove = b.columns.find(c => c.id === columnId)?.taskIds || []
      const tasks = Object.fromEntries(Object.entries(b.tasks).filter(([id]) => !idsToRemove.includes(id)))
      return {
        ...b,
        tasks,
        columns: b.columns.filter(c => c.id !== columnId)
      }
    })
  })),

  createTask: (boardId, columnId, data) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b
      const id = uid()
      const task = {
        id,
        title: data.title,
        description: data.description || '',
        type: data.type || 'task',
        labels: data.labels || [],
        assignee: data.assignee || '',
        dueDate: data.dueDate || '',
        comments: []
      }
      return {
        ...b,
        tasks: { ...b.tasks, [id]: task },
        columns: b.columns.map(c => c.id === columnId ? { ...c, taskIds: [...c.taskIds, id] } : c)
      }
    })
  })),

  updateTask: (boardId, taskId, patch) => set(state => ({
    boards: state.boards.map(b => b.id === boardId ? {
      ...b,
      tasks: { ...b.tasks, [taskId]: { ...b.tasks[taskId], ...patch } }
    } : b)
  })),

  // ไม่ต้องรับ columnId: หาเองจาก taskId
  deleteTask: (boardId, taskId) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b
      const col = b.columns.find(c => c.taskIds.includes(taskId))
      const { [taskId]: _, ...rest } = b.tasks
      return {
        ...b,
        tasks: rest,
        columns: b.columns.map(c => col && c.id === col.id ? { ...c, taskIds: c.taskIds.filter(id => id !== taskId) } : c)
      }
    })
  })),

  moveTask: (boardId, sourceColId, destColId, taskId, destIndex) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b
      const cols = b.columns.map(c => ({ ...c }))
      const s = cols.find(c => c.id === sourceColId)
      const d = cols.find(c => c.id === destColId)
      if (!s || !d) return b
      s.taskIds = s.taskIds.filter(id => id !== taskId)
      d.taskIds = [...d.taskIds.slice(0, destIndex), taskId, ...d.taskIds.slice(destIndex)]
      return { ...b, columns: cols }
    })
  })),

  addComment: (boardId, taskId, text, authorEmail) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b
      const t = b.tasks[taskId]
      const c = { id: uid(), text, authorEmail, at: Date.now() }
      return { ...b, tasks: { ...b.tasks, [taskId]: { ...t, comments: [...(t.comments || []), c] } } }
    })
  })),

  addMember: (boardId, email, role = 'member') => {
    const lower = (email || '').trim().toLowerCase()
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
    const hasThai = /[ก-๙]/.test(lower)
    const hasUpper = /[A-Z]/.test(email || '')

    if (!emailRegex.test(lower) || hasThai || hasUpper) return false
      set(state => ({
        boards: state.boards.map(b =>
          b.id === boardId
            ? (b.members.some(m => m.email === lower)
                ? b
                : { ...b, members: [...b.members, { email: lower, role }] })
            : b
        )
      }))
    return true
  }

}), { name: 'boards-store' }))
