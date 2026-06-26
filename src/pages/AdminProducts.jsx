import { useEffect, useState } from 'react'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

import { supabase } from '../lib/supabase'

const categories = [
  'Hambúrgueres',
  'Bebidas',
  'Porções',
  'Sobremesas',
  'Combos'
]

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState('Hambúrgueres')

  const [editingProduct, setEditingProduct] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('Hambúrgueres')
  const [categoryFilter, setCategoryFilter] = useState('Todos')

  const [extras, setExtras] = useState([])
const [extraProductId, setExtraProductId] = useState('')
const [extraName, setExtraName] = useState('')
const [extraPrice, setExtraPrice] = useState('')
const [extraOrder, setExtraOrder] = useState('')

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })

    setProducts(data || [])
  }

  useEffect(() => {
    loadProducts()
    loadExtras()
  }, [])

  async function uploadImage() {
    if (!image) return ''

    const cleanName = image.name.replace(/\s+/g, '-')
    const fileName = `${Date.now()}-${cleanName}`

    const { error } = await supabase
      .storage
      .from('products')
      .upload(fileName, image)

    if (error) {
      console.log('UPLOAD ERROR:', error)
      return ''
    }

    const { data } = supabase
      .storage
      .from('products')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function loadExtras() {
  const { data } = await supabase
    .from('product_extras')
    .select(`
      *,
      products (
        name
      )
    `)
    .order('display_order', { ascending: true })

  setExtras(data || [])
}

async function createExtra() {
  if (!extraProductId) return
  if (!extraName.trim()) return

  await supabase
    .from('product_extras')
    .insert([
      {
        product_id: Number(extraProductId),
        name: extraName,
        price: Number(extraPrice || 0),
        display_order: Number(extraOrder || 0),
        active: true
      }
    ])

  setExtraProductId('')
  setExtraName('')
  setExtraPrice('')
  setExtraOrder('')

  loadExtras()
}

async function toggleExtra(extra) {
  await supabase
    .from('product_extras')
    .update({ active: !extra.active })
    .eq('id', extra.id)

  loadExtras()
}

async function deleteExtra(id) {
  const confirmDelete = window.confirm('Excluir este adicional?')
  if (!confirmDelete) return

  await supabase
    .from('product_extras')
    .delete()
    .eq('id', id)

  loadExtras()
}

  async function createProduct() {
    if (!name.trim()) return
    if (!price) return

    const imageUrl = await uploadImage()

    await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price: Number(price),
          category,
          image_url: imageUrl,
          active: true
        }
      ])

    setName('')
    setDescription('')
    setPrice('')
    setImage(null)
    setCategory('Hambúrgueres')

    loadProducts()
  }

  function startEdit(product) {
    setEditingProduct(product)
    setEditName(product.name || '')
    setEditDescription(product.description || '')
    setEditPrice(product.price || '')
    setEditCategory(product.category || 'Hambúrgueres')
  }

  async function saveEdit() {
    if (!editingProduct) return

    await supabase
      .from('products')
      .update({
        name: editName,
        description: editDescription,
        price: Number(editPrice),
        category: editCategory
      })
      .eq('id', editingProduct.id)

    setEditingProduct(null)
    loadProducts()
  }

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({
        active: product.active === false
      })
      .eq('id', product.id)

    loadProducts()
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este produto?'
    )

    if (!confirmDelete) return

    await supabase
      .from('products')
      .delete()
      .eq('id', id)

    loadProducts()
  }

  const visibleProducts = products.filter(product => {
  const term = search.toLowerCase()

  const matchesSearch =
    product.name?.toLowerCase().includes(term) ||
    product.description?.toLowerCase().includes(term) ||
    product.category?.toLowerCase().includes(term)

  const matchesCategory =
    categoryFilter === 'Todos' ||
    product.category === categoryFilter

  return matchesSearch && matchesCategory
  
})

 const imagePreview = image ? URL.createObjectURL(image) : null

  return (
    <AdminLayout>
      <div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-title">
              PRODUTOS
            </h1>

            <p className="text-sm text-zinc-500 mt-1">
              Cadastre, edite e organize os produtos do cardápio
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-xs text-zinc-500 font-bold uppercase">
              Produtos ativos
            </p>

            <p className="text-2xl font-black text-[#4A1F08]">
              {products.filter(product => product.active !== false).length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm mb-6">
          <h2 className="text-xl font-title mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Produto
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
              className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
            />

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preço"
              className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm md:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
            >
              {categories.map(item => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
            />
            {imagePreview && (
  <div className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-3xl p-4">

    <p className="text-xs font-black text-zinc-400 uppercase mb-3">
      Prévia do produto
    </p>

    <div className="bg-white rounded-2xl border overflow-hidden max-w-sm">

      <img
        src={imagePreview}
        alt="Prévia do produto"
        className="w-full h-52 object-cover"
      />

      <div className="p-4">

        <h3 className="text-xl font-black">
          {name || 'Nome do produto'}
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          {description || 'Descrição do produto'}
        </p>

        <p className="text-2xl font-black text-[#4A1F08] mt-3">
          R$ {Number(price || 0).toFixed(2)}
        </p>

      </div>

    </div>

  </div>
)}
          </div>

          <button
            onClick={createProduct}
            className="
              mt-4
              bg-[#4A1F08]
              text-white
              px-6
              py-4
              rounded-2xl
              font-bold
              transition-all
              hover:scale-[1.02]
              active:scale-95
            "
          >
            Criar Produto
          </button>
        </div>

        {editingProduct && (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-3xl shadow-sm mb-6 space-y-4">

            <h2 className="text-xl font-black">
              Editando: {editingProduct.name}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome"
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Preço"
                className="w-full border p-4 rounded-2xl"
              />

              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição"
                className="w-full border p-4 rounded-2xl md:col-span-2"
              />

              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full border p-4 rounded-2xl"
              >
                {categories.map(item => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 bg-[#4A1F08] text-white py-4 rounded-2xl font-bold"
              >
                Salvar Alterações
              </button>

              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-white border py-4 rounded-2xl font-bold"
              >
                Cancelar
              </button>
            </div>

          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto, descrição ou categoria..."
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-6">

  {['Todos', ...categories].map(item => (
    <button
      key={item}
      onClick={() => setCategoryFilter(item)}
      className={`
        px-4
        py-2
        rounded-xl
        text-sm
        font-bold
        whitespace-nowrap
        border
        ${
          categoryFilter === item
            ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
            : 'bg-white text-zinc-600 border-zinc-200'
        }
      `}
    >
      {item}
    </button>
  ))}

</div>

<div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm mb-6">

  <h2 className="text-xl font-title mb-4">
    Adicionais dos Produtos
  </h2>

  <div className="grid gap-3 md:grid-cols-5">

    <select
      value={extraProductId}
      onChange={(e) => setExtraProductId(e.target.value)}
      className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
    >
      <option value="">
        Produto
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
      value={extraName}
      onChange={(e) => setExtraName(e.target.value)}
      placeholder="Nome. Ex: Bacon"
      className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
    />

    <input
      type="number"
      value={extraPrice}
      onChange={(e) => setExtraPrice(e.target.value)}
      placeholder="Preço"
      className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
    />

    <input
      type="number"
      value={extraOrder}
      onChange={(e) => setExtraOrder(e.target.value)}
      placeholder="Ordem"
      className="w-full border border-zinc-200 p-4 rounded-2xl shadow-sm"
    />

    <button
      onClick={createExtra}
      className="
        bg-[#4A1F08]
        text-white
        rounded-2xl
        font-bold
        transition-all
        hover:scale-[1.02]
        active:scale-95
      "
    >
      Adicionar
    </button>

  </div>

</div>

{extras.length > 0 && (
  <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm mb-8 overflow-hidden">

    <div className="p-5 border-b">
      <h2 className="text-xl font-title">
        Adicionais Cadastrados
      </h2>
    </div>

    <div className="divide-y">

      {extras.map(extra => (
        <div
          key={extra.id}
          className="p-4 flex items-center justify-between gap-4"
        >

          <div>
            <p className="font-black">
              {extra.name}
            </p>

            <p className="text-sm text-zinc-500">
              {extra.products?.name || 'Produto'} · R$ {Number(extra.price || 0).toFixed(2)} · Ordem {extra.display_order}
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => toggleExtra(extra)}
              className={`
                px-4
                py-2
                rounded-xl
                font-bold
                border
                ${
                  extra.active
                    ? 'bg-zinc-100 text-zinc-700'
                    : 'bg-green-600 text-white border-green-600'
                }
              `}
            >
              {extra.active ? 'Desativar' : 'Ativar'}
            </button>

            <button
              onClick={() => deleteExtra(extra.id)}
              className="px-4 py-2 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-50"
            >
              Excluir
            </button>

          </div>

        </div>
      ))}

    </div>

  </div>
)}

        <div className="grid md:grid-cols-3 gap-6">

          {visibleProducts.map(product => (
            <div
              key={product.id}
              className="
                bg-white
                rounded-3xl
                overflow-hidden
                border
                border-zinc-200
                shadow-sm
              "
            >

              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold">
                  Sem imagem
                </div>
              )}

              <div className="p-5">

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">
                      {product.name}
                    </h2>

                    <p className="text-xs text-zinc-500 mt-1">
                      {product.category || 'Sem categoria'}
                    </p>
                  </div>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      ${
                        product.active === false
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }
                    `}
                  >
                    {product.active === false ? 'Inativo' : 'Ativo'}
                  </span>
                </div>

                <p className="text-zinc-500 text-sm mt-3 min-h-10">
                  {product.description}
                </p>

                <p className="text-2xl font-black text-[#4A1F08] mt-4">
                  R$ {Number(product.price || 0).toFixed(2)}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-5">

                  <button
                    onClick={() => startEdit(product)}
                    className="bg-white border border-zinc-200 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => toggleActive(product)}
                    className={`
                      py-3
                      rounded-2xl
                      font-bold
                      ${
                        product.active === false
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-200 text-zinc-700'
                      }
                    `}
                  >
                    {product.active === false ? 'Ativar' : 'Desativar'}
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="col-span-2 bg-red-50 text-red-700 border border-red-200 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </AdminLayout>
  )
}