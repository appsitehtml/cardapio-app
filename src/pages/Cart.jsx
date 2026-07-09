import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoreSettings } from '../services/storeSettingsService'
import { useCart } from '../hooks/useCart.jsx'
import { upsertCustomer } from '../services/customerService'
import { createOrder } from '../services/orderService'
import { openWhatsAppOrder } from '../services/openWhatsApp'
import { buildWhatsAppMessage } from '../services/whatsappService'
import {
  getAvailableRewards,
  redeemReward
} from '../services/loyaltyService'

import {
  ArrowLeft,
  ShoppingBag,
  ClipboardList,
  Star,
  User,
  Plus,
  CreditCard,
  QrCode
} from 'lucide-react'

import {
  validateCoupon,
  incrementCouponUse
} from '../services/couponService'

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
  const [couponMessage, setCouponMessage] = useState('')
  const [couponStatus, setCouponStatus] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const [availableRewards, setAvailableRewards] = useState([])
  const [selectedReward, setSelectedReward] = useState(null)
  const [storeSettings, setStoreSettings] = useState(null)

  const [formErrors, setFormErrors] = useState({})
  const [orderError, setOrderError] = useState('')

  const finalTotal = Math.max(total - discountAmount, 0)

  useEffect(() => {
  async function loadStoreSettings() {
    const settings = await getStoreSettings()
    setStoreSettings(settings)
  }

  loadStoreSettings()
}, [])

  useEffect(() => {
  async function loadRewards() {
    const rewards = await getAvailableRewards(phone)
    setAvailableRewards(rewards)
  }

  loadRewards()
}, [phone])

  function paymentLabel(method) {
    if (method === 'pix') return 'PIX'
    if (method === 'cartao') return 'Cartão'
    if (method === 'dinheiro') return 'Dinheiro'

    return method || 'Não informado'
  }

  function validateDeliveryFields() {
    const errors = {}

    if (!name.trim()) errors.name = 'Informe seu nome.'
    if (!phone.trim()) errors.phone = 'Informe seu telefone.'
    if (!address.trim()) errors.address = 'Informe seu endereço.'

    return errors
  }

  function goNextStep() {
    const errors = {}

    if (checkoutStep === 1 && cart.length === 0) {
      errors.cart = 'Seu carrinho está vazio.'
    }

    if (checkoutStep === 2) {
      Object.assign(errors, validateDeliveryFields())
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setOrderError('')
    setCheckoutStep(checkoutStep + 1)
  }

  function clearFieldError(field) {
    if (!formErrors[field]) return

    setFormErrors(prev => ({
      ...prev,
      [field]: undefined
    }))
  }

  async function applyCoupon() {
    setCouponMessage('')
    setCouponStatus(null)

    const result = await validateCoupon({
      couponCode,
      total,
      phone
    })

    if (!result.ok) {
      setAppliedCoupon(null)
      setDiscountAmount(0)
      setCouponStatus('error')
      setCouponMessage(result.message)
      return
    }

    setAppliedCoupon(result.coupon)
    setDiscountAmount(result.discount)
    setCouponStatus('success')
    setCouponMessage(result.message)
  }

  async function finishOrder(openWhatsApp = false) {
    setOrderError('')

    if (cart.length === 0) {
      setFormErrors({ cart: 'Seu carrinho está vazio.' })
      setCheckoutStep(1)
      return
    }

    const errors = validateDeliveryFields()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setCheckoutStep(2)
      return
    }

    setFormErrors({})

    const customer = await upsertCustomer({
      name,
      phone,
      address,
      finalTotal
    })

    const { data, error } = await createOrder({
  customer,
  name,
  phone,
  address,
  notes,
  paymentMethod,
  changeFor,
  appliedCoupon,
  discountAmount,
  finalTotal,
  selectedReward,
  cart
})

    if (error) {
      setOrderError('Não foi possível enviar o pedido. Tente novamente.')
      return
    }

    await redeemReward({
  selectedReward,
  phone,
  name
})
    await incrementCouponUse(appliedCoupon)

    localStorage.setItem('customer_phone', phone)
    localStorage.setItem('customer_name', name)
    localStorage.setItem('customer_address', address)

    if (openWhatsApp) {
      const message = buildWhatsAppMessage({
  orderId: data?.id,
  cart,
  name,
  phone,
  address,
  notes,
  selectedReward,
  paymentLabel,
  paymentMethod,
  changeFor,
  appliedCoupon,
  discountAmount,
  finalTotal
})
      openWhatsAppOrder({
  whatsappNumber: storeSettings?.whatsapp_number || WHATSAPP_NUMBER,
  message
})
    }

    clearCart()
    setNotes('')
    setPaymentMethod('pix')
    setChangeFor('')
    setCouponCode('')
    setCouponMessage('')
    setCouponStatus(null)
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setSelectedReward(null)

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

            <Link to="/loyalty" className="flex items-center gap-2 hover:text-[#4A1F08]">
              <Star className="w-4 h-4" />
              Fidelidade
            </Link>

            <Link to="/profile" className="flex items-center gap-2 hover:text-[#4A1F08]">
              <User className="w-4 h-4" />
              Perfil
            </Link>

          </nav>

        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 pb-56">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:text-[#4A1F08]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <h1 className="text-xl font-black mb-4">
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

        {formErrors.cart && (
          <p className="text-sm text-red-600 font-bold mb-4">
            {formErrors.cart}
          </p>
        )}

        {checkoutStep === 1 && (
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-6">

            <h2 className="text-xl font-black mb-4">
              SEUS ITENS
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Seu carrinho está vazio.
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between gap-4">

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

                        <p className="text-sm text-zinc-500 mt-1">
                          R$ {Number(item.price).toFixed(2)} cada
                        </p>
                      </div>

                      <p className="font-black whitespace-nowrap">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>

                    </div>

                    <div className="flex items-center gap-3 mt-3">

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all text-xl font-bold"
                      >
                        −
                      </button>

                      <span className="font-black min-w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => addToCart(item)}
                        className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-zinc-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-5 pt-4">

              <div className="flex gap-2">

                <input
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase())
                    setCouponMessage('')
                    setCouponStatus(null)
                  }}
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

              {couponMessage && (
                <p
                  className={`text-sm font-bold mt-3 ${
                    couponStatus === 'success'
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {couponMessage}
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
                            className="w-full flex items-center justify-between border border-zinc-200 rounded-xl px-4 py-3 text-left bg-white hover:bg-blue-50 hover:border-blue-300 transition-all"
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
                          className="text-xs font-black text-blue-700 hover:text-blue-900"
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
                <span className="text-[#4A1F08]">
                  R$ {finalTotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
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
                onChange={(e) => {
                  setName(e.target.value)
                  clearFieldError('name')
                }}
                className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              {formErrors.name && (
                <p className="text-xs text-red-600 font-bold -mt-2">
                  {formErrors.name}
                </p>
              )}

              <input
                type="text"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  clearFieldError('phone')
                }}
                className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              {formErrors.phone && (
                <p className="text-xs text-red-600 font-bold -mt-2">
                  {formErrors.phone}
                </p>
              )}

              <input
                type="text"
                placeholder="Endereço"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  clearFieldError('address')
                }}
                className="w-full border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              {formErrors.address && (
                <p className="text-xs text-red-600 font-bold -mt-2">
                  {formErrors.address}
                </p>
              )}

              <textarea
                placeholder="Observações do pedido. Ex: entregar no portão, chamar no WhatsApp..."
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
                    ? 'border-[#4A1F08] text-[#4A1F08] bg-amber-50'
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
                    ? 'border-[#4A1F08] text-[#4A1F08] bg-amber-50'
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
                    ? 'border-[#4A1F08] text-[#4A1F08] bg-amber-50'
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
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex justify-between gap-4 text-sm"
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

                      <span className="font-bold whitespace-nowrap">
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

        {orderError && (
          <p className="text-sm text-red-700 font-bold mb-4">
            {orderError}
          </p>
        )}

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-50 shadow-2xl">

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

          <div className="flex gap-3">

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

            {checkoutStep === 4 && (
              <button
                onClick={() => finishOrder(false)}
                disabled={cart.length === 0}
                className="flex-1 bg-[#4A1F08] text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
              >
                Confirmar Pedido
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}