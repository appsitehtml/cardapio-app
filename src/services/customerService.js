import { supabase } from '../lib/supabase'

export async function upsertCustomer({
  name,
  phone,
  address,
  finalTotal
}) {
  const cleanPhone = phone.trim()

  if (!cleanPhone) return null

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle()

  if (!existingCustomer) {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([
        {
          name,
          phone: cleanPhone,
          address,
          total_orders: 1,
          total_spent: finalTotal,
          welcome_shown: false
        }
      ])
      .select()
      .single()

    if (error) {
      console.log(error)
      return null
    }

    return {
      ...newCustomer,
      isNew: true
    }
  }

  const { data: updatedCustomer, error } = await supabase
    .from('customers')
    .update({
      name,
      address,
      total_orders:
        Number(existingCustomer.total_orders || 0) + 1,
      total_spent:
        Number(existingCustomer.total_spent || 0) +
        Number(finalTotal || 0),
      updated_at: new Date().toISOString()
    })
    .eq('phone', cleanPhone)
    .select()
    .single()

  if (error) {
    return {
      ...existingCustomer,
      isNew: false
    }
  }

  return {
    ...updatedCustomer,
    isNew: false
  }
}