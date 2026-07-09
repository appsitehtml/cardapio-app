export default function DeliverySettings({ settings, updateSetting }) {
  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-title mb-4">
        Delivery
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        <input
          type="number"
          value={settings.minimum_order || ''}
          onChange={(e) =>
            updateSetting('minimum_order', Number(e.target.value || 0))
          }
          placeholder="Pedido mínimo"
          className="border border-zinc-200 rounded-xl p-3"
        />

        <input
          type="number"
          value={settings.delivery_fee || ''}
          onChange={(e) =>
            updateSetting('delivery_fee', Number(e.target.value || 0))
          }
          placeholder="Taxa de entrega"
          className="border border-zinc-200 rounded-xl p-3"
        />

        <input
          value={settings.average_delivery_time || ''}
          onChange={(e) =>
            updateSetting('average_delivery_time', e.target.value)
          }
          placeholder="Tempo médio. Ex: 30 a 50 min"
          className="border border-zinc-200 rounded-xl p-3"
        />

      </div>
    </section>
  )
}