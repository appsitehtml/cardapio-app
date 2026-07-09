export default function StatusSelector({ settings, updateSetting }) {
  const options = [
    {
      value: 'auto',
      label: 'Automático',
      description: 'Usa os horários configurados.'
    },
    {
      value: 'open',
      label: 'Forçar Aberta',
      description: 'A loja fica aberta mesmo fora do horário.'
    },
    {
      value: 'closed',
      label: 'Forçar Fechada',
      description: 'A loja fica fechada mesmo dentro do horário.'
    }
  ]

  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-title mb-4">
        Funcionamento
      </h2>

      <div className="grid gap-3 md:grid-cols-3">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              updateSetting('force_status', option.value)
            }
            className={`
              border
              rounded-2xl
              p-4
              text-left
              ${
                settings.force_status === option.value
                  ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
                  : 'bg-white text-zinc-600 border-zinc-200'
              }
            `}
          >
            <p className="font-black">
              {option.label}
            </p>

            <p className="text-xs mt-1 opacity-80">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}