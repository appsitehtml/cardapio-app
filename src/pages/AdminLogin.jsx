import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { supabase } from '../lib/supabase'

export default function AdminLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function login() {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {

      toast.error('Login inválido')

      return
    }

    toast.success('Login realizado')

    navigate('/admin')
  }

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-zinc-100
      "
    >

      <div
        className="
          bg-white
          p-8
          rounded-3xl
          shadow-xl
          w-full
          max-w-md
        "
      >

        <h1 className="text-4xl font-bold mb-8 text-center">
          Admin Login 🔐
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-4 rounded-2xl"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-4 rounded-2xl"
          />

          <button
            onClick={login}
            className="
              w-full
              bg-green-600
              text-white
              py-4
              rounded-2xl
              font-bold

              transition-all
              duration-150

              hover:scale-105
              active:scale-95
              hover:bg-green-700
            "
          >
            Entrar
          </button>

        </div>

      </div>

    </div>
  )
}