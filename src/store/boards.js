import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36) }

export const useBoards = create(persist((set,get)=>({
  boards: [], // {id, name, members:[{email, role}], columns:[{id,title,taskIds:[]}], tasks:{[taskId]: Task}}
  createBoard: (name, ownerEmail) => {
    const b = {
      id: uid(),
      name,
      members: [{ email: ownerEmail, role: 'owner' }],
      columns: [
        { id: uid(), title: 'To Do', taskIds: [] },
        { id: uid(), title: 'In Progress', taskIds: [] },
        { id: uid(), title: 'Done', taskIds: [] }
      ],
      tasks: {},
      activity: [] // simple log
    }
    set(state => ({ boards: [...state.boards, b] }))
    return b.id
  },
  renameBoard: (boardId, name) => set(state => ({
    boards: state.boards.map(b => b.id === boardId ? { ...b, name } : b)
  })),
  deleteBoard: (boardId) => set(state => ({
  boards: state.boards.filter(b => b.id !== boardId)
  })),
  addMember: (boardId, email, role='member') => set(state => ({
    boards: state.boards.map(b => b.id===boardId ? (
      b.members.some(m=>m.email===email) ? b : { ...b, members: [...b.members, { email, role }] }
    ) : b)
  })),
  addColumn: (boardId, title) => {
  const newId = uid()
  set(state => ({
    boards: state.boards.map(b => b.id === boardId
      ? { ...b, columns: [...b.columns, { id: newId, title, taskIds: [] }] }
      : b
    )
  }))
  return newId
  },
  renameColumn: (boardId, colId, title) => set(state => ({
    boards: state.boards.map(b => b.id===boardId ? {
      ...b, columns: b.columns.map(c => c.id===colId ? { ...c, title } : c)
    } : b)
  })),
  deleteColumn: (boardId, colId) => set(state => ({
    boards: state.boards.map(b => b.id===boardId ? { ...b, columns: b.columns.filter(c=>c.id!==colId) } : b)
  })),
  createTask: (boardId, colId, data) => set(state => {
    const taskId = uid()
    const task = {
      id: taskId,
      title: data.title || 'Untitled',
      description: data.description || '',
      type: data.type || 'task',        // task | bug | story
      labels: data.labels || [],
      assignee: data.assignee || '',
      dueDate: data.dueDate || '',
      comments: [],
      history: [{ type:'create', when: Date.now() }]
    }
    return {
      boards: state.boards.map(b => {
        if(b.id!==boardId) return b
        return {
          ...b,
          tasks: { ...b.tasks, [taskId]: task },
          columns: b.columns.map(c => c.id===colId ? { ...c, taskIds: [...c.taskIds, taskId] } : c),
          activity: [...b.activity, { at: Date.now(), text: `Create task "${task.title}"` }]
        }
      })
    }
  }),
  updateTask: (boardId, taskId, patch) => set(state => ({
    boards: state.boards.map(b => b.id===boardId ? {
      ...b,
      tasks: { ...b.tasks, [taskId]: { ...b.tasks[taskId], ...patch } }
    } : b)
  })),
  deleteTask: (boardId, taskId) => set(state => ({
    boards: state.boards.map(b => {
      if (b.id !== boardId) return b

      const colWithTask = b.columns.find(c => c.taskIds.includes(taskId))
      const { [taskId]: _, ...restTasks } = b.tasks

      return {
        ...b,
        tasks: restTasks,
        columns: b.columns.map(c =>
          colWithTask && c.id === colWithTask.id
            ? { ...c, taskIds: c.taskIds.filter(id => id !== taskId) }
            : c
        )
      }
    })
  })),
  moveTask: (boardId, fromColId, toColId, taskId, toIndex) => set(state => ({
    boards: state.boards.map(b => {
      if(b.id!==boardId) return b
      const cols = b.columns.map(c => {
        if(c.id===fromColId){ return { ...c, taskIds: c.taskIds.filter(id => id!==taskId) } }
        return c
      }).map(c => {
        if(c.id===toColId){
          const ids = [...c.taskIds]
          const idx = typeof toIndex === 'number' ? toIndex : ids.length
          ids.splice(idx, 0, taskId)
          return { ...c, taskIds: ids }
        }
        return c
      })
      return { ...b, columns: cols, activity: [...b.activity, { at: Date.now(), text: `Move task ${taskId}` }] }
    })
  })),
  addComment: (boardId, taskId, text, authorEmail) => set(state => ({
    boards: state.boards.map(b => b.id===boardId ? {
      ...b, tasks: {
        ...b.tasks,
        [taskId]: { ...b.tasks[taskId], comments: [...b.tasks[taskId].comments, { id: uid(), text, authorEmail, at: Date.now() }] }
      }
    } : b)
  })),

  

}), { name: 'boards-store' }))
