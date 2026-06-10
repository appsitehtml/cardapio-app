import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'

export default function AdminProducts() {

  const [products, setProducts] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)

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
          image_url: imageUrl
        }
      ])

    setName('')
    setDescription('')
    setPrice('')
    setImage(null)

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

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}