export default function AppearanceSettings({ settings, updateSetting }) {
  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-title mb-4">
        Aparência
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="text-xs font-bold text-zinc-500">
            Cor principal
          </label>

          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={settings.primary_color || '#4A1F08'}
              onChange={(e) =>
                updateSetting('primary_color', e.target.value)
              }
              className="w-14 h-12 rounded-xl border"
            />

            <input
              value={settings.primary_color || ''}
              onChange={(e) =>
                updateSetting('primary_color', e.target.value)
              }
              placeholder="#4A1F08"
              className="flex-1 border border-zinc-200 rounded-xl p-3"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-500">
            Cor secundária
          </label>

          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={settings.secondary_color || '#FAF4EE'}
              onChange={(e) =>
                updateSetting('secondary_color', e.target.value)
              }
              className="w-14 h-12 rounded-xl border"
            />

            <input
              value={settings.secondary_color || ''}
              onChange={(e) =>
                updateSetting('secondary_color', e.target.value)
              }
              placeholder="#FAF4EE"
              className="flex-1 border border-zinc-200 rounded-xl p-3"
            />
          </div>
        </div>

      </div>
    </section>
  )
}