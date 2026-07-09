export default function PaymentSettings({ settings, updateSetting }) {
  const paymentOptions = [
    ['pix_enabled', 'PIX'],
    ['cash_enabled', 'Dinheiro'],
    ['card_enabled', 'Cartão']
  ]

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-title mb-4">
        Pagamentos
      </h2>

      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {paymentOptions.map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-3 border border-zinc-200 rounded-2xl p-4 font-bold"
          >
            <input
              type="checkbox"
              checked={!!settings[key]}
              onChange={(e) =>
                updateSetting(key, e.target.checked)
              }
            />

            {label}
          </label>
        ))}
      </div>

      <input
        value={settings.default_payment_link || ''}
        onChange={(e) =>
          updateSetting('default_payment_link', e.target.value)
        }
        placeholder="Link de pagamento padrão"
        className="w-full border border-zinc-200 rounded-xl p-3"
      />
    </section>
  )
}