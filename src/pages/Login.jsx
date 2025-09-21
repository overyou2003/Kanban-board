import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')
  return (
    <div className="container" style={{maxWidth:420, paddingTop:40}}>
      <div className="card col">
        <h2>Login</h2>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="small" style={{color:'#fca5a5'}}>{err}</div>}
        <button className="btn primary" onClick={()=>{
          const e = login(email, password)
          if(e) setErr(e); else nav('/boards')
        }}>Sign in</button>
        <div className="small">No account? <Link className="link" to="/register">Register</Link></div>
      </div>
    </div>
  )
}
