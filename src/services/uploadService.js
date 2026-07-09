import { supabase } from '../lib/supabase'

export async function uploadImage(file, folder = 'store') {
  if (!file) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('public')
    .upload(fileName, file, {
      upsert: true
    })

  if (error) {
    console.log('Erro ao enviar imagem:', error)
    return null
  }

  const { data } = supabase.storage
    .from('public')
    .getPublicUrl(fileName)

  return data.publicUrl
}