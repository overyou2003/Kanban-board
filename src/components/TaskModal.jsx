import { useBoards } from '../store/boards'
import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../store/auth'
import { RiDeleteBin5Fill } from "react-icons/ri"

export default function TaskModal({ task, onClose }){
  const { id } = useParams()
  const { boards, updateTask, addComment, deleteTask } = useBoards()
  const board = useMemo(() => boards.find(b => b.id === id), [boards, id])

  const { currentUser } = useAuth()
  const [title,setTitle] = useState(task.title)
  const [description,setDescription] = useState(task.description||'')
  const [type,setType] = useState(task.type||'task')
  const [labels,setLabels] = useState((task.labels||[]).join(','))
  const [assignee,setAssignee] = useState(task.assignee||'')
  const [dueDate,setDueDate] = useState(task.dueDate||'')
  const [comment,setComment] = useState('')

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบ Task "${task.title}" จริง ๆ ใช่หรือไม่ ?`)) {
      deleteTask(id, task.id)
      onClose()
    }
  }

  if (!board) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3>EDIT TASK</h3>
          <button className="btn" onClick={handleDelete} style={{color:"#ff6b6b"}}>
            <RiDeleteBin5Fill/>
          </button>
        </div>

        <div className="col">
          <label>Title</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="col">
          <label>Description</label>
          <textarea className="input" rows={4} value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="row">
          <div className="col" style={{flex:1}}>
            <label>Type</label>
            <select className="input" value={type} onChange={e=>setType(e.target.value)}>
              <option value="task">task</option>
              <option value="bug">bug</option>
              <option value="story">story</option>
            </select>
          </div>
          <div className="col" style={{flex:1}}>
            <label>Labels (comma)</label>
            <input className="input" value={labels} onChange={e=>setLabels(e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="col" style={{flex:1}}>
            <label>Assignee</label>
            <select className="input" value={assignee} onChange={e=>setAssignee(e.target.value)}>
              <option value="">— Unassigned —</option>
              {(board.members||[]).map(m => (
                <option key={m.email} value={m.email}>{m.email}</option>
              ))}
            </select>
          </div>
          <div className="col" style={{flex:1}}>
            <label>Due date</label>
            <input className="input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="row" style={{justifyContent:'flex-end', gap:8, marginTop:8}}>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={()=>{
            if (assignee && !board.members.some(m=>m.email===assignee)) {
              alert('Assignee ต้องเป็นสมาชิกในบอร์ดเท่านั้น')
              return
            }
            updateTask(id, task.id, {
              title, description, type,
              labels: labels.split(',').map(s=>s.trim()).filter(Boolean),
              assignee, dueDate
            })
            onClose()
          }}>Save</button>
        </div>
      </div>
    </div>
  )
}
