import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, Printer, Wifi } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('active')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('todos')

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    if (data) setOrders(data)
  }

  async function togglePaid(order) {
    await supabase
      .from('orders')
      .update({ paid: !order.paid })
      .eq('id', order.id)

    loadOrders()
  }

  function getTier(levelPoints) {
  if (levelPoints >= 1500) return 'diamante'
  if (levelPoints >= 800) return 'ouro'
  if (levelPoints >= 300) return 'prata'

  return 'bronze'
}

 async function addLoyaltyPoints(order) {
  if (!order.phone) return

  const pointsToAdd = Number(order.total_amount || 0)

  if (pointsToAdd <= 0) return

  const { data: existingCard } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('customer_phone', order.phone)
    .maybeSingle()

  if (existingCard) {
    const newRedeemPoints =
      Number(existingCard.redeem_points || existingCard.points || 0) + pointsToAdd

    const newLevelPoints =
      Number(existingCard.level_points || existingCard.points || 0) + pointsToAdd

    await supabase
      .from('loyalty_cards')
      .update({
        customer_name: order.customer_name,
        points: newRedeemPoints,
        redeem_points: newRedeemPoints,
        level_points: newLevelPoints,
        tier: getTier(newLevelPoints),
        total_orders: Number(existingCard.total_orders || 0) + 1,
        total_spent: Number(existingCard.total_spent || 0) + Number(order.total_amount || 0)
      })
      .eq('customer_phone', order.phone)
  } else {
    await supabase
      .from('loyalty_cards')
      .insert([
        {
          customer_phone: order.phone,
          customer_name: order.customer_name,
          points: pointsToAdd,
          redeem_points: pointsToAdd,
          level_points: pointsToAdd,
          tier: getTier(pointsToAdd),
          total_orders: 1,
          total_spent: Number(order.total_amount || 0)
        }
      ])
  }

  await supabase
    .from('loyalty_transactions')
    .insert([
      {
        customer_phone: order.phone,
        customer_name: order.customer_name,
        type: 'earn',
        points: pointsToAdd,
        level_points: pointsToAdd,
        description: `Pontos ganhos no pedido #${order.id}`,
        order_id: String(order.id),
        order_amount: Number(order.total_amount || 0)
      }
    ])
}

  async function advanceStatus(order) {
    const flow = {
      recebido: 'preparando',
      preparando: 'entrega',
      entrega: 'finalizado',
      finalizado: 'finalizado'
    }

    const nextStatus = flow[order.status] || 'recebido'

await supabase
  .from('orders')
  .update({ status: nextStatus })
  .eq('id', order.id)

if (nextStatus === 'finalizado' && order.status !== 'finalizado') {
  await addLoyaltyPoints(order)
}

    loadOrders()
  }

  async function cancelOrder(order) {
    const confirmCancel = window.confirm('Deseja cancelar este pedido?')
    if (!confirmCancel) return

    await supabase
      .from('orders')
      .update({ status: 'cancelado' })
      .eq('id', order.id)

    setSelectedOrder(null)
    loadOrders()
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
        loadOrders
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const activeOrders = orders.filter(order =>
    ['recebido', 'preparando', 'entrega'].includes(order.status)
  )

  const finishedOrders = orders.filter(order =>
    ['finalizado', 'cancelado'].includes(order.status)
  )

  const baseOrders = tab === 'active' ? activeOrders : finishedOrders

const visibleOrders = baseOrders.filter(order => {
  const matchesSearch =
    order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.phone?.toLowerCase().includes(search.toLowerCase()) ||
    String(order.id).includes(search)

  const matchesStatus =
    statusFilter === 'todos' || order.status === statusFilter

  return matchesSearch && matchesStatus
})

  function statusLabel(status) {
    if (status === 'recebido') return 'Recebido'
    if (status === 'preparando') return 'Preparando'
    if (status === 'entrega') return 'Saiu Entrega'
    if (status === 'finalizado') return 'Finalizado'
    if (status === 'cancelado') return 'Cancelado'
    return status
  }

  function paymentLabel(method) {
  if (method === 'pix') return 'PIX'
  if (method === 'cartao') return 'Cartão'
  if (method === 'dinheiro') return 'Dinheiro'

  return method || 'Não informado'
}

  function statusClass(status) {
    if (status === 'recebido') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (status === 'preparando') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (status === 'entrega') return 'bg-purple-100 text-purple-700 border-purple-200'
    if (status === 'finalizado') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'cancelado') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }

  return (
    <AdminLayout>
      <div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black">PEDIDOS</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Gerencie os pedidos da sua loja
            </p>
          </div>

          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-bold">
            <Wifi className="w-4 h-4" />
            Ao vivo
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 mb-6 max-w-3xl">

  <div className="grid gap-3 md:grid-cols-2">

    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar por cliente, telefone ou número do pedido"
      className="w-full border rounded-xl p-3 text-sm"
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full border rounded-xl p-3 text-sm"
    >
      <option value="todos">Todos os status</option>
      <option value="recebido">Recebido</option>
      <option value="preparando">Preparando</option>
      <option value="entrega">Saiu Entrega</option>
      <option value="finalizado">Finalizado</option>
      <option value="cancelado">Cancelado</option>
    </select>

  </div>

          </div>

<div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              tab === 'active'
                ? 'bg-white border shadow'
                : 'bg-zinc-200 text-zinc-500'
            }`}
          >
            Em Andamento ({activeOrders.length})
          </button>

          <button
            onClick={() => setTab('finished')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              tab === 'finished'
                ? 'bg-white border shadow'
                : 'bg-zinc-200 text-zinc-500'
            }`}
          >
            Finalizados ({finishedOrders.length})
          </button>
        </div>

        <div className="space-y-4 max-w-3xl">
          {visibleOrders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg">
                      {order.customer_name}
                    </h2>

                    <span className="text-xs bg-zinc-100 border px-2 py-1 rounded-full">
                      #{order.id}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mt-1">
                    {order.phone || 'Sem telefone'}
                  </p>

                  <p className="text-xs text-zinc-500">
  Pagamento: {paymentLabel(order.payment_method)}
  {order.loyalty_reward_name && (
  <p className="text-xs text-purple-700 font-bold mt-1">
    🎁 Recompensa: {order.loyalty_reward_name}
  </p>
)}
  {order.payment_method === 'dinheiro' && order.change_for
    ? ` · Troco para R$ ${order.change_for}`
    : ''}
</p>
                </div>

                <div className={`h-fit px-3 py-1 rounded-full border text-xs font-bold ${statusClass(order.status)}`}>
                  {statusLabel(order.status)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t">
                <p className="font-black text-lg">
                  R$ {Number(order.total_amount).toFixed(2)}
                </p>

                <div className="flex gap-2 flex-wrap justify-end">

                  <button
                    onClick={() => togglePaid(order)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
  order.paid
    ? 'bg-green-50 text-green-700 border-green-300'
    : 'bg-blue-50 text-blue-700 border-blue-300'
}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {order.paid ? 'Pago' : 'Marcar pago'}
                  </button>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 bg-white border px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>

                  {order.status !== 'finalizado' && order.status !== 'cancelado' && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="bg-amber-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Avançar
                    </button>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
            <div className="bg-[#faf4ee] rounded-2xl shadow-2xl w-full max-w-[360px] max-h-[92vh] overflow-y-auto p-3 sm:p-4 relative">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-zinc-500"
              >
                ✕
              </button>

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">
                  DETALHES DO PEDIDO
                </h2>

                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusClass(selectedOrder.status)}`}>
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="bg-white border rounded-2xl p-3 text-center mb-3">
                <span className="text-sm text-zinc-500">Pedido</span>
                <strong className="text-2xl ml-2">#{selectedOrder.id}</strong>
              </div>

              <div className="space-y-2">

                <div className="bg-zinc-100 rounded-2xl p-3">
                  <p className="text-xs text-zinc-500">Cliente</p>
                  <p className="font-bold">{selectedOrder.customer_name}</p>
                </div>

                <div className="bg-zinc-100 rounded-2xl p-3">
                  <p className="text-xs text-zinc-500">Contato</p>
                  <p className="font-bold">{selectedOrder.phone || 'Sem telefone'}</p>
                </div>

                <div className="bg-zinc-100 rounded-2xl p-3">
                  <p className="text-xs text-zinc-500">Endereço de Entrega</p>
                  <p className="font-bold">{selectedOrder.address || 'Sem endereço'}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-3">
                  <p className="text-xs text-yellow-700">Observações</p>
                  <p className="font-bold text-yellow-800">
                    {selectedOrder.notes || '[RESERVA]'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-2">Itens do Pedido</p>

                  <div className="bg-white rounded-2xl overflow-hidden border">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 text-sm border-b last:border-b-0">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.loyalty_reward_name && (
  <div className="bg-purple-50 border border-purple-300 rounded-2xl p-3">
    <p className="text-xs text-purple-700">
      Recompensa de Fidelidade
    </p>

    <p className="font-bold text-purple-800">
      {selectedOrder.loyalty_reward_name}
    </p>

    <p className="text-sm text-purple-700 mt-1">
      Pontos usados: {Number(selectedOrder.loyalty_points_used || 0).toFixed(2)}
    </p>
  </div>
)}

                {selectedOrder.coupon_code && (
  <div className="bg-green-50 border border-green-300 rounded-2xl p-3">
    <p className="text-xs text-green-700">
      Cupom utilizado
    </p>

    <p className="font-bold text-green-800">
      {selectedOrder.coupon_code}
    </p>

    <p className="text-sm text-green-700 mt-1">
      Desconto: -R$ {Number(selectedOrder.discount_amount || 0).toFixed(2)}
    </p>
  </div>
)}

                <div className="bg-white border rounded-2xl p-3 flex justify-between font-black text-lg">
                  <span>Total</span>
                  <span>R$ {Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>

                <div className="bg-green-50 border border-green-300 rounded-2xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-green-700">Forma de Pagamento</p>
                    <p className="font-bold">
  {paymentLabel(selectedOrder.payment_method)}
</p>

{selectedOrder.payment_method === 'dinheiro' && selectedOrder.change_for && (
  <p className="text-xs text-green-700 mt-1">
    Troco para R$ {selectedOrder.change_for}
  </p>
)}
                  </div>

                  <span className={`text-sm font-bold ${selectedOrder.paid ? 'text-green-700' : 'text-zinc-500'}`}>
                    {selectedOrder.paid ? 'Pago' : 'Pendente'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">

                  <button className="flex-1 bg-white border py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>

                  <button
                    onClick={() => advanceStatus(selectedOrder)}
                    className="flex-1 bg-amber-900 text-white py-2 rounded-xl font-bold text-xs sm:text-sm"
                  >
                    Avançar Status
                  </button>

                  <button
                    onClick={() => cancelOrder(selectedOrder)}
                    className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}