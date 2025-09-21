import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuth = create(persist((set,get)=>({
  users: [],
  currentUser: null,
  register: (username , email , password) => {
    if(!username || username.trim() === "") {
      return 'กรุณากรอกชื่อของคุณ !'
    }

    if(username.length < 5) return 'กรุณากรอกชื่อของคุณมากกว่า 5 ตัว'
    
    
    if(!email || email.trim() === "") {
      return 'กรุณากรอกอีเมลของคุณ !'
    }
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      return "รูปแบบอีเมลไม่ถูกต้อง"
    }
    if(!password || password.trim() === "") {
      return 'กรุณากรอกรหัสผ่านของคุณ !'
    }

    if(password.length < 8) return 'กรุณากรอกรหัสผ่านให้มากกว่า 8 ตัว'
    const exists = get().users.find(u => u.email === email)
    if(exists) return 'อีเมลนี้ถูกใช้แล้ว'

    const user = { id: String(Date.now()), username , email , password }
    set(state => ({ users: [...state.users, user], currentUser: user }))
    return null
  },
  login: (email, password) => {
    const user = get().users.find(u => u.email === email && u.password === password)
    if(!user) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    set({ currentUser: user })
    return null
  },
  logout: () => set({ currentUser: null }),
}), { name: 'auth-store' }))
