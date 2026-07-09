import AdminLayout from '../components/AdminLayout'

import { useStoreSettings } from '../hooks/useStoreSettings'

import GeneralSettings from '../components/store/GeneralSettings'
import StatusSelector from '../components/store/StatusSelector'
import StoreHoursSettings from '../components/store/StoreHoursSettings'
import DeliverySettings from '../components/store/DeliverySettings'
import PaymentSettings from '../components/store/PaymentSettings'
import AppearanceSettings from '../components/store/AppearanceSettings'

export default function AdminStore() {
  const {
    settings,
    loading,
    saving,
    message,
    updateSetting,
    saveSettings
  } = useStoreSettings()

  if (loading) {
    return (
      <AdminLayout>
        <p>Carregando configurações...</p>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout>
        <p>Configurações não encontradas.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl">

        <div className="mb-8">
          <h1 className="text-4xl font-title">
            LOJA
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Configure informações gerais, funcionamento, delivery, pagamentos e aparência.
          </p>
        </div>

        <div className="space-y-6">

          <GeneralSettings
            settings={settings}
            updateSetting={updateSetting}
          />

          <StatusSelector
            settings={settings}
            updateSetting={updateSetting}
          />

          <StoreHoursSettings />

          <DeliverySettings
            settings={settings}
            updateSetting={updateSetting}
          />

          <PaymentSettings
            settings={settings}
            updateSetting={updateSetting}
          />

          <AppearanceSettings
            settings={settings}
            updateSetting={updateSetting}
          />

          {message && (
            <p className="text-sm font-bold text-[#4A1F08]">
              {message}
            </p>
          )}

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-[#4A1F08] text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>

        </div>

      </div>
    </AdminLayout>
  )
}