import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag } from 'lucide-react'
import OrderCard from '../components/OrderCard'

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

const activeOrders = orders.filter(order =>
  ['recebido', 'preparando', 'entrega'].includes(order.status)
)

const pastOrders = orders.filter(order =>
  ['finalizado', 'cancelado'].includes(order.status)
)

return (
  <div className="min-h-screen bg-[#faf4ee]">

      <main className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-4xl font-title">
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

            <div className="space-y-8">

  {activeOrders.length > 0 && (
    <section>
      <div className="bg-amber-900 text-white rounded-3xl p-5 mb-5 shadow-sm">
  <p className="text-sm text-amber-100">
    Seu pedido está sendo preparado por
  </p>

  <h2 className="text-xl font-title">
    HORA BOA BURGER
  </h2>

  <p className="text-sm text-amber-100 mt-2">
    Acompanhe abaixo o andamento em tempo real.
  </p>
</div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍔</span>

        <h2 className="text-xl font-black">
          Em andamento
        </h2>
      </div>

      <div className="space-y-5">
        {activeOrders.map(order => (
          <OrderCard
  key={order.id}
  order={order}
  highlighted
/>
        ))}
      </div>
    </section>
  )}

  {pastOrders.length > 0 && (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📜</span>

        <h2 className="text-xl font-title">
          Histórico
        </h2>
      </div>

      <div className="space-y-5">
        {pastOrders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </section>
  )}

</div>

          </div>
        )}

      </main>

    </div>
  )
}