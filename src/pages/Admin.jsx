import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

export default function Admin() {

    const navigate = useNavigate()

  const [orders, setOrders] = useState([])

  async function loadOrders() {

    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    if (data) {
      setOrders(data)
    }
  }

  async function logout() {

  await supabase.auth.signOut()

  navigate('/admin-login')
}

  async function updateStatus(id, status) {

    await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
  }

  useEffect(() => {

    loadOrders()

    const channel = supabase

      .channel('admin-orders')

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadOrders()
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  return (

    <div className="min-h-screen bg-zinc-100 p-6">

      <div className="flex justify-between items-center mb-8">

  <h1 className="text-4xl font-bold">
    Painel Admin 🚀
  </h1>

  <button
    onClick={logout}
    className="
      bg-red-500
      text-white

      px-5
      py-3

      rounded-2xl

      font-bold

      transition-all
      duration-150

      hover:bg-red-600
      hover:scale-105
      active:scale-95
    "
  >
    Sair
  </button>

</div>

      <div className="space-y-6">

        {orders.map(order => (

          <div
            key={order.id}
            className="bg-white rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold">
                  {order.customer_name}
                </h2>

                <p className="text-zinc-500 mt-1">
                  {order.phone}
                </p>

                <p className="text-zinc-500">
                  {order.address}
                </p>

                <p className="mt-3 font-bold text-green-600">
                  R$ {Number(order.total_amount).toFixed(2)}
                </p>

              </div>

              <div className="text-right">

                <p className="font-bold text-lg capitalize">
                  {order.status}
                </p>

              </div>

            </div>

            <div className="mt-6 space-y-2">

              {order.items?.map((item, index) => (

                <div
                  key={index}
                  className="flex justify-between"
                >

                  <span>
                    {item.quantity}x {item.name}
                  </span>

                  <span>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>

                </div>

              ))}

            </div>

            <div className="flex gap-2 mt-6 flex-wrap">

              <button
                onClick={() => updateStatus(order.id, 'recebido')}
                className="bg-zinc-300 px-4 py-2 rounded-xl"
              >
                Recebido
              </button>

              <button
                onClick={() => updateStatus(order.id, 'preparando')}
                className="bg-yellow-400 px-4 py-2 rounded-xl"
              >
                Preparando
              </button>

              <button
                onClick={() => updateStatus(order.id, 'entrega')}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl"
              >
                Saiu Entrega
              </button>

              <button
                onClick={() => updateStatus(order.id, 'finalizado')}
                className="bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                Finalizado
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}