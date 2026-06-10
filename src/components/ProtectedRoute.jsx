import { useEffect, useState } from 'react'

import { Navigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {

    async function checkSession() {

      const {
        data: { session }
      } = await supabase.auth.getSession()

      setSession(session)

      setLoading(false)
    }

    checkSession()

  }, [])

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p className="text-2xl font-bold">
          Carregando...
        </p>

      </div>

    )
  }

  if (!session) {

    return <Navigate to="/admin-login" />
  }

  return children
}