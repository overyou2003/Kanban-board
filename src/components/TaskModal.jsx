import { useBoards } from '../store/boards'
import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../store/auth'
import { RiDeleteBin5Fill } from "react-icons/ri";
import toast from 'react-hot-toast'

export default function TaskModal({ task, onClose }) {
  const { id } = useParams()               // boardId จาก path
  const { boards, updateTask, addComment, deleteTask } = useBoards()

  // ✅ หา board จาก store ตาม id
  const board = useMemo(() => boards.find(b => b.id === id), [boards, id])

  const { currentUser } = useAuth()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [type, setType] = useState(task.type || 'task')
  const [labels, setLabels] = useState((task.labels || []).join(','))
  const [assignee, setAssignee] = useState(task.assignee || '')
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [comment, setComment] = useState('')

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบ Task "${task.title}" จริง ๆ ใช่หรือไม่ ?`)) {
      deleteTask(id, task.id)             // ลบโดยส่ง boardId + taskId
      onClose()
    }
  }

  if (!board) return null; // กัน edge case

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3>EDIT TASK</h3>
          <button className="btn" onClick={handleDelete} style={{ color:'#ff6b6b' }}>
            <RiDeleteBin5Fill />
          </button>
        </div>

        <div className="col">
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="col">
          <label>Description</label>
          <textarea className="input" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="row">
          <div className="col" style={{ flex:1 }}>
            <label>Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              <option value="task">task</option>
              <option value="bug">bug</option>
              <option value="story">story</option>
            </select>
          </div>

          <div className="col" style={{ flex:1 }}>
            <label>Labels (comma)</label>
            <input className="input" value={labels} onChange={e => setLabels(e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="col" style={{ flex:1 }}>
            <label>Assignee</label>
            {/* ✅ เลือกจากสมาชิกบอร์ดเท่านั้น */}
            <select className="input" value={assignee} onChange={e => setAssignee(e.target.value)}>
              <option value="">— Unassigned —</option>
              {(board.members || []).map(m => (
                <option key={m.email} value={m.email}>{m.email}</option>
              ))}
            </select>
          </div>

          <div className="col" style={{ flex:1 }}>
            <label>Due date</label>
            <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="row" style={{ justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button
            className="btn primary"
            onClick={() => {
              if (assignee && !board.members.some(m => m.email === assignee)) {
                alert('Assignee ต้องเป็นสมาชิกในบอร์ดเท่านั้น')
                return
              }
              updateTask(id, task.id, {
                title,
                description,
                type,
                labels: labels.split(',').map(s => s.trim()).filter(Boolean),
                assignee,
                dueDate
              })
        
              onClose()
              toast.success('คุณเพิ่มสมาชิกผู้รับผิดชอบใน Task เรียบร้อย')

            }}
          >
            Save
          </button>
        </div>

        <hr className="sep" />

        <div className="col">
          <label>Add comment</label>
          <div className="row">
            <input
              className="input"
              style={{ flex:1 }}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button
              className="btn"
              onClick={() => {
                if (!comment.trim()) return
                addComment(id, task.id, comment.trim(), currentUser?.email || 'anon')
                setComment('')
              }}
            >
              Post
            </button>
          </div>
        </div>

        <div className="spacer"></div>

        <div className="col">
          <label>Comments</label>
          {(task.comments || []).length === 0 && <div className="small">No comments yet</div>}
          {(task.comments || []).map(c => (
            <div key={c.id} className="card" style={{ padding:'8px', background:'#0f0f17' }}>
              <div className="small" style={{ marginBottom:4 }}>
                {c.authorEmail} • {new Date(c.at).toLocaleString()}
              </div>
              <div>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
