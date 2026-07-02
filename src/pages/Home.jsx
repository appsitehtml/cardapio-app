import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductModal from '../components/home/ProductModal'

import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart.jsx'
import FeaturedSection from '../components/home/FeaturedSection'
import BannerCarousel from '../components/home/BannerCarousel'
import Header from '../components/home/Header'
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

      <Header
  logo={logo}
  categories={categories}
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
/>

      <main className="max-w-5xl mx-auto px-4 py-5 pb-32">

<BannerCarousel
  banners={banners}
  bannerRef={bannerRef}
  currentBanner={currentBanner}
  onScroll={handleBannerScroll}
  onGoToBanner={goToBanner}
/>
        
        <FeaturedSection
  featuredProducts={featuredProducts}
  onOpenProduct={openProduct}
  onAddToCart={addToCart}
/>

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