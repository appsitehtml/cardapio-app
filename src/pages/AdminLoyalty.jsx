import { useEffect, useState } from 'react'
import { Gift, Star, Power, Trash2 } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminLoyalty() {
  const [rewards, setRewards] = useState([])
  const [cards, setCards] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pointsRequired, setPointsRequired] = useState('')
  const [tierRequired, setTierRequired] = useState('bronze')

  async function loadData() {
    const { data: rewardsData } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .order('points_required', { ascending: true })

    const { data: cardsData } = await supabase
      .from('loyalty_cards')
      .select('*')
      .order('points', { ascending: false })

    setRewards(rewardsData || [])
    setCards(cardsData || [])
  }

  async function createReward() {
    if (!name.trim()) return
    if (!pointsRequired) return

    await supabase
      .from('loyalty_rewards')
      .insert([
       {
  name,
  description,
  points_required: pointsRequired,
  tier_required: tierRequired,
  active: true
}
      ])

    setName('')
    setDescription('')
    setPointsRequired('')
    setTierRequired('bronze')

    loadData()
  }

  async function toggleReward(reward) {
    await supabase
      .from('loyalty_rewards')
      .update({ active: !reward.active })
      .eq('id', reward.id)

    loadData()
  }

  async function deleteReward(id) {
    const confirmDelete = window.confirm('Deseja excluir esta recompensa?')
    if (!confirmDelete) return

    await supabase
      .from('loyalty_rewards')
      .delete()
      .eq('id', id)

    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AdminLayout>

      <div>

        <div className="mb-8">
          <h1 className="text-4xl font-title">
  FIDELIDADE
</h1>

          <p className="text-sm text-zinc-500 mt-1">
            Gerencie recompensas e acompanhe os pontos dos clientes
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Clientes no programa
            </p>

            <p className="text-3xl font-black mt-2">
              {cards.length}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Recompensas
            </p>

            <p className="text-3xl font-black mt-2 text-amber-800">
              {rewards.length}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Recompensas ativas
            </p>

            <p className="text-3xl font-black mt-2 text-green-600">
              {rewards.filter(reward => reward.active).length}
            </p>
          </div>

        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm mb-8">

          <h2 className="text-xl font-black mb-4">
            Criar Recompensa
          </h2>

          <div className="grid gap-3 md:grid-cols-5">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome. Ex: Batata grátis"
              className="border rounded-xl p-3"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="border rounded-xl p-3"
            />

            <input
              type="number"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              placeholder="Pontos necessários"
              className="border rounded-xl p-3"
            />

<select
  value={tierRequired}
  onChange={(e) => setTierRequired(e.target.value)}
  className="border rounded-xl p-3"
>
  <option value="bronze">Bronze</option>
  <option value="prata">Prata</option>
  <option value="ouro">Ouro</option>
  <option value="diamante">Diamante</option>
</select>
           
            <button
              onClick={createReward}
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

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <h2 className="text-2xl font-black mb-4">
              RECOMPENSAS
            </h2>

            <div className="space-y-4">

              {rewards.map(reward => (

                <div
                  key={reward.id}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl">
                        <Gift className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="text-xl font-black">
                          {reward.name}
                        </h3>

                        <p className="text-sm text-zinc-500 mt-1">
                          {reward.description}
                        </p>

                        <p className="font-bold text-[#4A1F08] mt-3">
                          {reward.points_required} pontos
                        </p>
                        <p className="text-xs font-bold text-zinc-500 uppercase mt-1">
  Nível: {reward.tier_required || 'bronze'}
</p>
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
                        ${reward.active
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-red-50 text-red-600 border-red-300'
                        }
                      `}
                    >
                      {reward.active ? 'Ativa' : 'Inativa'}
                    </span>

                  </div>

                  <div className="flex gap-2 mt-5">

                    <button
                      onClick={() => toggleReward(reward)}
                      className="flex-1 border rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-zinc-100"
                    >
                      <Power className="w-4 h-4" />
                      {reward.active ? 'Desativar' : 'Ativar'}
                    </button>

                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="flex-1 border border-red-200 text-red-600 rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

          <div>

            <h2 className="text-2xl font-black mb-4">
              CLIENTES
            </h2>

            <div className="space-y-4">

              {cards.map(card => (

                <div
                  key={card.customer_phone}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <h3 className="text-lg font-black">
                        {card.customer_name || 'Cliente'}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        {card.customer_phone}
                      </p>
                    </div>

                    <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl">
                      <Star className="w-5 h-5" />
                    </div>

                  </div>

<div className="mt-4 inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
  {card.tier || 'bronze'}
</div>
                  <div className="grid grid-cols-3 gap-3 mt-5">

                    <div className="bg-zinc-100 rounded-xl p-3">
                      <p className="text-xs text-zinc-500">
  Resgate
</p>

<p className="text-xl font-black">
  {Number(card.redeem_points || card.points || 0).toFixed(2)}
</p>
                    </div>

                    <div className="bg-zinc-100 rounded-xl p-3">
                      <p className="text-xs text-zinc-500">
                        Pedidos
                      </p>

                      <p className="text-xl font-black">
                        {Number(card.total_orders || 0)}
                      </p>
                    </div>

                    <div className="bg-zinc-100 rounded-xl p-3">
                      <p className="text-xs text-zinc-500">
                        Gasto
                      </p>

                      <p className="text-xl font-black">
                        R$ {Number(card.total_spent || 0).toFixed(2)}
                      </p>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>
  )
}