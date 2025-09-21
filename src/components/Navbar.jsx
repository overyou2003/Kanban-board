import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { FaUserCircle } from "react-icons/fa";
import { BiFontSize } from 'react-icons/bi';
import { MdViewKanban } from "react-icons/md";



export default function Navbar(){
  const { currentUser, logout } = useAuth()
  const nav = useNavigate()
  return (
    <div className="navbar">
      <div className="container row" style={{justifyContent:'space-between'}}>
        <div className="brand"><MdViewKanban className='iconLogo' />KanbanBoard </div>
        <div className="row" style={{gap:16}}>
          {currentUser ? <FaUserCircle size={25} className='iconUser' /> : ""}
          {currentUser &&  <span className="small" style={{ fontSize: "15px" }}>{currentUser.username}</span>}
          {currentUser ? <Link className="link" to="/boards">Your Boards</Link> : ""}
          {currentUser ? (
            <button className="btn" onClick={()=>{ logout(); nav('/login') }}>Logout</button>
          ) : (
            <Link className="btn" to="/login">Login</Link>
          )}
          
          {currentUser ? "" : <Link className="btn" to="/register">Register</Link>}
        
        </div>
      </div>
    </div>
  )
}
