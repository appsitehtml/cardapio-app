import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Star } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'

const categories = [
  'Todos',
  'Hambúrgueres',
  'Combos',
  'Bebidas',
  'Porções',
  'Sobremesas'
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState(null)
const [quantity, setQuantity] = useState(1)

  const { addToCart, cart } = useCart()

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: false })

    if (!error) {
      setProducts(data || [])
    }
  }

  async function loadBanners() {
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  setBanners(data || [])
}

async function loadFeaturedProducts() {
  const { data } = await supabase
    .from('featured_products')
    .select(`
      *,
      products (*)
    `)
    .eq('active', true)
    .order('display_order', { ascending: true })

  setFeaturedProducts(data || [])
}

  useEffect(() => {
    loadProducts()
    loadBanners()
    loadFeaturedProducts()
  }, [])

  const cartQuantity = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const filteredProducts = products.filter(product => {
    const term = search.toLowerCase()

    const matchesSearch =
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)

    const matchesCategory =
      selectedCategory === 'Todos' ||
      product.category === selectedCategory


    return matchesSearch && matchesCategory
  })

  function openProduct(product) {
  setSelectedProduct(product)
  setQuantity(1)
}

function closeProduct() {
  setSelectedProduct(null)
  setQuantity(1)
}

function addSelectedProductToCart() {
  if (!selectedProduct) return

  for (let i = 0; i < quantity; i++) {
    addToCart(selectedProduct)
  }

  closeProduct()
}


  return (
    <div className="min-h-screen bg-[#faf4ee] pb-28">

      <header className="bg-amber-950 text-white px-4 py-4 rounded-b-2xl shadow-md">
  <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

    <div>
      <h1 className="text-1xl font-title tracking-wide">
        HORA BOA BURGER
      </h1>

      <p className="text-xs text-amber-100">
        Hambúrgueres artesanais e combos especiais
      </p>
    </div>

    <div className="flex gap-2">
      <Link
        to="/my-orders"
        className="bg-white/10 border border-white/20 px-3 py-2 rounded-full text-xs font-bold"
      >
        Pedidos
      </Link>

      <Link
        to="/loyalty"
        className="bg-white/10 border border-white/20 px-3 py-2 rounded-full text-xs font-bold"
      >
        Fidelidade
      </Link>
    </div>

  </div>
</header>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {banners.length > 0 && (
  <div className="space-y-4 mb-6">

    {banners.map(banner => {
      const hasText =
        banner.title ||
        banner.subtitle ||
        banner.footer_text

      return (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-zinc-200"
        >

          {banner.image_url && (
            <img
              src={banner.image_url}
              alt={banner.title || 'Banner promocional'}
              className="w-full h-36 md:h-56 object-cover"
            />
          )}

          {!banner.image_url && (
            <div className="bg-amber-950 text-white p-6 min-h-40">
              <p className="text-xs font-black text-amber-200 uppercase tracking-wide">
                Oferta especial
              </p>

              <h2 className="text-2xl md:text-3xl font-black mt-1 leading-tight">
                {banner.title}
              </h2>

              {banner.subtitle && (
                <p className="text-sm text-amber-100 mt-2">
                  {banner.subtitle}
                </p>
              )}

              {banner.footer_text && (
                <p className="text-xs font-black mt-4 bg-white/15 border border-white/20 rounded-full px-4 py-2 w-fit">
                  {banner.footer_text}
                </p>
              )}
            </div>
          )}

          {banner.image_url && hasText && (
            <div className="absolute left-5 top-5 max-w-[55%] text-white">
              {banner.title && (
                <h2 className="text-2xl md:text-3xl font-black leading-tight">
                  {banner.title}
                </h2>
              )}

              {banner.subtitle && (
                <p className="text-sm mt-2">
                  {banner.subtitle}
                </p>
              )}

              {banner.footer_text && (
                <p className="text-xs font-black mt-4 bg-black/35 rounded-full px-4 py-2 w-fit">
                  {banner.footer_text}
                </p>
              )}
            </div>
          )}

        </div>
      )
    })}

  </div>
)}

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-zinc-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar hambúrguer, combo, bebida..."
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {featuredProducts.length > 0 && (
  <section className="mb-10">

    <div className="flex items-center justify-between mb-4">

      <h2 className="text-1xl font-title">
        ⭐ Destaques
      </h2>

    </div>

    <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">

      {featuredProducts.map(item => {
        const product = item.products

        return (
          <div
            key={item.id}
            onClick={() => openProduct(product)}
            className="
  min-w-[145px]
  max-w-[145px]
  md:min-w-0
  md:max-w-none
  bg-white
  rounded-2xl
  md:rounded-3xl
  overflow-hidden
  border
  border-zinc-200
  shadow-sm
  cursor-pointer
"
          >

            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-24 md:h-52 object-cover"
              />
            )}

            <div className="p-2">

              <h3 className="text-sm md:text-2xl font-black line-clamp-2">
                {product.name}
              </h3>

              <p className="text-zinc-500 mt-1 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between mt-2">

                <span className="text-sm md:text-2xl font-black text-amber-900">
                  R$ {Number(product.price).toFixed(2)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart(product)
                  }}
                  className="
                    bg-amber-900
                    text-white
                    px-3
                    py-1
                    rounded-xl
                    font-bold
                  "
                >
                  +
                </button>

              </div>

            </div>

          </div>
        )
      })}

    </div>

  </section>
)}

        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">

          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                font-bold
                whitespace-nowrap
                border
                ${
                  selectedCategory === category
                    ? 'bg-amber-900 text-white border-amber-900'
                    : 'bg-white text-zinc-600 border-zinc-200'
                }
              `}
            >
              {category}
            </button>
          ))}

        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border p-10 text-center text-zinc-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">

            {filteredProducts.map(product => (
              <div
  key={product.id}
  onClick={() => openProduct(product)}
  className="
    bg-white
    rounded-3xl
    border
    border-zinc-200
    shadow-sm
    overflow-hidden
    cursor-pointer
    transition-all
    hover:scale-[1.01]
  "
>

                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold">
                    Sem imagem
                  </div>
                )}

                <div className="p-5">

                  <p className="text-xs text-amber-800 font-black uppercase">
                    {product.category || 'Produto'}
                  </p>

                  <h3 className="text-2xl font-black mt-1">
                    {product.name}
                  </h3>

                  <p className="text-sm text-zinc-500 mt-2 min-h-10">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-5 gap-4">

                    <p className="text-2xl font-black text-amber-900">
                      R$ {Number(product.price || 0).toFixed(2)}
                    </p>

                    <button
  onClick={(e) => {
    e.stopPropagation()
    openProduct(product)
  }}
                      className="
                        bg-amber-900
                        text-white
                        px-5
                        py-3
                        rounded-2xl
                        font-bold
                        transition-all
                        hover:scale-[1.03]
                        active:scale-95
                      "
                    >
                      Adicionar
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      {cart.length > 0 && (
        <Link
          to="/cart"
          className="
            fixed
            bottom-5
            left-4
            right-4
            md:left-auto
            md:right-6
            md:w-auto
            bg-amber-900
            text-white
            px-6
            py-4
            rounded-2xl
            shadow-xl
            font-bold
            text-lg
            flex
            items-center
            justify-center
            gap-3
            transition-all
            hover:scale-[1.02]
            active:scale-95
          "
        >
          <ShoppingBag className="w-5 h-5" />
          Ver carrinho · {cartQuantity}
        </Link>
      )}

      {selectedProduct && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">

    <div className="bg-[#faf4ee] rounded-t-3xl md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

      {selectedProduct.image_url && (
        <img
          src={selectedProduct.image_url}
          alt={selectedProduct.name}
          className="w-full h-64 object-cover"
        />
      )}

      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs text-amber-800 font-black uppercase">
              {selectedProduct.category || 'Produto'}
            </p>

            <h2 className="text-3xl font-black mt-1">
              {selectedProduct.name}
            </h2>
          </div>

          <button
            onClick={closeProduct}
            className="bg-white border rounded-full w-9 h-9 font-black"
          >
            ×
          </button>

        </div>

        <p className="text-zinc-600 mt-3">
          {selectedProduct.description}
        </p>

        <p className="text-3xl font-black text-amber-900 mt-5">
          R$ {Number(selectedProduct.price || 0).toFixed(2)}
        </p>

        <div className="flex items-center justify-between mt-6">

          <span className="font-bold">
            Quantidade
          </span>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setQuantity(Math.max(quantity - 1, 1))}
              className="w-10 h-10 rounded-full bg-white border font-black"
            >
              -
            </button>

            <span className="font-black text-xl w-6 text-center">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-white border font-black"
            >
              +
            </button>

          </div>

        </div>

        <button
          onClick={addSelectedProductToCart}
          className="
            mt-6
            w-full
            bg-amber-900
            text-white
            py-4
            rounded-2xl
            font-bold
            text-lg
            transition-all
            active:scale-95
          "
        >
          Adicionar · R$ {(Number(selectedProduct.price || 0) * quantity).toFixed(2)}
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  )
}