import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'
import { Link } from 'react-router-dom'

export default function Home() {

  const [products, setProducts] = useState([])

  const {
  addToCart,
  cart
} = useCart()

  async function loadProducts() {

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)

    if (!error) {
      setProducts(data)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-100 p-6">

      <h1 className="text-4xl font-bold mb-8">
        Cardápio 🍔
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        {products.map(product => (

          <div
            key={product.id}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >

            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-56 object-cover"
            />

            <div className="p-5">

              <h2 className="text-2xl font-bold">
                {product.name}
              </h2>

              <p className="text-zinc-600 mt-2">
                {product.description}
              </p>

              <p className="text-green-600 font-bold text-xl mt-4">
                R$ {Number(product.price).toFixed(2)}
              </p>

              <button
  onClick={() => addToCart(product)}
  className="
    bg-green-600
    text-white
    px-4
    py-2
    rounded-xl
    font-bold

    transition-all
    duration-150

    hover:scale-105
    active:scale-95
    hover:bg-green-700
  "
>
  Adicionar ao Carrinho
</button>

            </div>

          </div>

        ))}

      </div>
      {cart.length > 0 && (

  <Link to="/cart">

    <button
      className="
  fixed
  bottom-6
  right-6

  bg-green-600
  text-white

  px-6
  py-4

  rounded-full

  shadow-lg
  hover:shadow-2xl

  font-bold
  text-lg

  transition-all
  duration-150

  hover:scale-105
  active:scale-95
  hover:bg-green-700
"
    >
      🛒 {cart.reduce((acc, item) => acc + item.quantity, 0)}
    </button>

  </Link>

)}
    </div>
  )
}