import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Star, ClipboardList, User } from 'lucide-react'
import ProductModal from '../components/home/ProductModal'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'
import BottomNavigation from '../components/home/BottomNavigation'
import ProductCard from '../components/home/ProductCard'
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
  <ProductCard
    key={product.id}
    product={product}
    onOpen={openProduct}
  />
))}

          </div>
        )}

      </main>

      {selectedProduct && (
  <ProductModal
    product={selectedProduct}
    productExtras={productExtras}
    selectedExtras={selectedExtras}
    setSelectedExtras={setSelectedExtras}
    quantity={quantity}
    setQuantity={setQuantity}
    itemNote={itemNote}
    setItemNote={setItemNote}
    productTotal={productTotal}
    onClose={closeProduct}
    onAdd={addSelectedProductToCart}
  />
)}

{!selectedProduct && <BottomNavigation />}

    </div>
  )
}