import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, MapPin, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const [name, setName] = useState(localStorage.getItem('customer_name') || '')
  const [phone, setPhone] = useState(localStorage.getItem('customer_phone') || '')
  const [address, setAddress] = useState(localStorage.getItem('customer_address') || '')

  function saveProfile() {
    localStorage.setItem('customer_name', name)
    localStorage.setItem('customer_phone', phone)
    localStorage.setItem('customer_address', address)

    toast.success('Perfil salvo com sucesso!')
  }

  return (
    <div className="min-h-screen bg-[#faf4ee] px-4 py-8">

      <div className="max-w-xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:text-[#4A1F08]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

       <h1 className="text-4xl font-title">
  PERFIL
</h1>

        <p className="text-zinc-500 mb-6">
          Salve seus dados para agilizar seus próximos pedidos.
        </p>

        <div className="bg-white rounded-3xl border shadow-sm p-5 space-y-4">

          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Nome
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              Telefone
            </label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Seu telefone"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Endereço
            </label>

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            onClick={saveProfile}
            className="
              w-full
              bg-[#4A1F08]
              text-white
              py-4
              rounded-2xl
              font-bold
              flex
              items-center
              justify-center
              gap-2
              transition-all
              hover:scale-[1.02]
              active:scale-95
            "
          >
            <Save className="w-5 h-5" />
            Salvar Perfil
          </button>

        </div>

      </div>

    </div>
  )
}