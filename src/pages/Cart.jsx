import { useState } from 'react'
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
    removeFromCart,
    clearCart
  } = useCart()

  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [changeFor, setChangeFor] = useState('')
  const [couponCode, setCouponCode] = useState('')
const [appliedCoupon, setAppliedCoupon] = useState(null)
const [discountAmount, setDiscountAmount] = useState(0)

  function paymentLabel(method) {
    if (method === 'pix') return 'PIX'
    if (method === 'cartao') return 'Cartão'
    if (method === 'dinheiro') return 'Dinheiro'

    return method || 'Não informado'
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
    .single()

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

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: name,
          phone,
          address,
          notes,
          payment_method: paymentMethod,
          change_for: changeFor,
          status: 'recebido',
          total_amount: finalTotal,
          items: cart
        }
      ])
      .select()
      .single()

    if (error) {
      toast.error('Erro ao enviar pedido')
      return
    }

    toast.success('Pedido enviado com sucesso!')

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

    navigate('/my-orders')
  }

  return (
  <div className="min-h-screen bg-[#faf4ee]">

    <header className="sticky top-0 z-40 bg-[#faf4ee]/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="text-xl font-black text-amber-900 tracking-wide">
          HORA BOA BURGER
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600">

          <Link to="/" className="flex items-center gap-2 hover:text-amber-900">
            <ShoppingBag className="w-4 h-4" />
            Cardápio
          </Link>

          <Link to="/my-orders" className="flex items-center gap-2 hover:text-amber-900">
            <ClipboardList className="w-4 h-4" />
            Pedidos
          </Link>

          <button className="flex items-center gap-2 hover:text-amber-900">
            <Star className="w-4 h-4" />
            Fidelidade
          </button>

          <button className="flex items-center gap-2 hover:text-amber-900">
            <User className="w-4 h-4" />
            Perfil
          </button>

        </nav>

      </div>
    </header>

    <main className="max-w-xl mx-auto px-4 py-8">

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:text-amber-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-4xl font-black mb-6">
        FINALIZAR PEDIDO
      </h1>

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

                <p className="text-sm text-zinc-500">
                  R$ {Number(item.price).toFixed(2)} cada
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <span className="font-bold">
                  {item.quantity}
                </span>

                <button
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
              className="flex-1 border rounded-xl p-3 text-sm"
            />

            <button
              onClick={applyCoupon}
              className="border px-4 rounded-xl font-bold hover:bg-zinc-100"
            >
              Aplicar
            </button>

          </div>

          {appliedCoupon && (
            <p className="text-sm text-green-700 font-bold mt-3">
              Cupom {appliedCoupon.code} aplicado: -R$ {discountAmount.toFixed(2)}
            </p>
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

        </div>

      </section>

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
            className="w-full border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <textarea
            placeholder="Observações do pedido. Ex: sem cebola, molho à parte..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-xl p-3 min-h-24"
          />

        </div>

      </section>

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
                ? 'border-amber-900 text-amber-900 bg-amber-50'
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
                ? 'border-amber-900 text-amber-900 bg-amber-50'
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
                ? 'border-amber-900 text-amber-900 bg-amber-50'
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

      <button
        onClick={() => finishOrder(false)}
        disabled={cart.length === 0}
        className="
          w-full
          bg-amber-900
          hover:bg-amber-950
          text-white
          py-4
          rounded-2xl
          font-bold
          text-lg
          shadow-lg
          transition-all
          duration-150
          hover:scale-[1.02]
          active:scale-95
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        Confirmar Pedido · R$ {finalTotal.toFixed(2)}
      </button>

      <button
        onClick={() => finishOrder(true)}
        disabled={cart.length === 0}
        className="
          mt-3
          w-full
          bg-white
          border
          border-green-500
          text-green-700
          py-4
          rounded-2xl
          font-bold
          text-lg
          transition-all
          duration-150
          hover:bg-green-50
          hover:scale-[1.02]
          active:scale-95
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        💬 Finalizar pelo WhatsApp
      </button>

    </main>

  </div>
)
}