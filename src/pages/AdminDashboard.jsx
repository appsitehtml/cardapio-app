import { useEffect, useState } from 'react'
import { Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  async function loadData() {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')

    const { data: productsData } = await supabase
      .from('products')
      .select('*')

    setOrders(ordersData || [])
    setProducts(productsData || [])
  }

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const finishedOrders = orders.filter(order => order.status === 'finalizado')
  const activeOrders = orders.filter(order =>
    ['recebido', 'preparando', 'entrega'].includes(order.status)
  )

  const revenue = finishedOrders.reduce(
    (acc, order) => acc + Number(order.total_amount || 0),
    0
  )

  const today = new Date().toISOString().split('T')[0]

const todayRevenue = orders
  .filter(order =>
    order.status === 'finalizado' &&
    order.created_at?.startsWith(today)
  )
  .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

  const todayOrders = orders.filter(order =>
    order.created_at?.slice(0, 10) === today
  )

  const cards = [
    {
      title: 'Receita Bruta',
      value: `R$ ${revenue.toFixed(2)}`,
      helper: `${finishedOrders.length} pedidos finalizados`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
  title: 'Receita Hoje',
  value: `R$ ${todayRevenue.toFixed(2)}`,
  helper: `${todayOrders.length} pedidos hoje`,
  icon: DollarSign,
  color: 'text-green-700',
  bg: 'bg-green-100'
},
    {
      title: 'Pedidos Hoje',
      value: todayOrders.length,
      helper: `${activeOrders.length} em andamento`,
      icon: ShoppingBag,
      color: 'text-amber-700',
      bg: 'bg-amber-100'
    },
    {
      title: 'Produtos',
      value: products.length,
      helper: `${products.filter(product => product.active !== false).length} disponíveis`,
      icon: Package,
      color: 'text-orange-700',
      bg: 'bg-orange-100'
    },
    {
      title: 'Pedidos Finalizados',
      value: finishedOrders.length,
      helper: 'Total geral',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    }
  ]

  return (
    <AdminLayout>
      <div>

        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-wide">
            DASHBOARD
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            junho de 2026
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5 mb-8">
          {cards.map(card => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-zinc-200
                  shadow-sm
                  p-5
                  relative
                  overflow-hidden
                "
              >

                <div
                  className={`
                    absolute
                    -right-6
                    -top-6
                    w-24
                    h-24
                    rounded-full
                    ${card.bg}
                  `}
                />

                <p className="text-sm text-zinc-500">
                  {card.title}
                </p>

                <p className={`text-3xl font-black mt-2 ${card.color}`}>
                  {card.value}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                  <Icon className="w-4 h-4" />
                  {card.helper}
                </div>

              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-8">

          <h2 className="text-xl font-black mb-6">
            PEDIDOS EM ANDAMENTO
          </h2>

          {activeOrders.length === 0 ? (
            <div className="py-14 text-center text-zinc-500">
              Nenhum pedido em andamento
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  className="flex justify-between items-center border-b pb-4"
                >
                  <div>
                    <p className="font-bold">
                      Pedido #{order.id} — {order.customer_name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {order.status}
                    </p>
                  </div>

                  <p className="font-bold text-green-600">
                    R$ {Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-xl font-black mb-5">
              PRODUTOS
            </h2>

            <div className="flex items-center gap-4">
              <div className="bg-orange-100 text-orange-700 p-3 rounded-xl">
                <Package className="w-6 h-6" />
              </div>

              <div>
                <p className="text-3xl font-black">
                  {products.length}
                </p>

                <p className="text-sm text-zinc-500">
                  produtos cadastrados
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-xl font-black mb-5">
              PEDIDOS FINALIZADOS
            </h2>

            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <div>
                <p className="text-3xl font-black">
                  {finishedOrders.length}
                </p>

                <p className="text-sm text-zinc-500">
                  Total geral
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}