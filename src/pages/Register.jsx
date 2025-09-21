import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Register(){
  const { register } = useAuth()
  const nav = useNavigate()
  const [username,setUsername] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')
  return (
    <div className="container" style={{maxWidth:420, paddingTop:40}}>
      <div className="card col">
        <h2>Register</h2>
        <input className="input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="small" style={{color:'#fca5a5'}}>{err}</div>}
        <button className="btn primary" onClick={()=>{
          const e = register(username , email , password)
          if(e) setErr(e); else nav('/boards')
        }}>Create account</button>
        <div className="small">Already have an account? <Link className="link" to="/login">Login</Link></div>
      </div>
    </div>
  )
}
