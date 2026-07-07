export default function ProductCard({ product, onOpen, disabled = false }) {
  return (
    <div
      onClick={() => onOpen(product)}
      className="
        bg-[#FFFCF7]
        rounded-2xl
        border
        border-[#E7DED5]
        overflow-hidden
        cursor-pointer
      "
    >
      <div className="h-[190px] md:h-[220px] overflow-hidden bg-[#fff7ef]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-bold">
            Sem imagem
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-black text-[#2B211B] leading-tight">
            {product.name}
          </h3>

          <p className="text-[17px] font-black text-[#4A1E05] whitespace-nowrap">
            R$ {Number(product.price || 0).toFixed(2)}
          </p>
        </div>

        <p className="text-[15px] text-[#8A7465] mt-3 leading-5 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>

        <button
  disabled={disabled}
  onClick={() => {
  if (disabled) return
  onOpen(product)
}}
  className={`
    mt-4
    w-full
    h-[34px]
    rounded-lg
    font-bold
    text-sm
    flex
    items-center
    justify-center
    gap-3
    transition-all
    ${
      disabled
        ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
        : 'bg-[#4A1E05] text-white active:scale-95'
    }
  `}
>
  <span className="text-xl leading-none font-normal">
    {disabled ? '×' : '+'}
  </span>

  <span>
    {disabled ? 'Fechado' : 'Adicionar'}
  </span>
</button>
      </div>
    </div>
  )
}