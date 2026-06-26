import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Star, ClipboardList, User } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'
import logo from '../assets/logo.png'

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
  const bannerRef = useRef(null)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState(null)
const [quantity, setQuantity] = useState(1)
const [itemNote, setItemNote] = useState('')
const [productExtras, setProductExtras] = useState([])
const [selectedExtras, setSelectedExtras] = useState([])
const extrasTotal = selectedExtras.reduce(
  (acc, extra) => acc + Number(extra.price || 0),
  0
)
const productTotal =
  ((Number(selectedProduct?.price || 0) + extrasTotal) * quantity)

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

async function loadProductExtras(productId) {
  const { data } = await supabase
    .from('product_extras')
    .select('*')
    .eq('product_id', productId)
    .eq('active', true)
    .order('display_order', { ascending: true })

  setProductExtras(data || [])
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

 useEffect(() => {
  if (banners.length <= 1) return

  const timer = setInterval(() => {
    const next =
      currentBanner === banners.length - 1
        ? 0
        : currentBanner + 1

    goToBanner(next)
  }, 5000)

  return () => clearInterval(timer)
}, [banners, currentBanner])

  const cartQuantity = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const cartTotal = cart.reduce(
  (acc, item) => acc + item.price * item.quantity,
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
  setItemNote('')
  setSelectedExtras([])
  loadProductExtras(product.id)
}

function closeProduct() {
  setSelectedProduct(null)
  setQuantity(1)
  setItemNote('')
  setProductExtras([])
  setSelectedExtras([])
}

function goToBanner(index) {
  setCurrentBanner(index)

  bannerRef.current?.scrollTo({
    left: bannerRef.current.offsetWidth * index,
    behavior: 'smooth'
  })
}

function handleBannerScroll() {
  if (!bannerRef.current) return

  const index = Math.round(
    bannerRef.current.scrollLeft / bannerRef.current.offsetWidth
  )

  setCurrentBanner(index)
}

function addSelectedProductToCart() {
  if (!selectedProduct) return

  const productToAdd = {
  ...selectedProduct,

  extras: selectedExtras,

  note: itemNote.trim(),

  price: Number(selectedProduct.price) + extrasTotal
}

  for (let i = 0; i < quantity; i++) {
    addToCart(productToAdd)
  }

  closeProduct()
}


  return (
    <div className="min-h-screen bg-[#faf4ee] pb-28">

      <header className="bg-[#faf4ee] border-b border-zinc-200 sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

    <Link to="/">
      <img
        src={logo}
        alt="Hora Boa"
        className="h-8 w-auto"
      />
    </Link>

    <div className="flex items-center gap-3">

      <button
        type="button"
        className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600"
      >
        <Search className="w-5 h-5" />
      </button>

      {cart.length > 0 && (
        <Link
          to="/cart"
          className="relative w-10 h-10 rounded-full bg-[#4A1F08] text-white flex items-center justify-center"
        >
          <ShoppingBag className="w-5 h-5" />

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
            {cartQuantity}
          </span>
        </Link>
      )}

    </div>

  </div>
</header>

      <main className="max-w-5xl mx-auto px-4 py-5 pb-32">

        {banners.length > 0 && (
  <div className="mb-6">

    <div
  ref={bannerRef}
  onScroll={handleBannerScroll}
  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
>
      {banners.map((banner, index) => {
        const hasText =
          banner.title ||
          banner.subtitle ||
          banner.footer_text

        return (
          <div
            key={banner.id}
            className="min-w-full snap-center relative overflow-hidden rounded-3xl bg-white border border-zinc-200"
          >
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title || 'Banner promocional'}
                className="w-full h-32 md:h-48 object-cover"
              />
            )}

            {!banner.image_url && (
              <div className="bg-amber-950 text-white p-6 min-h-40">
                {banner.title && (
                  <h2 className="text-2xl md:text-3xl font-black">
                    {banner.title}
                  </h2>
                )}

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
              <div className="absolute left-4 top-4 max-w-[60%] text-white">
                {banner.title && (
                  <h2 className="text-xl md:text-3xl font-black leading-tight">
                    {banner.title}
                  </h2>
                )}

                {banner.subtitle && (
                  <p className="text-xs md:text-sm mt-2">
                    {banner.subtitle}
                  </p>
                )}

                {banner.footer_text && (
                  <p className="text-xs font-black mt-3 bg-black/35 rounded-full px-3 py-1.5 w-fit">
                    {banner.footer_text}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>

    {banners.length > 1 && (
  <div className="flex justify-center gap-2 mt-3">
    {banners.map((_, index) => (
      <button
        key={index}
        onClick={() => goToBanner(index)}
        className={`
          h-2
          rounded-full
          transition-all
          ${
            index === currentBanner
              ? 'w-6 bg-[#4A1F08]'
              : 'w-2 bg-zinc-300'
          }
        `}
      />
    ))}
  </div>
)}

  </div>
)}

        {featuredProducts.length > 0 && (
  <section className="mb-8">

  <h2 className="text-xl font-title mb-3">
    ⭐ Destaques
  </h2>

  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">

      {featuredProducts.map(item => {
        const product = item.products

        return (
          <div
            key={item.id}
            onClick={() => openProduct(product)}
            className="
  flex-none
  w-[145px]
  md:w-auto
  bg-[#FFFCF9]
  rounded-2xl
  overflow-hidden
  border
  border-[#E9DED2]
  shadow-[0_8px_24px_rgba(0,0,0,0.05)]
  cursor-pointer
"
          >

            {product.image_url && (
              <img
  src={product.image_url}
  alt={product.name}
  className="w-full h-24 md:h-40 object-contain bg-[#FBF3EA]"
/>
            )}

            <div className="p-2">

              <h3 className="text-sm font-black line-clamp-2">
                {product.name}
              </h3>

              <p className="text-sm text-zinc-500 mt-3 leading-5 line-clamp-2 min-h-10">
  {product.description}
</p>

              <div className="flex items-center justify-between mt-2">

                <span className="text-sm font-black text-[#4A1F08]">
                  R$ {Number(product.price).toFixed(2)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart(product)
                  }}
                  className="
  bg-[#5A2100]
  text-white
  w-9
  h-9
  rounded-full
  font-black
  shadow-lg
  active:scale-95
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
                    ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
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
          <div className="grid gap-4 md:grid-cols-3">

            {filteredProducts.map(product => (
              <div
  key={product.id}
  onClick={() => openProduct(product)}
  className="
    bg-[#FFFCF7]
    rounded-xl
    border
    border-[#E7DED5]
    overflow-hidden
    cursor-pointer
  "
>
 <div className="h-[200px] overflow-hidden">
  {product.image_url ? (
    <img
      src={product.image_url}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-bold">
      Sem imagem
    </div>
  )}
</div>

  <div className="p-4">

    <div className="flex items-start justify-between gap-3">
      <h3 className="text-[17px] font-black text-[#2B211B] leading-tight">
        {product.name}
      </h3>

      <p className="text-[17px] font-black text-[#4A1E05] whitespace-nowrap">
        R$ {Number(product.price || 0).toFixed(2)}
      </p>
    </div>

    <p className="text-[15px] text-[#8A7465] mt-3 leading-5 line-clamp-2 min-h-[40px]">
      {product.description}
    </p>

    <button
      onClick={(e) => {
        e.stopPropagation()
        openProduct(product)
      }}
      className="
        mt-4
        w-full
        h-[34px]
        bg-[#4A1E05]
        text-white
        rounded-lg
        font-bold
        text-sm
        flex
        items-center
        justify-center
        gap-3
        active:scale-95
        transition-all
      "
    >
      <span className="text-xl leading-none font-normal">
        +
      </span>

      <span>
        Adicionar
      </span>
    </button>

  </div>
</div>

            ))}

          </div>
        )}

      </main>

      {selectedProduct && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">

    <div className="fixed inset-0 z-50 bg-[#faf4ee]">

  <div className="h-full overflow-y-auto pb-28">

      {selectedProduct.image_url && (
        <img
          src={selectedProduct.image_url}
          alt={selectedProduct.name}
          className="w-full h-44 md:h-56 object-cover"
        />
      )}

      <div className="px-6 py-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs text-[#4A1F08] font-black uppercase">
              {selectedProduct.category || 'Produto'}
            </p>

            <h2 className="text-3xl font-black mt-1">
              {selectedProduct.name}
            </h2>
          </div>

          <button
  onClick={closeProduct}
  className="absolute top-4 right-4 bg-white/90 border rounded-full w-10 h-10 font-black z-[70]"
>
  ×
</button>

        </div>

        <p className="text-zinc-600 mt-3">
          {selectedProduct.description}
        </p>

        {productExtras.length > 0 && (
  <div className="mt-5">

    <p className="text-sm font-black mb-3">
      Adicionais
    </p>

    <div className="space-y-2">
      {productExtras.map(extra => {
        const checked = selectedExtras.some(item => item.id === extra.id)

        return (
          <button
            key={extra.id}
            type="button"
            onClick={() => {
              if (checked) {
                setSelectedExtras(prev =>
                  prev.filter(item => item.id !== extra.id)
                )
              } else {
                setSelectedExtras(prev => [...prev, extra])
              }
            }}
            className={`
              w-full
              flex
              items-center
              justify-between
              border
              rounded-2xl
              p-4
              text-left
              ${
                checked
                  ? 'border-amber-900 bg-amber-50'
                  : 'border-zinc-200 bg-white'
              }
            `}
          >
            <div>
  <p className="font-bold">
    {extra.name}
  </p>

  <p className="text-sm text-zinc-500">
    + R$ {Number(extra.price || 0).toFixed(2)}
  </p>
</div>

            <div
              className={`
                w-6
                h-6
                rounded-full
                border
                flex
                items-center
                justify-center
                text-xs
                font-black
                ${
                  checked
                    ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
                    : 'border-zinc-300'
                }
              `}
            >
              {checked ? '✓' : ''}
            </div>
          </button>
        )
      })}
    </div>

  </div>
)}

    </div>

        <div className="mt-6">
  <label className="block text-sm font-bold mb-2">
    Observações do item
  </label>

  <textarea
    value={itemNote}
    onChange={(e) => setItemNote(e.target.value)}
    placeholder="Ex: sem cebola, molho separado..."
    className="w-full border border-zinc-200 rounded-2xl p-3 min-h-24 outline-none"
  />
</div>

  <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#faf4ee] border-t border-zinc-200 p-4">

  <div className="max-w-5xl mx-auto flex items-center gap-3">

    <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-3 py-2">

      <button
        type="button"
        onClick={() => setQuantity(Math.max(quantity - 1, 1))}
        className="w-9 h-9 rounded-full bg-zinc-100 font-black"
      >
        -
      </button>

      <span className="font-black text-lg w-6 text-center">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        className="w-9 h-9 rounded-full bg-zinc-100 font-black"
      >
        +
      </button>

    </div>

    <button
      onClick={addSelectedProductToCart}
      className="
        flex-1
        bg-[#4A1F08]
        text-white
        py-4
        rounded-2xl
        font-bold
        text-base
        transition-all
        active:scale-95
      "
    >
      Adicionar · R$ {productTotal.toFixed(2)}
    </button>

  </div>

</div>

      </div>

    </div>

  </div>
)}

{!selectedProduct && (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#faf4ee] border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
  <div className="grid grid-cols-4 py-2">

    <Link to="/" className="flex flex-col items-center gap-1 text-[#4A1F08] text-xs font-bold">
      <ShoppingBag className="w-5 h-5" />
      Cardápio
    </Link>

    <Link to="/my-orders" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
      <ClipboardList className="w-5 h-5" />
      Pedidos
    </Link>

    <Link to="/loyalty" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
      <Star className="w-5 h-5" />
      Fidelidade
    </Link>

    <Link to="/profile" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
      <User className="w-5 h-5" />
      Perfil
    </Link>

  </div>
</nav>
)}

    </div>
  )
}