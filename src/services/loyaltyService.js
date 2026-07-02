import { supabase } from '../lib/supabase'

export async function getAvailableRewards(phone) {
  if (!phone) return []

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('customer_phone', phone)
    .maybeSingle()

  if (!card) return []

  const currentPoints =
    Number(card.redeem_points || card.points || 0)

  const tier = card.tier || 'bronze'

  const tierOrder = {
    bronze: 1,
    prata: 2,
    ouro: 3,
    diamante: 4
  }

  const { data: rewards } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('active', true)

  return (rewards || []).filter(reward => {
    const requiredTier =
      reward.tier_required || 'bronze'

    return (
      tierOrder[requiredTier] <= tierOrder[tier] &&
      currentPoints >= Number(reward.points_required)
    )
  })
}

export async function redeemReward({
  selectedReward,
  phone,
  name
}) {
  if (!selectedReward) return

  const { data: loyaltyCard } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('customer_phone', phone)
    .maybeSingle()

  if (!loyaltyCard) return

  const currentPoints =
    Number(loyaltyCard.redeem_points || loyaltyCard.points || 0)

  const pointsUsed =
    Number(selectedReward.points_required || 0)

  const newPoints =
    Math.max(currentPoints - pointsUsed, 0)

  await supabase
    .from('loyalty_cards')
    .update({
      points: newPoints,
      redeem_points: newPoints,
      rewards_redeemed:
        Number(loyaltyCard.rewards_redeemed || 0) + 1
    })
    .eq('customer_phone', phone)

  await supabase
    .from('loyalty_transactions')
    .insert([
      {
        customer_phone: phone,
        customer_name: name,
        type: 'redeem',
        points: -pointsUsed,
        level_points: 0,
        description: `Resgate de ${selectedReward.name}`,
        reward_name: selectedReward.name
      }
    ])
}