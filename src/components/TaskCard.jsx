import { Draggable } from '@hello-pangea/dnd'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TaskModal from './TaskModal'
import { FaPencilAlt } from "react-icons/fa"
import { RiDeleteBin5Fill } from "react-icons/ri"
import { useBoards } from '../store/boards'

export default function TaskCard({task, index}){
  const [open,setOpen] = useState(false)
  const { id } = useParams()
  const { deleteTask , updateTask } = useBoards()

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบ Task "${task.title}" จริง ๆ ใช่หรือไม่ ?`)) {
      deleteTask(id, task.id)
    }
  }

  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(task.title)
  const saveTitle = () => {
    const t = newTitle.trim()
    if (t && t !== task.title) {
      updateTask(id, task.id, { title: t })
    }
    setEditingTitle(false)
  }

  return (
    <div className='taskContainer'>
      <Draggable draggableId={String(task.id)} index={index}>
        {(provided)=> (
          <div className="task" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={()=>setOpen(true)}>
            <div className="task-header" style={{display:'flex' , alignItems:'center' , justifyContent:'space-between' }}>
              <div className="titleTask">
                {editingTitle ? (
                  <input
                    className="input"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => {
                      if (e.key === "Enter") e.currentTarget.blur()
                      if (e.key === "Escape") {
                        setEditingTitle(false)
                        setNewTitle(task.title)
                      }
                    }}
                    autoFocus
                    onMouseDown={e=>e.stopPropagation()}
                    onClick={e=>e.stopPropagation()}
                  />
                ) : (
                  <h3 onClick={(e) => { e.stopPropagation(); setEditingTitle(true) }}>
                    {task.title}<FaPencilAlt className='iconUpdateTask' style={{marginLeft : '10px'}}/>
                  </h3>
                )}
              </div>
              <div onClick={(e) => {e.stopPropagation(); handleDelete();}} style={{cursor:'pointer'}}>
                <RiDeleteBin5Fill className='iconDelTask'/>
              </div>
            </div>
            <div className="spacer"></div>
            <div className="row" style={{flexWrap:'wrap', gap:6}}>
              {task.type && <span className="badge">{task.type}</span>}
              {task.labels?.map(l => <span key={l} className="badge">{l}</span>)}
              {task.dueDate && <span className="badge">Due {task.dueDate}</span>}
            </div>
          </div>
        )}
      </Draggable>
      {open && <TaskModal task={task} onClose={()=>setOpen(false)} />}
    </div>
  )
}
