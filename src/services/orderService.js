import { supabase } from '../lib/supabase'

export async function createOrder({
  customer,
  name,
  phone,
  address,
  notes,
  paymentMethod,
  changeFor,
  appliedCoupon,
  discountAmount,
  finalTotal,
  selectedReward,
  cart
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        customer_id: customer?.id || null,
        customer_name: name,
        phone,
        address,
        notes,
        payment_method: paymentMethod,
        change_for: changeFor,
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discountAmount,
        status: 'recebido',
        total_amount: finalTotal,
        loyalty_reward_name: selectedReward?.name || null,
        loyalty_points_used: selectedReward
          ? Number(selectedReward.points_required || 0)
          : 0,
        items: cart
      }
    ])
    .select()
    .single()

  return { data, error }
}