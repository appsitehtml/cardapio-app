export default function GeneralSettings({ settings, updateSetting }) {
  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-title mb-4">
        Geral
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <input
          value={settings.store_name || ''}
          onChange={(e) =>
            updateSetting('store_name', e.target.value)
          }
          placeholder="Nome da loja"
          className="border border-zinc-200 rounded-xl p-3"
        />

        <input
          value={settings.whatsapp_number || ''}
          onChange={(e) =>
            updateSetting(
              'whatsapp_number',
              e.target.value.replace(/\D/g, '')
            )
          }
          placeholder="WhatsApp. Ex: 5511999999999"
          className="border border-zinc-200 rounded-xl p-3"
        />

        <input
          value={settings.logo_url || ''}
          onChange={(e) =>
            updateSetting('logo_url', e.target.value)
          }
          placeholder="URL da logo"
          className="border border-zinc-200 rounded-xl p-3 md:col-span-2"
        />

        {settings.logo_url && (
          <div className="md:col-span-2 border border-zinc-200 rounded-2xl p-4 bg-[#faf4ee]">
            <p className="text-xs font-bold text-zinc-500 mb-2">
              Prévia da logo
            </p>

            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-16 object-contain bg-white rounded-xl p-2 border"
            />
          </div>
        )}

      </div>
    </section>
  )
}