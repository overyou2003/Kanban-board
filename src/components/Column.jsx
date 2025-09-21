import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import { useState } from 'react'
import { useBoards } from '../store/boards'
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
  
export default function Column({board, column, tasks}){
  const {renameColumn , deleteColumn} = useBoards()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(column.title)
  
  return (
     <div className="kan-col">
        <div className="col-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {editingName ? (
          <input
            className="input"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={() => {
              if (newName.trim() && newName.trim() !== column.title) {
                renameColumn(board.id, column.id, newName.trim())
              }
              setEditingName(false)
            }}
            onKeyDown={e => {
              if (e.key === "Enter") e.currentTarget.blur()
              if (e.key === "Escape") {
                setEditingName(false)
                setNewName(column.title)
              }
            }}
            autoFocus
          />
        ) : (
          <h3 onClick={() => setEditingName(true)}>
            {column.title}<FaPencilAlt className='iconUpdateCol' style={{marginLeft : '10px'}}/>
          </h3>
        )} 
        <div 
          onClick={()=> {
            if (confirm(`คุณต้องการลบคอลัมน์ "${column.title}" จริง ๆ ใช่หรือไม่?`)) {
              deleteColumn(board.id , column.id)
            }
          }}><RiDeleteBin5Fill className='iconDelCol'/>
        </div>
        
        </div>
      
      <Droppable droppableId={column.id}>
        {(provided)=> (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{minHeight:10}}>
            {tasks.map((t,idx)=>(
              <TaskCard key={t.id} task={t} index={idx} 
              />
              
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
