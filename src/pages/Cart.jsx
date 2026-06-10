import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'

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

async function finishOrder() {

  const { error } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: name,
        phone,
        address,
        status: 'recebido',
        total_amount: total,
        items: cart
      }
    ])

  if (!error) {

    toast.success('Pedido enviado com sucesso!')

    clearCart()

    navigate('/my-orders')
  }
}

  return (

    <div className="min-h-screen p-6 bg-zinc-100">

      <h1 className="text-3xl font-bold mb-6">
        Seu Carrinho 🛒
      </h1>

      <div className="space-y-4">

        {cart.map(item => (

          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow"
          >

            <div className="flex justify-between items-start">

              <div>
                <h2 className="font-bold text-lg">
                  {item.name}
                </h2>

                <p className="text-zinc-500">
                  Quantidade: {item.quantity}
                </p>

                <p className="text-green-600 font-bold mt-2">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                Remover
              </button>

            </div>

          </div>

        ))}

      </div>

      <div className="bg-white rounded-2xl p-5 shadow mb-6 space-y-4">

  <input
    type="text"
    placeholder="Seu nome"
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

</div>

      <div className="mt-8 bg-white rounded-2xl p-5 shadow">

        <div className="flex justify-between text-2xl font-bold">
          <span>Total</span>

          <span className="text-green-600">
            R$ {total.toFixed(2)}
          </span>
        </div>

        <button
  onClick={finishOrder}
  className="
  mt-6
  w-full

  bg-green-600
  hover:bg-green-700

  text-white

  py-4

  rounded-2xl

  font-bold
  text-lg

  shadow-lg
  hover:shadow-2xl

  transition-all
  duration-150

  hover:scale-[1.02]
  active:scale-95
"
>
          Finalizar Pedido 🚀
        </button>

      </div>

    </div>
  )
}