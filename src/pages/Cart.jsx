import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'

import {
  ArrowLeft,
  ShoppingBag,
  ClipboardList,
  Star,
  User,
  Trash2,
  Plus,
  CreditCard,
  QrCode
} from 'lucide-react'

const WHATSAPP_NUMBER = '5511999910621'

export default function Cart() {
 const {
  cart,
  total,
  addToCart,
  removeFromCart,
  clearCart
} = useCart()

  const navigate = useNavigate()

  const [name, setName] = useState(localStorage.getItem('customer_name') || '')
const [phone, setPhone] = useState(localStorage.getItem('customer_phone') || '')
const [address, setAddress] = useState(localStorage.getItem('customer_address') || '')
  const [notes, setNotes] = useState('')
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [changeFor, setChangeFor] = useState('')
  const [couponCode, setCouponCode] = useState('')
const [appliedCoupon, setAppliedCoupon] = useState(null)
const [discountAmount, setDiscountAmount] = useState(0)
const [availableRewards, setAvailableRewards] = useState([])
const [selectedReward, setSelectedReward] = useState(null)
useEffect(() => {
  loadRewards()
}, [phone])

  function paymentLabel(method) {
    if (method === 'pix') return 'PIX'
    if (method === 'cartao') return 'Cartão'
    if (method === 'dinheiro') return 'Dinheiro'

    return method || 'Não informado'
  }

  function goNextStep() {
  if (checkoutStep === 1 && cart.length === 0) {
    toast.error('Seu carrinho está vazio')
    return
  }

  if (checkoutStep === 2) {
    if (!name.trim()) {
      toast.error('Informe seu nome')
      return
    }

    if (!phone.trim()) {
      toast.error('Informe seu telefone')
      return
    }

    if (!address.trim()) {
      toast.error('Informe seu endereço')
      return
    }
  }

  setCheckoutStep(checkoutStep + 1)
}

  async function applyCoupon() {
  if (!couponCode.trim()) {
    toast.error('Digite um cupom')
    return
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.trim().toUpperCase())
    .eq('active', true)
    .maybeSingle()

  if (error || !data) {
    toast.error('Cupom inválido')
    return
  }

  let discount = 0

  if (data.discount_type === 'percentage') {
    discount = total * (Number(data.discount_value) / 100)
  }

  if (data.discount_type === 'fixed') {
    discount = Number(data.discount_value)
  }

  if (discount > total) {
    discount = total
  }

  setAppliedCoupon(data)
  setDiscountAmount(discount)

  toast.success('Cupom aplicado')
}

const finalTotal = total - discountAmount

async function loadRewards() {
  if (!phone) return

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('customer_phone', phone)
    .maybeSingle()

  if (!card) {
    setAvailableRewards([])
    return
  }

  const currentPoints =
    Number(card.redeem_points || card.points || 0)

  const tier = card.tier || 'bronze'

  const tierOrder = {
    bronze: 1,
    prata: 2,
    ouro: 3,
    diamante: 4
  }

  const { data: rewards } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('active', true)

  const available =
    (rewards || []).filter(reward => {
      const requiredTier =
        reward.tier_required || 'bronze'

      return (
        tierOrder[requiredTier] <= tierOrder[tier] &&
        currentPoints >= Number(reward.points_required)
      )
    })

  setAvailableRewards(available)
}

async function upsertCustomer() {
  const cleanPhone = phone.trim()

  if (!cleanPhone) return null

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle()

  if (!existingCustomer) {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([
        {
          name,
          phone: cleanPhone,
          address,
          total_orders: 1,
          total_spent: finalTotal,
          welcome_shown: false
        }
      ])
      .select()
      .single()

    if (error) {
      console.log('ERRO AO CRIAR CLIENTE:', error)
      return null
    }

    return {
      ...newCustomer,
      isNew: true
    }
  }

  const { data: updatedCustomer, error } = await supabase
    .from('customers')
    .update({
      name,
      address,
      total_orders: Number(existingCustomer.total_orders || 0) + 1,
      total_spent: Number(existingCustomer.total_spent || 0) + Number(finalTotal || 0),
      updated_at: new Date().toISOString()
    })
    .eq('phone', cleanPhone)
    .select()
    .single()

  if (error) {
    console.log('ERRO AO ATUALIZAR CLIENTE:', error)

    return {
      ...existingCustomer,
      isNew: false
    }
  }

  return {
    ...updatedCustomer,
    isNew: false
  }
}

  async function finishOrder(openWhatsApp = false) {
    if (cart.length === 0) {
  toast.error('Seu carrinho está vazio')
  return
}

if (!name.trim()) {
  toast.error('Informe seu nome')
  return
}

if (!phone.trim()) {
  toast.error('Informe seu telefone')
  return
}

if (!address.trim()) {
  toast.error('Informe seu endereço')
  return
}

const customer = await upsertCustomer()
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
  customer_id: customer?.id || null,
  customer_name: name,
  phone,
  address,
  notes,
  payment_method: paymentMethod,
  change_for: changeFor,
  coupon_code: appliedCoupon?.code || null,
  discount_amount: discountAmount,
  status: 'recebido',
 total_amount: finalTotal,
loyalty_reward_name: selectedReward?.name || null,
loyalty_points_used: selectedReward ? Number(selectedReward.points_required || 0) : 0,
items: cart
}
      ])
      .select()
      .single()

    if (error) {
      toast.error('Erro ao enviar pedido')
      return
    }

    
    if (selectedReward) {
  const { data: loyaltyCard } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('customer_phone', phone)
    .maybeSingle()

  if (loyaltyCard) {
    const currentPoints = Number(loyaltyCard.redeem_points || loyaltyCard.points || 0)
    const pointsUsed = Number(selectedReward.points_required || 0)
    const newPoints = Math.max(currentPoints - pointsUsed, 0)

    await supabase
  .from('loyalty_cards')
  .update({
    points: newPoints,
    redeem_points: newPoints,
    rewards_redeemed: Number(loyaltyCard.rewards_redeemed || 0) + 1
  })
  .eq('customer_phone', phone)

    await supabase
      .from('loyalty_transactions')
      .insert([
        {
          customer_phone: phone,
          customer_name: name,
          type: 'redeem',
          points: -pointsUsed,
          level_points: 0,
          description: `Resgate de ${selectedReward.name}`,
          reward_name: selectedReward.name
        }
      ])
  }
}

    toast.success('Pedido enviado com sucesso!')

    localStorage.setItem('customer_phone', phone)
localStorage.setItem('customer_name', name)
localStorage.setItem('customer_address', address)


    if (openWhatsApp) {
      const itemsText = cart
        .map(item => `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n')

      let message = `🛒 *Novo Pedido*`

      if (data?.id) {
        message += ` #${data.id}`
      }

      message += `\n\n*Cliente:* ${name}`
      message += `\n*Telefone:* ${phone}`
      message += `\n*Endereço:* ${address}`

      if (notes) {
        message += `\n*Observações:* ${notes}`
      }

      message += `\n\n*Itens:*\n${itemsText}`
      if (selectedReward) {
  message += `\n\n*Recompensa de Fidelidade:* ${selectedReward.name}`
  message += `\n*Pontos usados:* ${Number(selectedReward.points_required || 0).toFixed(2)} pts`
}
      message += `\n\n*Pagamento:* ${paymentLabel(paymentMethod)}`

      if (paymentMethod === 'dinheiro' && changeFor) {
        message += `\n*Troco para:* R$ ${changeFor}`
      }

      if (appliedCoupon) {
  message += `\n*Cupom:* ${appliedCoupon.code}`
  message += `\n*Desconto:* -R$ ${discountAmount.toFixed(2)}`
}

message += `\n\n*Total:* R$ ${finalTotal.toFixed(2)}`

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, '_blank')
    }

    clearCart()
    setNotes('')
    setPaymentMethod('pix')
    setChangeFor('')

    const customerSaved =
  customer?.isNew && !customer.welcome_shown

if (customerSaved) {
  await supabase
    .from('customers')
    .update({
      welcome_shown: true
    })
    .eq('id', customer.id)
}

navigate('/order-success', {
  state: {
    orderId: data?.id,
    customerSaved
  }
})
  }

  return (
  <div className="min-h-screen bg-[#faf4ee]">

    <header className="sticky top-0 z-40 bg-[#faf4ee]/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to="/" className="text-xl font-black text-[#4A1F08] tracking-wide">
          HORA BOA BURGER
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600">

          <Link to="/" className="flex items-center gap-2 hover:text-[#4A1F08]">
            <ShoppingBag className="w-4 h-4" />
            Cardápio
          </Link>

          <Link to="/my-orders" className="flex items-center gap-2 hover:text-[#4A1F08]">
            <ClipboardList className="w-4 h-4" />
            Pedidos
          </Link>

          <Link
  to="/loyalty"
  className="flex items-center gap-2 hover:text-[#4A1F08]"
>
  <Star className="w-4 h-4" />
  Fidelidade
</Link>

          <Link
  to="/profile"
  className="flex items-center gap-2 hover:text-[#4A1F08]"
>
  <User className="w-4 h-4" />
  Perfil
</Link>

</nav>

      </div>
    </header>

    <main className="max-w-xl mx-auto px-4 py-8 pb-40">

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:text-[#4A1F08]"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-1xl font-black mb-4">
        FINALIZAR PEDIDO
      </h1>

      <div className="grid grid-cols-4 gap-2 mb-4">
  {[
    { step: 1, label: 'Carrinho' },
    { step: 2, label: 'Entrega' },
    { step: 3, label: 'Pagamento' },
    { step: 4, label: 'Confirmar' }
  ].map(item => (
    <button
      key={item.step}
      type="button"
      onClick={() => setCheckoutStep(item.step)}
      className={`
        rounded-xl
        py-2
        text-xs
        font-black
        border
        ${
          checkoutStep === item.step
            ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
            : 'bg-white text-zinc-500 border-zinc-200'
        }
      `}
    >
      {item.step}. {item.label}
    </button>
  ))}
</div>

{checkoutStep === 1 && (
      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-6">

        <h2 className="text-xl font-black mb-4">
          SEUS ITENS
        </h2>

        <div className="space-y-4">

          {cart.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4"
            >

              <div className="flex-1">
                <p className="font-bold">
                  {item.name}
                </p>

                {item.extras?.length > 0 && (
  <div className="mt-1 space-y-0.5">
    {item.extras.map(extra => (
      <p
        key={extra.id}
        className="text-xs text-zinc-500"
      >
        + {extra.name} · R$ {Number(extra.price || 0).toFixed(2)}
      </p>
    ))}
  </div>
)}

{item.note && (
  <p className="text-xs text-zinc-500 mt-1">
    Obs: {item.note}
  </p>
)}

                <p className="text-sm text-zinc-500">
                  R$ {Number(item.price).toFixed(2)} cada
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
  onClick={() => removeFromCart(item.id)}
  className="
    w-10
    h-10
    rounded-full
    bg-zinc-100
    hover:bg-zinc-200
    active:scale-95
    transition-all
    text-xl
    font-bold
  "
>
  −
</button>

                <span>
  {item.quantity}x {item.name}

  {item.extras?.length > 0 && (
    <span className="block text-xs text-zinc-500 mt-1">
      {item.extras.map(extra => `+ ${extra.name}`).join(', ')}
    </span>
  )}

  {item.note && (
    <span className="block text-xs text-zinc-500">
      Obs: {item.note}
    </span>
  )}
</span>

                <button
  onClick={() => addToCart(item)}
  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-zinc-100"
>
  <Plus className="w-4 h-4" />
</button>

                <p className="font-black w-20 text-right">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>

              </div>

            </div>
          ))}

        </div>

        <div className="border-t mt-5 pt-4">

          <div className="flex gap-2">

            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Cupom de desconto"
              className="flex-1 border border-zinc-200 rounded-xl p-3 text-sm shadow-sm"
            />

            <button
              onClick={applyCoupon}
              className="border border-zinc-200 px-4 rounded-xl font-bold hover:bg-zinc-100 shadow-sm"
            >
              Aplicar
            </button>

          </div>

          {appliedCoupon && (
            <p className="text-sm text-green-700 font-bold mt-3">
              Cupom {appliedCoupon.code} aplicado: -R$ {discountAmount.toFixed(2)}
            </p>
          )}

          {availableRewards.length > 0 && (
  <div className="border-t mt-4 pt-4">

    {!selectedReward ? (
      <>
        <p className="text-sm font-bold text-blue-700 mb-3">
          🎁 Adicionar recompensa de fidelidade grátis
        </p>

        <div className="space-y-2">
          {availableRewards.map(reward => (
            <button
              key={reward.id}
              type="button"
              onClick={() => setSelectedReward(reward)}
              className="
                w-full
                flex
                items-center
                justify-between
                border
                border-zinc-200
                rounded-xl
                px-4
                py-3
                text-left
                bg-white
                hover:bg-blue-50
                hover:border-blue-300
                transition-all
              "
            >
              <span className="font-bold">
                {reward.name}
              </span>

              <span className="text-sm font-bold text-zinc-500">
                {reward.points_required} pts
              </span>
            </button>
          ))}
        </div>
      </>
    ) : (
  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">

    <div className="flex items-center justify-between gap-4">

      <div>

        <p className="text-xs font-black text-blue-700 uppercase">
          🎁 Recompensa aplicada
        </p>

        <p className="font-bold text-zinc-800 mt-1">
          {selectedReward.name}
        </p>

        <p className="text-xs text-blue-700 mt-1">
          Será adicionada gratuitamente ao pedido
        </p>

      </div>

      <button
        type="button"
        onClick={() => setSelectedReward(null)}
        className="
          text-xs
          font-black
          text-blue-700
          hover:text-blue-900
        "
      >
        Trocar
      </button>

    </div>

  </div>
)}

  </div>
)}
          

        </div>

        <div className="space-y-2 mt-5 pt-4 border-t">

          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>Desconto</span>
              <span>-R$ {discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-xl font-black pt-2 border-t">
            <span>Total</span>
            <span className="text-amber-950">
              R$ {finalTotal.toFixed(2)}
            </span>
          </div>

          {discountAmount > 0 && (
  <div className="
    bg-green-50
    border
    border-green-200
    rounded-2xl
    p-4
    mt-4
  ">
    <p className="font-bold text-green-700">
      🎉 Você economizou R$ {discountAmount.toFixed(2)}
    </p>
  </div>
)}

        </div>

      </section>
)}

      {checkoutStep === 2 && (

      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-6">

        <h2 className="text-xl font-black mb-4">
          DADOS DE ENTREGA
        </h2>

        <div className="space-y-3">

          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
          />

          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
          />

          <input
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
          />

          <textarea
            placeholder="Observações do pedido. Ex: sem cebola, molho à parte..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm min-h-24"
          />

        </div>

      </section>
      )}

      {checkoutStep === 3 && (

      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-6">

        <h2 className="text-xl font-black mb-4">
          FORMA DE PAGAMENTO
        </h2>

        <div className="grid grid-cols-3 gap-3">

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('pix')
              setChangeFor('')
            }}
            className={`border rounded-2xl p-4 font-bold ${
              paymentMethod === 'pix'
                ? 'border-amber-900 text-[#4A1F08] bg-amber-50'
                : 'border-zinc-200'
            }`}
          >
            <QrCode className="w-5 h-5 mx-auto mb-2" />
            PIX
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('cartao')
              setChangeFor('')
            }}
            className={`border rounded-2xl p-4 font-bold ${
              paymentMethod === 'cartao'
                ? 'border-amber-900 text-[#4A1F08] bg-amber-50'
                : 'border-zinc-200'
            }`}
          >
            <CreditCard className="w-5 h-5 mx-auto mb-2" />
            Cartão
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('dinheiro')}
            className={`border rounded-2xl p-4 font-bold ${
              paymentMethod === 'dinheiro'
                ? 'border-amber-900 text-[#4A1F08] bg-amber-50'
                : 'border-zinc-200'
            }`}
          >
            💵
            <span className="block mt-2">Dinheiro</span>
          </button>

        </div>

        {paymentMethod === 'dinheiro' && (
          <input
            type="text"
            placeholder="Troco para quanto? (opcional)"
            value={changeFor}
            onChange={(e) => setChangeFor(e.target.value)}
            className="w-full border rounded-xl p-3 mt-4"
          />
        )}

      </section>
      )}

      <div className="
  fixed
  bottom-0
  left-0
  right-0
  bg-white
  border-t
  border-zinc-200
  p-4
  z-50
  shadow-2xl
">

  <div className="max-w-xl mx-auto">

    <div className="flex justify-between items-center mb-3">

      <div>
        <p className="text-xs text-zinc-500">
          Total
        </p>

        <p className="text-2xl font-black text-[#4A1F08]">
          R$ {finalTotal.toFixed(2)}
        </p>
      </div>

      {discountAmount > 0 && (
        <div className="text-right">
          <p className="text-xs text-green-600">
            Economia
          </p>

          <p className="font-black text-green-600">
            R$ {discountAmount.toFixed(2)}
          </p>
        </div>
      )}

    </div>

<div className="flex gap-3 mb-6">

  {checkoutStep > 1 && (
    <button
      type="button"
      onClick={() => setCheckoutStep(checkoutStep - 1)}
      className="flex-1 bg-white border border-zinc-200 py-4 rounded-2xl font-bold"
    >
      Voltar
    </button>
  )}

  {checkoutStep < 4 && (
    <button
      type="button"
      onClick={goNextStep}
      className="flex-1 bg-[#4A1F08] text-white py-4 rounded-2xl font-bold"
    >
      Continuar
    </button>
  )}

</div>

{checkoutStep === 4 && (
  <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-6">

    <h2 className="text-xl font-title mb-4">
      RESUMO DO PEDIDO
    </h2>

    <div className="space-y-4">

      <div>
        <p className="text-xs font-black text-zinc-400 uppercase mb-2">
          Itens
        </p>

        <div className="space-y-2">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >
              <span>
  {item.quantity}x {item.name}

  {item.extras?.length > 0 && (
    <span className="block text-xs text-zinc-500 mt-1">
      {item.extras.map(extra => `+ ${extra.name}`).join(', ')}
    </span>
  )}

  {item.note && (
    <span className="block text-xs text-amber-800 font-bold mt-1">
      Obs: {item.note}
    </span>
  )}
</span>

              <span className="font-bold">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs font-black text-zinc-400 uppercase mb-2">
          Entrega
        </p>

        <p className="font-bold">{name}</p>
        <p className="text-sm text-zinc-500">{phone}</p>
        <p className="text-sm text-zinc-500">{address}</p>

        {notes && (
          <p className="text-sm text-zinc-500 mt-2">
            Obs: {notes}
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        <p className="text-xs font-black text-zinc-400 uppercase mb-2">
          Pagamento
        </p>

        <p className="font-bold">
          {paymentLabel(paymentMethod)}
        </p>

        {paymentMethod === 'dinheiro' && changeFor && (
          <p className="text-sm text-zinc-500">
            Troco para R$ {changeFor}
          </p>
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-zinc-500">
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-bold">
            <span>Desconto</span>
            <span>-R$ {discountAmount.toFixed(2)}</span>
          </div>
        )}

        {selectedReward && (
          <div className="flex justify-between text-purple-700 font-bold">
            <span>Recompensa</span>
            <span>{selectedReward.name}</span>
          </div>
        )}

        <div className="flex justify-between text-xl font-black pt-2 border-t">
          <span>Total</span>
          <span className="text-[#4A1F08]">
            R$ {finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

    </div>

  </section>
)}

{checkoutStep === 4 && (
  <button
    onClick={() => finishOrder(false)}
    disabled={cart.length === 0}
    className="w-full bg-[#4A1F08] text-white py-4 rounded-2xl font-bold text-lg"
  >
    Confirmar Pedido
  </button>
)}

  </div>

</div>
    </main>
  

  </div>
)
}