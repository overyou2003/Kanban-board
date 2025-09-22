import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Boards from './pages/Boards'
import BoardView from './pages/BoardView'
import { useAuth } from './store/auth'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

function Guard({children}){
  const { currentUser } = useAuth()
  if(!currentUser) return <Navigate to="/login" replace/>
  return children
}

export default function App(){
  return (
    <div style={{minHeight:'100%'}}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/boards" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/boards" element={<Guard><Boards/></Guard>} />
        <Route path="/boards/:id" element={<Guard><BoardView/></Guard>} />
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  )
}
