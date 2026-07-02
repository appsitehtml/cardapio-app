export default function ProductModal({
  product,
  productExtras,
  selectedExtras,
  setSelectedExtras,
  quantity,
  setQuantity,
  itemNote,
  setItemNote,
  productTotal,
  onClose,
  onAdd
}) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#faf4ee]">

      <div className="h-full overflow-y-auto pb-32">

        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-44 md:h-56 object-cover"
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 border rounded-full w-10 h-10 font-black z-[70]"
        >
          ×
        </button>

        <div className="px-6 py-5">

          <p className="text-xs text-[#4A1F08] font-black uppercase">
            {product.category || 'Produto'}
          </p>

          <h2 className="text-3xl font-black mt-1">
            {product.name}
          </h2>

          <p className="text-zinc-600 mt-3">
            {product.description}
          </p>

          {productExtras.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-black mb-3">
                Adicionais
              </p>

              <div className="space-y-2">
                {productExtras.map(extra => {
                  const checked = selectedExtras.some(item => item.id === extra.id)

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => {
                        if (checked) {
                          setSelectedExtras(prev =>
                            prev.filter(item => item.id !== extra.id)
                          )
                        } else {
                          setSelectedExtras(prev => [...prev, extra])
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between border rounded-2xl p-4 text-left
                        ${
                          checked
                            ? 'border-[#4A1F08] bg-amber-50'
                            : 'border-zinc-200 bg-white'
                        }
                      `}
                    >
                      <div>
                        <p className="font-bold">{extra.name}</p>
                        <p className="text-sm text-zinc-500">
                          + R$ {Number(extra.price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div
                        className={`
                          w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black
                          ${
                            checked
                              ? 'bg-[#4A1F08] text-white border-[#4A1F08]'
                              : 'border-zinc-300'
                          }
                        `}
                      >
                        {checked ? '✓' : ''}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-bold mb-2">
              Observações do item
            </label>

            <textarea
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="Ex: sem cebola, molho separado..."
              className="w-full border border-zinc-200 rounded-2xl p-4 min-h-24 outline-none"
            />
          </div>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#faf4ee] border-t border-zinc-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">

          <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-3 py-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(quantity - 1, 1))}
              className="w-9 h-9 rounded-full bg-zinc-100 font-black"
            >
              -
            </button>

            <span className="font-black text-lg w-6 text-center">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-full bg-zinc-100 font-black"
            >
              +
            </button>
          </div>

          <button
            onClick={onAdd}
            className="flex-1 bg-[#4A1F08] text-white py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          >
            Adicionar · R$ {productTotal.toFixed(2)}
          </button>

        </div>
      </div>

    </div>
  )
}