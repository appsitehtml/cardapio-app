import { Clock, Gift, MapPin, CreditCard, MessageSquare } from 'lucide-react'
import { formatDateShort } from '../utils/date'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart.jsx'

export default function OrderCard({ order, highlighted = false }) {
    const navigate = useNavigate()
const { addToCart } = useCart()
  const steps = [
    { key: 'recebido', label: 'Recebido' },
    { key: 'preparando', label: 'Preparando' },
    { key: 'entrega', label: 'Saiu para entrega' },
    { key: 'finalizado', label: 'Finalizado' }
  ]

  function statusLabel(status) {
    if (status === 'recebido') return 'Recebido'
    if (status === 'preparando') return 'Preparando'
    if (status === 'entrega') return 'Saiu para entrega'
    if (status === 'finalizado') return 'Finalizado'
    if (status === 'cancelado') return 'Cancelado'
    return status
  }

  function estimatedTime(status) {
    if (status === 'recebido') return '30-50 min'
    if (status === 'preparando') return '15-25 min'
    if (status === 'entrega') return '5-10 min'
    if (status === 'finalizado') return 'Pedido concluído'
    if (status === 'cancelado') return 'Pedido cancelado'
    return 'Aguardando'
  }

  function stepIndex(status) {
    return steps.findIndex(step => step.key === status)
  }

  const currentStep = stepIndex(order.status)

  const progressPercent =
  order.status === 'cancelado'
    ? 0
    : currentStep <= 0
      ? 20
      : currentStep === 1
        ? 50
        : currentStep === 2
          ? 75
          : 100

function paymentLabel(method) {
  if (method === 'pix') return 'PIX'
  if (method === 'cartao') return 'Cartão'
  if (method === 'dinheiro') return 'Dinheiro'

  return method || 'Não informado'
}

function timeAgo(date) {
  if (!date) return ''

  const now = new Date()
  const created = new Date(date)

  const diffMinutes = Math.floor(
    (now - created) / 1000 / 60
  )

  if (diffMinutes < 1) return 'Agora mesmo'

  if (diffMinutes < 60) {
    return `Há ${diffMinutes} min`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `Há ${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `Há ${diffDays} dia(s)`
}

function reorder() {
  if (!order.items || order.items.length === 0) {
    toast.error('Este pedido não tem itens')
    return
  }

  order.items.forEach(item => {
    for (let i = 0; i < Number(item.quantity || 1); i++) {
      addToCart(item)
    }
  })

  toast.success('Itens adicionados ao carrinho')
  navigate('/cart')
}

  return (
    <div
  className={`
    rounded-3xl
    border
    shadow-sm
    p-5
    ${
      highlighted
        ? 'bg-amber-50 border-amber-500 shadow-md'
        : 'bg-white border-zinc-200'
    }
  `}
>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-zinc-500">Pedido</p>

          <h2 className="text-2xl font-black">
            #{order.id}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
  {formatDateShort(order.created_at)}
</p>

<p className="text-xs text-amber-800 font-bold">
  {timeAgo(order.created_at)}
</p>
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

      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-5 space-y-3 text-sm">

  <p className="text-xs font-black text-zinc-400 uppercase">
    Detalhes do pedido
  </p>

  {order.address && (
    <div className="flex items-start gap-2 text-zinc-600">
      <MapPin className="w-4 h-4 mt-0.5 text-amber-800" />

      <span>
        {order.address}
      </span>
    </div>
  )}

  <div className="flex items-center gap-2 text-zinc-600">
    <CreditCard className="w-4 h-4 text-amber-800" />

    <span>
      Pagamento: {paymentLabel(order.payment_method)}
      {order.payment_method === 'dinheiro' && order.change_for
        ? ` · Troco para R$ ${order.change_for}`
        : ''}
    </span>
  </div>

  {order.notes && (
    <div className="flex items-start gap-2 text-zinc-600">
      <MessageSquare className="w-4 h-4 mt-0.5 text-amber-800" />

      <span>
        {order.notes}
      </span>
    </div>
  )}

</div>

      {order.status !== 'cancelado' ? (
  <div className="mb-5">

    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-900 rounded-full transition-all duration-500"
        style={{ width: `${progressPercent}%` }}
      />
    </div>

    <div className="grid grid-cols-4 gap-2 mt-3">
      {steps.map((step, index) => {
        const active = index <= currentStep

        return (
          <div
            key={step.key}
            className="text-center"
          >
            <div
              className={`
                w-6
                h-6
                mx-auto
                rounded-full
                flex
                items-center
                justify-center
                text-xs
                font-black
                ${
                  active
                    ? 'bg-amber-900 text-white'
                    : 'bg-zinc-200 text-zinc-400'
                }
              `}
            >
              {index + 1}
            </div>

            <p
              className={`
                text-[10px]
                font-bold
                mt-1
                leading-tight
                ${
                  active
                    ? 'text-amber-900'
                    : 'text-zinc-400'
                }
              `}
            >
              {step.label}
            </p>
          </div>
        )
      })}
    </div>

  </div>
) : (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-5 text-sm font-bold">
    Este pedido foi cancelado.
  </div>
)}

      <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">

  <p className="text-xs font-black text-zinc-400 uppercase">
    Itens do pedido
  </p>
        {order.items?.map((item, index) => (
          <div
  key={index}
  className="flex justify-between gap-4 text-sm border-b border-zinc-100 pb-2 last:border-b-0 last:pb-0"
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
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm pt-3 border-t">
            <Gift className="w-4 h-4" />
            Recompensa: {order.loyalty_reward_name}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t space-y-2">

  {order.discount_amount > 0 && (
    <div className="flex justify-between text-sm text-green-700 font-bold">
      <span>Desconto</span>

      <span>
        -R$ {Number(order.discount_amount || 0).toFixed(2)}
      </span>
    </div>
  )}

  {order.loyalty_reward_name && (
    <div className="flex justify-between text-sm text-amber-900 font-bold shadow-sm">
      <span>Recompensa usada</span>

      <span>
        {order.loyalty_reward_name}
      </span>
    </div>
  )}

  <div className="flex justify-between items-center pt-2">
    <span className="text-zinc-500">
      Total
    </span>

    <span className="text-2xl font-black text-amber-900">
      R$ {Number(order.total_amount || 0).toFixed(2)}
    </span>
  </div>

</div>
{!highlighted && (
  <button
    onClick={reorder}
    className="
      mt-4
      w-full
      bg-amber-900
      text-white
      rounded-2xl
      py-3
      font-bold
      transition-all
      hover:scale-[1.02]
      active:scale-95
    "
  >
    Pedir novamente
  </button>
)}
    </div>
  )
}