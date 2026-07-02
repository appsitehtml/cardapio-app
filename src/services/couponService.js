import { supabase } from '../lib/supabase'

export async function validateCoupon({
  couponCode,
  total,
  phone
}) {
  if (!couponCode.trim()) {
    return {
      ok: false,
      message: 'Digite um cupom.'
    }
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.trim().toUpperCase())
    .eq('active', true)
    .maybeSingle()

  if (error || !coupon) {
    return {
      ok: false,
      message: 'Cupom inválido.'
    }
  }

  if (
    coupon.valid_until &&
    new Date(coupon.valid_until) < new Date()
  ) {
    return {
      ok: false,
      message: 'Este cupom expirou.'
    }
  }

  if (
    coupon.max_uses &&
    Number(coupon.times_used || 0) >= Number(coupon.max_uses)
  ) {
    return {
      ok: false,
      message: 'Este cupom atingiu o limite de utilizações.'
    }
  }

  if (Number(total) < Number(coupon.minimum_order || 0)) {
    return {
      ok: false,
      message: `Pedido mínimo de R$ ${Number(coupon.minimum_order).toFixed(2)}.`
    }
  }

  if (coupon.first_order_only) {
    const { count, error: ordersError } = await supabase
      .from('orders')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('phone', phone.trim())

    if (ordersError) {
      return {
        ok: false,
        message: 'Erro ao validar o cliente.'
      }
    }

    if ((count || 0) > 0) {
      return {
        ok: false,
        message: 'Este cupom é válido apenas no primeiro pedido.'
      }
    }
  }

  let discount = 0

  if (coupon.discount_type === 'percentage') {
    discount = total * (Number(coupon.discount_value) / 100)
  }

  if (coupon.discount_type === 'fixed') {
    discount = Number(coupon.discount_value)
  }

  if (discount > total) {
    discount = total
  }

  return {
    ok: true,
    coupon,
    discount,
    message: `Cupom "${coupon.code}" aplicado.`
  }
}

export async function incrementCouponUse(coupon) {
  if (!coupon) return

  await supabase
    .from('coupons')
    .update({
      times_used: Number(coupon.times_used || 0) + 1
    })
    .eq('id', coupon.id)
}