import { useParams , useNavigate } from 'react-router-dom'
import { useBoards } from '../store/boards'
import { useAuth } from '../store/auth'
import { useMemo, useState } from 'react'
import Column from '../components/Column'
import { DragDropContext } from '@hello-pangea/dnd'
import { FaPencilAlt } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function BoardView(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { boards, addColumn, createTask, moveTask, addMember, renameBoard , deleteBoard } = useBoards()
  const { currentUser } = useAuth()
  const board = useMemo(()=> boards.find(b => b.id === id), [boards,id])
  const [colName,setColName] = useState('')
  const [newTaskTitle,setNewTaskTitle] = useState('')
  const [selectedColId,setSelectedColId] = useState(board?.columns?.[0]?.id)
  const [inviteEmail,setInviteEmail] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(board.name)
  const onAddColumn = () => {
    const name = colName.trim()
    if (!name) return
    const newId = addColumn(board.id, name)  
    setColName("")
    setSelectedColId(newId)                   
  }

  useEffect(() => {
  const ids = board.columns.map(c => c.id)
    if (ids.length === 0) {
      setSelectedColId("")       
    } else if (!ids.includes(selectedColId)) {
      setSelectedColId(ids[0])
    }
  }, [board.columns, selectedColId])

  if(!board) return <div className="container" style={{paddingTop:24}}><div className="card">Board not found</div></div>

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if(!destination) return
    if(destination.droppableId === source.droppableId && destination.index === source.index) return
    moveTask(board.id, source.droppableId, destination.droppableId, draggableId, destination.index)
  }

  return (
    <div className="container" style={{paddingTop:16}}>
      <div className="card row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div className="row" style={{gap:12}}>
          {editingName ? (
            <input
              className="input"
              value={newName}
              onChange={e=>setNewName(e.target.value)}
              onBlur={()=>{
                if(newName.trim()){
                  renameBoard(board.id, newName.trim())
                }
                setEditingName(false)
              }}
              autoFocus
            />
          ) : (
            <h2 style={{margin:0}} onClick={()=>setEditingName(true)}>
              {board.name}
            </h2>
          )}

          <button className="btn" onClick={()=>setEditingName(true)}>{editingName ? <FaSave /> : <FaPencilAlt/>}</button>
          <span className="small">• {board.members.length} members</span>
        </div>
        <div className="row" style={{gap:12 , flex:1 , justifyContent:'center'}}>
          <input className="input" placeholder="Invite by email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
          <button className="btn" onClick={()=>{ if(inviteEmail.trim()){ addMember(board.id, inviteEmail.trim(), 'member'); setInviteEmail('') } }}>Invite</button>
        </div>
        <button 
          style={{gap:12}}
          className="btn delete" 
          onClick={()=> {
            if (confirm(`คุณต้องการลบบอร์ด "${board.name}" จริง ๆ ใช่หรือไม่?`)) {
                  deleteBoard(board.id)
                  navigate("/boards")
                }
          }}><MdDelete/></button>
      </div>

      <div className="row" style={{gap:12, marginTop:12}}>
        <input className="input" placeholder="New column name" value={colName} onChange={e=>setColName(e.target.value)} />
        <button className="btn" onClick={onAddColumn}>Add Column</button>

        <select className="input" value={selectedColId} onChange={e=>setSelectedColId(e.target.value)}>
          {board.columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input className="input" style={{flex:1}} placeholder="New task title" value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} />
        <button className="btn primary" disabled={!selectedColId} onClick={()=>{
          if(!newTaskTitle.trim()) return
          createTask(board.id, selectedColId, { title: newTaskTitle.trim(), assignee: currentUser.email })
          setNewTaskTitle('')
        }}>Add Task</button>
      </div>

      <div className="colwrap" style={{marginTop:14}}>
        <DragDropContext onDragEnd={onDragEnd}>
          {board.columns.map(col => {
            const tasks = col.taskIds.map(id => board.tasks[id]).filter(Boolean)
            return <Column key={col.id} board={board} column={col} tasks={tasks} />
          })}
        </DragDropContext>
      </div>
    </div>
  )
}
