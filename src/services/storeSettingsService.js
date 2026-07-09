import { supabase } from '../lib/supabase'

export async function getStoreSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.log('Erro ao carregar configurações:', error)
    return null
  }

  return data
}

export async function saveStoreSettings(settings) {
  if (!settings?.id) return null

  const { data, error } = await supabase
    .from('store_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', settings.id)
    .select()
    .single()

  if (error) {
    console.log('Erro ao salvar configurações:', error)
    return null
  }

  return data
}