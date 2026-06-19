import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Clock, Gift } from 'lucide-react'

import { supabase } from '../lib/supabase'

export default function MyOrders() {
  const [orders, setOrders] = useState([])

  const phone = localStorage.getItem('customer_phone') || ''

  async function loadOrders() {
    if (!phone) {
      setOrders([])
      return
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('phone', phone)
      .order('id', { ascending: false })

    setOrders(data || [])
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
        loadOrders
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function statusLabel(status) {
    if (status === 'recebido') return 'Recebido'
    if (status === 'preparando') return 'Preparando'
    if (status === 'entrega') return 'Saiu para entrega'
    if (status === 'finalizado') return 'Finalizado'
    if (status === 'cancelado') return 'Cancelado'
    return status
  }

  function estimatedTime(status) {
    if (status === 'recebido') return '30-40 min'
    if (status === 'preparando') return '15-25 min'
    if (status === 'entrega') return '5-10 min'
    if (status === 'finalizado') return 'Pedido concluído'
    if (status === 'cancelado') return 'Pedido cancelado'
    return 'Aguardando'
  }

  const steps = [
    { key: 'recebido', label: 'Recebido' },
    { key: 'preparando', label: 'Preparando' },
    { key: 'entrega', label: 'Saiu para entrega' },
    { key: 'finalizado', label: 'Finalizado' }
  ]

  function stepIndex(status) {
    return steps.findIndex(step => step.key === status)
  }

  return (
    <div className="min-h-screen bg-[#faf4ee]">

      <main className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-4xl font-black mb-2">
          MEUS PEDIDOS
        </h1>

        <p className="text-zinc-500 mb-8">
          Acompanhe seus pedidos em tempo real.
        </p>

        {orders.length === 0 ? (
          <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">

            <Package className="w-16 h-16 text-zinc-300 mb-4" />

            <p className="text-zinc-500 mb-5">
              Você ainda não fez nenhum pedido
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-amber-900 text-white px-5 py-3 rounded-xl font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver Cardápio
            </Link>

          </div>
        ) : (
          <div className="space-y-5">

            {orders.map(order => {
              const currentStep = stepIndex(order.status)

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5"
                >

                  <div className="flex items-start justify-between gap-4 mb-5">

                    <div>
                      <p className="text-sm text-zinc-500">
                        Pedido
                      </p>

                      <h2 className="text-2xl font-black">
                        #{order.id}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                        {statusLabel(order.status)}
                      </span>

                      <p className="flex items-center gap-1 justify-end text-xs text-zinc-500 mt-2">
                        <Clock className="w-3 h-3" />
                        {estimatedTime(order.status)}
                      </p>
                    </div>

                  </div>

                  {order.status !== 'cancelado' && (
                    <div className="mb-5">

                      {steps.map((step, index) => {
                        const active = index <= currentStep

                        return (
                          <div
                            key={step.key}
                            className="flex gap-3"
                          >

                            <div className="flex flex-col items-center">
                              <div
                                className={`
                                  w-4
                                  h-4
                                  rounded-full
                                  ${active ? 'bg-amber-900' : 'bg-zinc-300'}
                                `}
                              />

                              {index < steps.length - 1 && (
                                <div
                                  className={`
                                    w-0.5
                                    h-8
                                    ${active ? 'bg-amber-900' : 'bg-zinc-300'}
                                  `}
                                />
                              )}
                            </div>

                            <p
                              className={`
                                text-sm
                                font-bold
                                -mt-1
                                ${active ? 'text-amber-900' : 'text-zinc-400'}
                              `}
                            >
                              {step.label}
                            </p>

                          </div>
                        )
                      })}

                    </div>
                  )}

                  <div className="bg-zinc-50 rounded-2xl border p-4 space-y-3">

                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>

                        <span className="font-bold">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {order.loyalty_reward_name && (
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-sm pt-3 border-t">
                        <Gift className="w-4 h-4" />
                        Recompensa: {order.loyalty_reward_name}
                      </div>
                    )}

                  </div>

                  <div className="flex justify-between items-center mt-5 pt-4 border-t">

                    <span className="text-zinc-500">
                      Total
                    </span>

                    <span className="text-2xl font-black text-amber-900">
                      R$ {Number(order.total_amount || 0).toFixed(2)}
                    </span>

                  </div>

                </div>
              )
            })}

          </div>
        )}

      </main>

    </div>
  )
}