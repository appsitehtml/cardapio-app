import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

export default function AdminProducts() {

  const [products, setProducts] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState('Hambúrgueres')
  const [editingProduct, setEditingProduct] = useState(null)
const [editName, setEditName] = useState('')
const [editDescription, setEditDescription] = useState('')
const [editPrice, setEditPrice] = useState('')
const [editCategory, setEditCategory] = useState('')

  async function loadProducts() {

    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })

    if (data) {
      setProducts(data)
    }
  }

  async function createProduct() {

    function startEdit(product) {
  setEditingProduct(product)
  setEditName(product.name)
  setEditDescription(product.description)
  setEditPrice(product.price)
}

async function saveEdit() {
  await supabase
    .from('products')
    .update({
      name: editName,
      description: editDescription,
      price: editPrice
    })
    .eq('id', editingProduct.id)

  setEditingProduct(null)
  loadProducts()
}

async function deleteProduct(id) {
  const confirmDelete = confirm('Tem certeza que deseja excluir este produto?')

  if (!confirmDelete) return

  await supabase
    .from('products')
    .delete()
    .eq('id', id)

  loadProducts()
}

    let imageUrl = ''

    if (image) {

      const cleanName = image.name.replace(/\s+/g, '-')

const fileName = `${Date.now()}-${cleanName}`

      const { data: uploadData, error: uploadError } = await supabase
  .storage
  .from('products')
  .upload(fileName, image)

console.log('UPLOAD DATA:', uploadData)
console.log('UPLOAD ERROR:', uploadError)

      if (!uploadError) {

        const { data } = supabase
  .storage
  .from('products')
  .getPublicUrl(fileName)

console.log(data)

imageUrl = data.publicUrl
      }
    }

    await supabase
      .from('products')
      .insert([
  {
    name,
    description,
    price,
    category,
    image_url: imageUrl
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

  setEditName(product.name)
  setEditDescription(product.description)
  setEditPrice(product.price)
  setEditCategory(product.category || 'Hambúrgueres')
}

async function saveEdit() {

  await supabase
    .from('products')
    .update({
  name: editName,
  description: editDescription,
  price: editPrice,
  category: editCategory
})
    .eq('id', editingProduct.id)

  setEditingProduct(null)

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

  useEffect(() => {
    loadProducts()
  }, [])

  return (

    <div className="min-h-screen bg-zinc-100 p-6">

      <h1 className="text-4xl font-bold mb-8">
        Produtos 🍔
      </h1>

      <div
        className="
          bg-white
          p-6
          rounded-3xl
          shadow-lg
          mb-8
          space-y-4
        "
      >

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="w-full border p-4 rounded-2xl"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          className="w-full border p-4 rounded-2xl"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço"
          className="w-full border p-4 rounded-2xl"
        />

        <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full border p-4 rounded-2xl"
>
  <option>Hambúrgueres</option>
  <option>Bebidas</option>
  <option>Porções</option>
  <option>Sobremesas</option>
  <option>Combos</option>
</select>

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={createProduct}
          className="
            bg-green-600
            text-white
            px-6
            py-4
            rounded-2xl
            font-bold
          "
        >
          Criar Produto
        </button>

      </div>

      {editingProduct && (

  <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 space-y-4 border-2 border-blue-300">

    <h2 className="text-2xl font-bold">
      Editando: {editingProduct.name}
    </h2>

    <input
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="Nome"
      className="w-full border p-4 rounded-2xl"
    />

    <input
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      placeholder="Descrição"
      className="w-full border p-4 rounded-2xl"
    />

    <input
      type="number"
      value={editPrice}
      onChange={(e) => setEditPrice(e.target.value)}
      placeholder="Preço"
      className="w-full border p-4 rounded-2xl"
    />

    <select
  value={editCategory}
  onChange={(e) => setEditCategory(e.target.value)}
  className="w-full border p-4 rounded-2xl"
>
  <option>Hambúrgueres</option>
  <option>Bebidas</option>
  <option>Porções</option>
  <option>Sobremesas</option>
  <option>Combos</option>
</select>

    <div className="flex gap-3">

      <button
        onClick={saveEdit}
        className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold"
      >
        Salvar Alterações
      </button>

      <button
        onClick={() => setEditingProduct(null)}
        className="flex-1 bg-zinc-300 py-4 rounded-2xl font-bold"
      >
        Cancelar
      </button>

    </div>

  </div>

)}

      <div className="grid md:grid-cols-3 gap-6">

        {products.map(product => (

          <div
            key={product.id}
            className="
              bg-white
              rounded-3xl
              overflow-hidden
              shadow-lg
            "
          >

            {product.image_url && (

              <img
                src={product.image_url}
                alt={product.name}
                className="
                  w-full
                  h-52
                  object-cover
                "
              />

            )}

            <div className="p-5">

              <h2 className="text-2xl font-bold">
                {product.name}
              </h2>

              <p className="text-zinc-500 mt-2">
                {product.description}
              </p>

              <p className="text-green-600 font-bold text-2xl mt-4">
                R$ {Number(product.price).toFixed(2)}
              </p>

              <div className="flex gap-2 mt-5">

  <button
    onClick={() => startEdit(product)}
    className="
      flex-1
      bg-blue-500
      text-white
      py-3
      rounded-2xl
      font-bold
      transition-all
      duration-150
      hover:bg-blue-600
      hover:scale-105
      active:scale-95
    "
  >
    Editar
  </button>

  <button
    onClick={() => deleteProduct(product.id)}
    className="
      flex-1
      bg-red-500
      text-white
      py-3
      rounded-2xl
      font-bold
      transition-all
      duration-150
      hover:bg-red-600
      hover:scale-105
      active:scale-95
    "
  >
    Excluir
  </button>

</div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}