import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

export default function MyOrders() {

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

  useEffect(() => {

    loadOrders()

    const channel = supabase

      .channel('my-orders')

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

  function getStatusColor(status) {

    switch (status) {

      case 'recebido':
        return 'bg-zinc-300 text-zinc-800'

      case 'preparando':
        return 'bg-yellow-400 text-black'

      case 'entrega':
        return 'bg-blue-500 text-white'

      case 'finalizado':
        return 'bg-green-600 text-white'

      default:
        return 'bg-zinc-200'
    }
  }

  return (

    <div className="min-h-screen bg-zinc-100 p-6">

      <div className="flex items-center justify-between mb-8">

        <h1 className="text-4xl font-bold">
          Meus Pedidos 🍔
        </h1>

        <div
          className="
            bg-green-100
            text-green-700
            px-4
            py-2
            rounded-full
            text-sm
            font-bold
          "
        >
          Atualizando ao vivo
        </div>

      </div>

      <div className="space-y-6">

        {orders.map(order => (

          <div
            key={order.id}
            className="
              bg-white
              rounded-3xl
              p-6
              shadow-lg
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold">
                  Pedido #{order.id}
                </h2>

                <p className="text-zinc-500 mt-1">
                  {order.customer_name}
                </p>

                <p className="text-zinc-500">
                  {order.phone}
                </p>

              </div>

              <div
                className={`
                  px-4
                  py-2
                  rounded-full
                  font-bold
                  ${getStatusColor(order.status)}
                `}
              >
                {order.status}
              </div>

            </div>

            <div className="mt-6 space-y-3">

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

            <div className="mt-6 pt-6 border-t">

              <div className="flex justify-between items-center">

                <span className="text-zinc-500">
                  Total
                </span>

                <span className="text-2xl font-bold text-green-600">
                  R$ {Number(order.total_amount).toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}