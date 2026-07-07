export default function FeaturedSection({
  featuredProducts,
  onOpenProduct,
  onAddToCart,
  disabled = false
}) {
  if (featuredProducts.length === 0) return null

  return (
    <section className="mb-8">

      <h2 className="text-xl font-title mb-3">
        ⭐ Destaques
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">

        {featuredProducts.map(item => {
          const product = item.products

          return (
            <div
              key={item.id}
              onClick={() => {
  if (disabled) return
  onOpenProduct(product)
}}
              className="
                flex-none
                w-[145px]
                md:w-auto
                bg-[#FFFCF9]
                rounded-2xl
                overflow-hidden
                border
                border-[#E9DED2]
                shadow-[0_8px_24px_rgba(0,0,0,0.05)]
                cursor-pointer
              "
            >

              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-24 md:h-40 object-contain bg-[#FBF3EA]"
                />
              )}

              <div className="p-2">

                <h3 className="text-sm font-black line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-sm text-zinc-500 mt-3 leading-5 line-clamp-2 min-h-10">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-2">

                  <span className="text-sm font-black text-[#4A1F08]">
                    R$ {Number(product.price).toFixed(2)}
                  </span>

                  <button
  disabled={disabled}
  onClick={(e) => {
    e.stopPropagation()

    if (disabled) return

    onAddToCart(product)
  }}
  className={`
    w-9
    h-9
    rounded-full
    font-black
    shadow-lg
    ${
      disabled
        ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
        : 'bg-[#5A2100] text-white active:scale-95'
    }
  `}
>
  {disabled ? '×' : '+'}
</button>

                </div>

              </div>

            </div>
          )
        })}

      </div>

    </section>
  )
}