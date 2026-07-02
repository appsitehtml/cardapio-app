import { useEffect, useState } from 'react'
import { Tag, Percent, DollarSign, Power } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import toast from 'react-hot-toast'

export default function AdminMarketing() {
  const [coupons, setCoupons] = useState([])

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [activeTab, setActiveTab] = useState('coupons')
  const [banners, setBanners] = useState([])
const [bannerTitle, setBannerTitle] = useState('')
const [bannerSubtitle, setBannerSubtitle] = useState('')
const [bannerFooter, setBannerFooter] = useState('')
const [bannerOrder, setBannerOrder] = useState('')
const [bannerImage, setBannerImage] = useState(null)
const [products, setProducts] = useState([])
const [featuredProducts, setFeaturedProducts] = useState([])
const [featuredProductId, setFeaturedProductId] = useState('')
const [featuredOrder, setFeaturedOrder] = useState('')
const [validUntil, setValidUntil] = useState('')
const [maxUses, setMaxUses] = useState('')
const [minimumOrder, setMinimumOrder] = useState('')
const [firstOrderOnly, setFirstOrderOnly] = useState(false)

  async function loadCoupons() {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('id', { ascending: false })

    setCoupons(data || [])
  }

  async function uploadBannerImage() {
  if (!bannerImage) return ''

  const cleanName = bannerImage.name.replace(/\s+/g, '-')
  const fileName = `${Date.now()}-${cleanName}`

  const { error } = await supabase
    .storage
    .from('products')
    .upload(fileName, bannerImage)

  if (error) {
    console.log('ERRO UPLOAD BANNER:', error)
    return ''
  }

  const { data } = supabase
    .storage
    .from('products')
    .getPublicUrl(fileName)

  return data.publicUrl
}

async function loadProducts() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  setProducts(data || [])
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

async function createFeaturedProduct() {
  if (!featuredProductId) return

  await supabase
    .from('featured_products')
    .insert([
      {
        product_id: Number(featuredProductId),
        display_order: Number(featuredOrder || 0),
        active: true
      }
    ])

  setFeaturedProductId('')
  setFeaturedOrder('')

  loadFeaturedProducts()
}

async function deleteFeaturedProduct(id) {
  const confirmDelete = window.confirm('Remover produto dos destaques?')
  if (!confirmDelete) return

  await supabase
    .from('featured_products')
    .delete()
    .eq('id', id)

  loadFeaturedProducts()
}

  async function createCoupon() {
    if (!code.trim()) return
    if (!discountValue) return

    await supabase
      .from('coupons')
      .insert([
        {
  code: code.trim().toUpperCase(),
  discount_type: discountType,
  discount_value: Number(discountValue || 0),
  active: true,
  valid_until: validUntil || null,
  max_uses: maxUses ? Number(maxUses) : null,
  minimum_order: Number(minimumOrder || 0),
  first_order_only: firstOrderOnly
}
      ])

    setCode('')
    setDiscountType('percentage')
    setDiscountValue('')
    setValidUntil('')
setMaxUses('')
setMinimumOrder('')
setFirstOrderOnly(false)

    loadCoupons()
  }

 async function toggleCoupon(coupon) {
  const { error } = await supabase
    .from('coupons')
    .update({ active: !coupon.active })
    .eq('code', coupon.code)

  if (error) {
    console.log('ERRO AO ALTERAR CUPOM:', error)
    toast.error('Erro ao alterar cupom')
    return
  }

  toast.success(coupon.active ? 'Cupom desativado' : 'Cupom ativado')
  loadCoupons()
}

async function loadBanners() {
  const { data } = await supabase
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true })

  setBanners(data || [])
}

async function createBanner() {
  if (!bannerTitle.trim() && !bannerImage) {
  return
}

  const imageUrl = await uploadBannerImage()

  await supabase
    .from('banners')
    .insert([
      {
        title: bannerTitle,
        subtitle: bannerSubtitle,
        footer_text: bannerFooter,
        image_url: imageUrl,
        display_order: Number(bannerOrder || 0),
        active: true
      }
    ])

  setBannerTitle('')
  setBannerSubtitle('')
  setBannerFooter('')
  setBannerOrder('')
  setBannerImage(null)

  loadBanners()
}

async function toggleBanner(banner) {
  await supabase
    .from('banners')
    .update({ active: !banner.active })
    .eq('id', banner.id)

  loadBanners()
}

async function deleteBanner(id) {
  const confirmDelete = window.confirm('Deseja excluir este banner?')
  if (!confirmDelete) return

  await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  loadBanners()
}

  async function deleteCoupon(code) {
  const confirmDelete = window.confirm('Deseja excluir este cupom?')

  if (!confirmDelete) return

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('code', code)

  if (error) {
    console.log('ERRO AO EXCLUIR CUPOM:', error)
    toast.error('Erro ao excluir cupom')
    return
  }

  toast.success('Cupom excluído')
  loadCoupons()
}

  useEffect(() => {
    loadCoupons()
    loadBanners()
    loadProducts()
loadFeaturedProducts()
  }, [])

  return (
  <AdminLayout>
    <div>

      <div className="mb-8">
        <h1 className="text-4xl font-title">
          MARKETING
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Crie e gerencie cupons, banners e destaques
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto mt-6 mb-8">
        {[
          { value: 'coupons', label: 'Cupons' },
          { value: 'banners', label: 'Banners' },
          { value: 'featured', label: 'Destaques' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-4
              py-2
              rounded-xl
              text-sm
              font-bold
              border
              whitespace-nowrap
              ${
                activeTab === tab.value
                  ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
                  : 'bg-white text-zinc-600 border-zinc-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'coupons' && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-zinc-500">
                Cupons
              </p>

              <p className="text-3xl font-black mt-2">
                {coupons.length}
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-zinc-500">
                Ativos
              </p>

              <p className="text-3xl font-black mt-2 text-green-600">
                {coupons.filter(coupon => coupon.active).length}
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-zinc-500">
                Inativos
              </p>

              <p className="text-3xl font-black mt-2 text-red-500">
                {coupons.filter(coupon => !coupon.active).length}
              </p>
            </div>

          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm mb-8">

            <h2 className="text-xl font-title mb-4">
              Criar Cupom
            </h2>

            <div className="grid gap-3 md:grid-cols-4">

              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Código. Ex: PRIMEIRA10"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              >
                <option value="percentage">Porcentagem</option>
                <option value="fixed">Valor fixo</option>
              </select>

              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Valor"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <input
  type="datetime-local"
  value={validUntil}
  onChange={(e) => setValidUntil(e.target.value)}
  className="border border-zinc-200 rounded-xl p-3 shadow-sm"
/>

<input
  type="number"
  value={maxUses}
  onChange={(e) => setMaxUses(e.target.value)}
  placeholder="Máximo de usos"
  className="border border-zinc-200 rounded-xl p-3 shadow-sm"
/>

<input
  type="number"
  value={minimumOrder}
  onChange={(e) => setMinimumOrder(e.target.value)}
  placeholder="Pedido mínimo"
  className="border border-zinc-200 rounded-xl p-3 shadow-sm"
/>

<label className="flex items-center gap-2 border border-zinc-200 rounded-xl p-3 shadow-sm font-bold text-sm">
  <input
    type="checkbox"
    checked={firstOrderOnly}
    onChange={(e) => setFirstOrderOnly(e.target.checked)}
  />
  Apenas 1º pedido
</label>

              <button
                onClick={createCoupon}
                className="
                  bg-[#4A1F08]
                  text-white
                  rounded-xl
                  font-bold
                  transition-all
                  hover:scale-105
                  active:scale-95
                "
              >
                Criar
              </button>

            </div>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {coupons.map(coupon => (
              <div
                key={coupon.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="bg-amber-100 text-amber-800 p-2 rounded-xl">
                        <Tag className="w-5 h-5" />
                      </div>

                      <h2 className="text-2xl font-black">
                        {coupon.code}
                      </h2>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-zinc-600">

                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}

                      <span className="font-bold">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}% OFF`
                          : `R$ ${Number(coupon.discount_value).toFixed(2)} OFF`
                        }
                      </span>

                    </div>

                  </div>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      border
                      ${coupon.active
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-red-50 text-red-600 border-red-300'
                      }
                    `}
                  >
                    {coupon.active ? 'Ativo' : 'Inativo'}
                  </span>

                </div>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() => toggleCoupon(coupon)}
                    className="
                      flex-1
                      border
                      rounded-xl
                      py-3
                      font-bold
                      flex
                      items-center
                      justify-center
                      gap-2
                      hover:bg-zinc-100
                    "
                  >
                    <Power className="w-4 h-4" />
                    {coupon.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => deleteCoupon(coupon.code)}
                    className="
                      flex-1
                      border
                      border-red-200
                      text-red-600
                      rounded-xl
                      py-3
                      font-bold
                      hover:bg-red-50
                    "
                  >
                    Excluir
                  </button>

                </div>

              </div>
            ))}

          </div>

          <button
  onClick={createCoupon}
  className="
    mt-4
    bg-amber-900
    text-white
    rounded-xl
    px-6
    py-3
    font-bold
    transition-all
    hover:scale-105
    active:scale-95
  "
>
  Criar Cupom
</button>
        </>
      )}

      {activeTab === 'banners' && (
        <>
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm mb-8">

            <h2 className="text-xl font-title mb-4">
              Criar Banner
            </h2>

            <div className="grid gap-3 md:grid-cols-4">

              <input
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Título do banner"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <input
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                placeholder="Subtítulo"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <input
                value={bannerFooter}
                onChange={(e) => setBannerFooter(e.target.value)}
                placeholder="Texto do rodapé"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <input
                type="number"
                value={bannerOrder}
                onChange={(e) => setBannerOrder(e.target.value)}
                placeholder="Ordem"
                className="border border-zinc-200 rounded-xl p-3 shadow-sm"
              />

              <input
  type="file"
  onChange={(e) => setBannerImage(e.target.files[0])}
  className="border border-zinc-200 rounded-xl p-3 shadow-sm"
/>

            </div>

            <button
              onClick={createBanner}
              className="
                mt-4
                bg-[#4A1F08]
                text-white
                rounded-xl
                px-6
                py-3
                font-bold
                transition-all
                hover:scale-105
                active:scale-95
              "
            >
              Criar Banner
            </button>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {banners.map(banner => (
              <div
                key={banner.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm"
              >

                {banner.image_url && (
  <img
    src={banner.image_url}
    alt={banner.title}
    className="w-full h-40 object-cover rounded-2xl mb-4"
  />
)}

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase">
                      Banner #{banner.display_order}
                    </p>

                    <h2 className="text-2xl font-black mt-1">
                      {banner.title}
                    </h2>

                    {banner.subtitle && (
                      <p className="text-sm text-zinc-500 mt-2">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.footer_text && (
                      <p className="text-sm font-bold text-[#4A1F08] mt-3">
                        {banner.footer_text}
                      </p>
                    )}
                  </div>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      border
                      ${
                        banner.active
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-red-50 text-red-600 border-red-300'
                      }
                    `}
                  >
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>

                </div>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() => toggleBanner(banner)}
                    className="flex-1 border rounded-xl py-3 font-bold hover:bg-zinc-100"
                  >
                    {banner.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="flex-1 border border-red-200 text-red-600 rounded-xl py-3 font-bold hover:bg-red-50"
                  >
                    Excluir
                  </button>

                </div>

              </div>
            ))}

          </div>
        </>
      )}

      {activeTab === 'featured' && (
  <>

    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm mb-8">

      <h2 className="text-xl font-title mb-4">
        Produtos em Destaque
      </h2>

      <div className="grid gap-3 md:grid-cols-3">

        <select
          value={featuredProductId}
          onChange={(e) => setFeaturedProductId(e.target.value)}
          className="border border-zinc-200 rounded-xl p-3"
        >
          <option value="">
            Selecione um produto
          </option>

          {products.map(product => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name}
            </option>
          ))}

        </select>

        <input
          type="number"
          value={featuredOrder}
          onChange={(e) => setFeaturedOrder(e.target.value)}
          placeholder="Ordem (1,2,3...)"
          className="border border-zinc-200 rounded-xl p-3"
        />

        <button
          onClick={createFeaturedProduct}
          className="
            bg-[#4A1F08]
            text-white
            rounded-xl
            font-bold
            hover:scale-105
            active:scale-95
            transition-all
          "
        >
          Adicionar
        </button>

      </div>

    </div>

    <div className="grid gap-4 md:grid-cols-3">

      {featuredProducts.map(item => (

        <div
          key={item.id}
          className="bg-white border rounded-2xl overflow-hidden shadow-sm"
        >

          {item.products?.image_url && (
            <img
              src={item.products.image_url}
              className="w-full h-44 object-cover"
            />
          )}

          <div className="p-4">

            <p className="text-xs text-zinc-500">
              Destaque #{item.display_order}
            </p>

            <h3 className="font-black text-xl mt-1">
              {item.products?.name}
            </h3>

            <p className="text-green-600 font-black mt-3">
              R$ {Number(item.products?.price || 0).toFixed(2)}
            </p>

            <button
              onClick={() => deleteFeaturedProduct(item.id)}
              className="
                mt-4
                w-full
                border
                border-red-200
                text-red-600
                rounded-xl
                py-2
                font-bold
              "
            >
              Remover
            </button>

          </div>

        </div>

      ))}

    </div>

  </>
)}

    </div>
  </AdminLayout>
)
}