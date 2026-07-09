import { useEffect, useState } from 'react'

import {
  getStoreSettings,
  saveStoreSettings
} from '../services/storeSettingsService'

export function useStoreSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function loadSettings() {
    setLoading(true)

    const data = await getStoreSettings()

    setSettings(data)
    setLoading(false)
  }

  async function saveSettings() {
    if (!settings) return null

    setSaving(true)
    setMessage('')

    const saved = await saveStoreSettings(settings)

    setSaving(false)

    if (saved) {
      setSettings(saved)
      setMessage('Configurações salvas.')
      return saved
    }

    setMessage('Erro ao salvar configurações.')
    return null
  }

  function updateSetting(key, value) {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    saving,
    message,
    updateSetting,
    saveSettings,
    reloadSettings: loadSettings
  }
}