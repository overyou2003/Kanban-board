import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBoards } from '../store/boards'
import { useAuth } from '../store/auth'
import { MdDelete } from "react-icons/md";

export default function Boards(){
  const { boards , createBoard , deleteBoard } = useBoards()
  const { currentUser } = useAuth()
  const [name,setName] = useState('')
  const navigate = useNavigate()
  return (
    <div className="container" style={{paddingTop:24}}>
      <div className="card col" style={{marginBottom:16}}>
        <h2>Your Boards</h2>
        <div className="row">
          <input className="input" placeholder="New board name" value={name} onChange={e=>setName(e.target.value)} />
          <button className="btn primary" onClick={()=>{ 
            if(!name.trim()) return
            const id = createBoard(name.trim(), currentUser.email)
            setName('')
          }}>Create</button>
        </div>
      </div>
      <div className="grid">
        {boards.map(b => (
          <Link key={b.id} className="card" to={`/boards/${b.id}`}>
            <div className="board-name"style={{fontWeight:700, fontSize:18}}>{b.name}
            <button 
              className="btn delete" 
              onClick={(e)=> {
                e.preventDefault() 
                e.stopPropagation() 
                if (confirm(`คุณต้องการลบบอร์ด "${b.name}" จริง ๆ ใช่หรือไม่?`)) {
                    deleteBoard(b.id)
                    navigate("/boards")
                  }
              }}><MdDelete/>
            </button>
            </div>
            <div className="small" style={{marginTop:8}}>{b.columns.reduce((a,c)=>a+c.taskIds.length,0)} tasks • {b.members.length} members</div>
          </Link>
        ))}
        {boards.length===0 && <div className="card">ยังไม่มีบอร์ด สร้างใหม่ด้านบนได้เลย</div>}
      </div>
    </div>
  )
}
