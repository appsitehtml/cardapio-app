import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Gift, Star, Trophy, User } from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase } from '../lib/supabase'

export default function Loyalty() {
  const [card, setCard] = useState(null)
  const [rewards, setRewards] = useState([])
  const [transactions, setTransactions] = useState([])
const [activeTab, setActiveTab] = useState('overview')
  const phone = localStorage.getItem('customer_phone') || ''
  const name = localStorage.getItem('customer_name') || ''

  async function loadLoyalty() {
    if (!phone) return

    const { data: cardData } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('customer_phone', phone)
      .single()

    const { data: rewardsData } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('active', true)
      .order('points_required', { ascending: true })

      const { data: transactionsData } = await supabase
  .from('loyalty_transactions')
  .select('*')
  .eq('customer_phone', phone)
  .order('id', { ascending: false })

    setCard(cardData)
    setRewards(rewardsData || [])
    setTransactions(transactionsData || [])
  }

async function redeemReward(reward) {
  if (!card) return

  const currentPoints = Number(card.redeem_points || card.points || 0)
  const pointsRequired = Number(reward.points_required || 0)

  if (currentPoints < pointsRequired) {
    toast.error('Pontos insuficientes')
    return
  }

  const confirmRedeem = window.confirm(
    `Deseja resgatar ${reward.name} por ${pointsRequired} pontos?`
  )

  if (!confirmRedeem) return

  const newPoints = currentPoints - pointsRequired

  await supabase
    .from('loyalty_cards')
    .update({
      points: newPoints,
      redeem_points: newPoints,
      rewards_redeemed: Number(card.rewards_redeemed || 0) + 1
    })
    .eq('customer_phone', phone)

  await supabase
    .from('loyalty_transactions')
    .insert([
      {
        customer_phone: phone,
        customer_name: name,
        type: 'redeem',
        points: -pointsRequired,
        level_points: 0,
        description: `Resgate de ${reward.name}`,
        reward_name: reward.name
      }
    ])

  await supabase
    .from('loyalty_redemptions')
    .insert([
      {
        customer_phone: phone,
        customer_name: name,
        reward_id: String(reward.id),
        reward_name: reward.name,
        points_used: pointsRequired,
        status: 'pending'
      }
    ])

  toast.success('Recompensa resgatada!')

  loadLoyalty()
}

  useEffect(() => {
    loadLoyalty()
  }, [])

  const points = Number(card?.redeem_points || card?.points || 0)
const levelPoints = Number(card?.level_points || card?.points || 0)
const tier = card?.tier || 'bronze'
const tiers = [
  {
    name: 'bronze',
    label: 'Bronze',
    min: 0,
    next: 300,
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    multiplier: 'x1'
  },
  {
    name: 'prata',
    label: 'Prata',
    min: 300,
    next: 800,
    color: 'text-zinc-500',
    bg: 'bg-zinc-100',
    multiplier: 'x1.2'
  },
  {
    name: 'ouro',
    label: 'Ouro',
    min: 800,
    next: 1500,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    multiplier: 'x1.5'
  },
  {
    name: 'diamante',
    label: 'Diamante',
    min: 1500,
    next: null,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    multiplier: 'x2'
  }
  
]

const currentTier =
  tiers.find(item => item.name === tier) || tiers[0]

const nextTier =
  tiers.find(item => item.min === currentTier.next)

const progress =
  currentTier.next
    ? ((levelPoints - currentTier.min) / (currentTier.next - currentTier.min)) * 100
    : 100

const safeProgress = Math.min(Math.max(progress, 0), 100)

const pointsToNext =
  currentTier.next
    ? Math.max(currentTier.next - levelPoints, 0)
    : 0

    const tierOrder = {
  bronze: 1,
  prata: 2,
  ouro: 3,
  diamante: 4
}

const tierBenefits = {
  bronze: [
    '1x pontos por R$ gasto'
  ],

  prata: [
    '1.2x pontos por R$ gasto',
    'Acesso às recompensas Bronze e Prata'
  ],

  ouro: [
    '1.5x pontos por R$ gasto',
    'Acesso às recompensas Bronze, Prata e Ouro'
  ],

  diamante: [
    '2x pontos por R$ gasto',
    'Acesso a todas as recompensas',
    'Benefícios exclusivos'
  ]
}

const availableRewards = rewards.filter(reward => {
  const requiredTier = reward.tier_required || 'bronze'

  
  return tierOrder[requiredTier] <= tierOrder[tier]
})

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

        <h1 className="text-4xl font-black mb-2">
          FIDELIDADE
        </h1>

        <p className="text-zinc-500 mb-6">
          Acompanhe seus pontos e recompensas.
        </p>

        {!phone && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm text-center">
            <User className="w-12 h-12 mx-auto text-amber-800 mb-3" />

            <p className="text-xl font-black">
              Complete seu perfil
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Salve seu telefone no perfil para acompanhar seus pontos automaticamente.
            </p>

            <Link
              to="/profile"
              className="inline-block mt-5 bg-[#4A1F08] text-white px-5 py-3 rounded-xl font-bold"
            >
              Ir para Perfil
            </Link>
          </div>
        )}

        {phone && !card && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm text-center">
            <Star className="w-12 h-12 mx-auto text-amber-700 mb-3" />

            <p className="font-black text-lg">
              Você ainda não tem pontos
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Finalize pedidos para começar a acumular pontos.
            </p>
          </div>
        )}

        {card && (
          <>
            <div className="bg-yellow-100 border border-yellow-200 rounded-3xl p-6 shadow-sm mb-8">

  <div className="flex items-start justify-between">

    <div>
      <p className="text-sm text-zinc-600">
        Seu nível
      </p>

      <div className="flex items-center gap-3 mt-2">
        <span className="text-3xl">
          🏅
        </span>

        <h2 className={`text-3xl font-black ${currentTier.color}`}>
          {currentTier.label}
        </h2>
      </div>
    </div>

    <div className="text-right">
      <p className="text-sm text-zinc-600">
        Multiplicador
      </p>

      <p className="text-2xl font-black text-[#4A1F08]">
        {currentTier.multiplier}
      </p>
    </div>

  </div>

  <div className="mt-6">

    <div className="flex justify-between text-sm text-zinc-600 mb-2">

      <span>
        {levelPoints.toFixed(2)} pts
      </span>

      {nextTier ? (
        <span>
          {pointsToNext.toFixed(2)} pts para {nextTier.label}
        </span>
      ) : (
        <span>
          Nível máximo
        </span>
      )}

    </div>

    <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#4A1F08] rounded-full transition-all"
        style={{ width: `${safeProgress}%` }}
      />
    </div>

  </div>

 <div className="grid grid-cols-2 gap-5 mb-4 mt-4">

  <div className="bg-white rounded-3xl border border-zinc-100 p-6 text-center shadow-sm">

    <p className="text-3xl mb-2">
      🎁
    </p>

    <p className="text-3xl font-black text-[#4A1F08]">
      {points.toFixed(2)}
    </p>

    <p className="text-zinc-500 mt-1">
      Pts de Resgate
    </p>

  </div>

  <div className="bg-white rounded-3xl border border-zinc-100 p-6 text-center shadow-sm">

    <p className="text-3xl mb-2">
      📈
    </p>

    <p className="text-3xl font-black text-blue-600">
      {levelPoints.toFixed(2)}
    </p>

    <p className="text-zinc-500 mt-1">
      Pts de Nível
    </p>

  </div>

</div>

</div>

<div className="flex gap-2 mb-6 overflow-x-auto">

  <button
    onClick={() => setActiveTab('overview')}
    className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-bold
      whitespace-nowrap
      ${
        activeTab === 'overview'
          ? 'bg-[#4A1F08] text-white'
          : 'bg-white border border-zinc-200 shadow-sm'
      }
    `}
  >
    Visão Geral
  </button>

  <button
    onClick={() => setActiveTab('rewards')}
    className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-bold
      whitespace-nowrap
      ${
        activeTab === 'rewards'
          ? 'bg-[#4A1F08] text-white'
          : 'bg-white border border-zinc-200 shadow-sm'
      }
    `}
  >
    Recompensas
  </button>

  <button
    onClick={() => setActiveTab('history')}
    className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-bold
      whitespace-nowrap
      ${
        activeTab === 'history'
          ? 'bg-[#4A1F08] text-white'
          : 'bg-white border border-zinc-200 shadow-sm'
      }
    `}
  >
    Histórico
  </button>

</div>

{activeTab === 'overview' && (

  <div className="space-y-4 mb-6">

    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">

      <h3 className="font-black text-lg">
        Benefícios do nível {currentTier.label}
      </h3>

      <div className="mt-4 space-y-2">

        {tierBenefits[tier]?.map((benefit, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-amber-700">•</span>

            <span>{benefit}</span>
          </div>
        ))}

      </div>

      {nextTier && (
        <div className="mt-4 pt-4 border-t">

          <p className="text-sm text-zinc-500">
            Próximo nível
          </p>

          <p className="font-black text-lg">
            {nextTier.label}
          </p>

          <p className="text-sm text-[#4A1F08] mt-1">
            Faltam {pointsToNext.toFixed(2)} pontos
          </p>

        </div>
      )}

    </div>

   <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">

  <div className="flex justify-between items-center py-2">
    <span className="text-zinc-500">
      Total de pedidos
    </span>

    <span className="font-black">
      {card.total_orders || 0}
    </span>
  </div>

  <div className="flex justify-between items-center py-2">
    <span className="text-zinc-500">
      Total gasto
    </span>

    <span className="font-black">
      R$ {Number(card.total_spent || 0).toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center py-2">
    <span className="text-zinc-500">
      Recompensas resgatadas
    </span>

    <span className="font-black">
      {card.rewards_redeemed || 0}
    </span>
  </div>

</div>
  </div>

)}

            {activeTab === 'rewards' && (
<>
<div className="mb-4">
              <h2 className="text-2xl font-black">
                RECOMPENSAS
              </h2>

             <div className="bg-blue-50 border border-blue-300 rounded-2xl p-4 mt-4 text-blue-700 text-sm">
  <p className="font-bold">
    💡 Como resgatar suas recompensas?
  </p>

  <p className="mt-1">
    Na tela de Finalizar Pedido, escolha uma recompensa para adicionar gratuitamente ao seu pedido.
  </p>
</div>

 <div className="space-y-4 mt-3">

              {availableRewards.map(reward => {
                const canRedeem = points >= Number(reward.points_required)

                return (
                  <div
                    key={reward.id}
                    className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">

                      <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl">
                        <Gift className="w-6 h-6" />
                      </div>

                      <div className="flex-1">

                        <h3 className="text-xl font-black">
                          {reward.name}
                        </h3>

                        <p className="text-sm text-zinc-500 mt-1">
                          {reward.description}
                        </p>

                        <div className="mt-0 flex items-center justify-between">

                          <span className="font-bold text-[#4A1F08]">
                            {reward.points_required} pontos
                          </span>

                         <div className="flex flex-col items-end gap-1">

  <span
    className="
      px-3
      py-1
      rounded-full
      text-xs
      font-bold
      bg-amber-50
      text-amber-800
      border
      border-amber-200
      uppercase
    "
  >
    {reward.tier_required || 'bronze'}
  </span>

  <span
    className={`
      px-3
      py-1
      rounded-full
      text-xs
      font-bold
      ${canRedeem
        ? 'bg-green-50 text-green-700 border border-green-300'
        : 'bg-zinc-100 text-zinc-500 border'
      }
    `}
  >
    {canRedeem
      ? 'Disponível'
      : `Faltam ${(Number(reward.points_required) - points).toFixed(2)} pts`
    }
  </span>

  
</div>

                        </div>

                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
            </div>
            </>
)}

{activeTab === 'history' && (

  <div className="space-y-6">

    <div className="mb-4">
      <h2 className="text-2xl font-black">
        HISTÓRICO
      </h2>

      <p className="text-sm text-zinc-500">
        Veja suas movimentações de pontos.
      </p>
    </div>

    {transactions.length === 0 ? (

      <div className="bg-white rounded-2xl border p-6 shadow-sm text-center text-zinc-500">
        Nenhuma movimentação encontrada.
      </div>

    ) : (

      transactions.map(transaction => (

        <div
          key={transaction.id}
          className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
        >

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="font-black">
                {transaction.description}
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                {transaction.type === 'earn'
                  ? 'Pontos ganhos'
                  : 'Movimentação'}
              </p>

            </div>

            <div
              className={`
                px-3
                py-1
                rounded-full
                text-sm
                font-black
                ${
                  Number(transaction.points) >= 0
                    ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-red-50 text-red-600 border border-red-300'
                }
              `}
            >
              {Number(transaction.points) >= 0 ? '+' : ''}
              {Number(transaction.points).toFixed(2)} pts
            </div>

          </div>

          {transaction.order_amount && (
            <p className="text-xs text-zinc-500 mt-3">
              Pedido: R$ {Number(transaction.order_amount).toFixed(2)}
            </p>
          )}

        </div>

      ))

    )}

  </div>

)}

          </>
        )}

      </div>

    </div>
    
  )
}