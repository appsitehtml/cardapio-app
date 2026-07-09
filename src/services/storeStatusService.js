import { supabase } from '../lib/supabase'

const weekdays = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
]

export async function getStoreHours() {
  const { data, error } = await supabase
    .from('store_hours')
    .select('*')
    .order('weekday', { ascending: true })

  if (error) return []

  return data || []
}

export function formatStoreHours(storeHours) {
  return storeHours.map(item => ({
    ...item,
    dayName: weekdays[item.weekday],
    label: item.is_closed
      ? 'Fechado'
      : `${item.open_time?.slice(0, 5)} às ${item.close_time?.slice(0, 5)}`
  }))
}

export function getStoreStatus(storeHours, settings = null) {
  if (settings?.force_status === 'open') {
    return {
      isOpen: true,
      message: 'Aberto agora',
      forced: true
    }
  }

  if (settings?.force_status === 'closed') {
    return {
      isOpen: false,
      message: 'Fechado no momento',
      forced: true
    }
  }

  const now = new Date()
  const weekday = now.getDay()

  const today = storeHours.find(item => item.weekday === weekday)

  if (!today || today.is_closed) {
    return {
      isOpen: false,
      message: 'Fechado no momento',
      today
    }
  }

  const currentTime = now.toTimeString().slice(0, 5)
  const openTime = today.open_time?.slice(0, 5)
  const closeTime = today.close_time?.slice(0, 5)

  const isOpen =
    currentTime >= openTime &&
    currentTime <= closeTime

  return {
    isOpen,
    message: isOpen
      ? `Aberto até ${closeTime}`
      : 'Fechado no momento',
    today
  }
}