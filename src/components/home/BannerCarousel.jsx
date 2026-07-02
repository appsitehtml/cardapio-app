export default function BannerCarousel({
  banners,
  bannerRef,
  currentBanner,
  onScroll,
  onGoToBanner
}) {
  if (banners.length === 0) return null

  return (
    <div className="mb-6">

      <div
        ref={bannerRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
      >
        {banners.map(banner => {
          const hasText =
            banner.title ||
            banner.subtitle ||
            banner.footer_text

          return (
            <div
              key={banner.id}
              className="min-w-full snap-center relative overflow-hidden rounded-3xl bg-white border border-zinc-200"
            >
              {banner.image_url && (
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner promocional'}
                  className="w-full h-32 md:h-48 object-cover"
                />
              )}

              {!banner.image_url && (
                <div className="bg-amber-950 text-white p-6 min-h-40">
                  {banner.title && (
                    <h2 className="text-2xl md:text-3xl font-black">
                      {banner.title}
                    </h2>
                  )}

                  {banner.subtitle && (
                    <p className="text-sm text-amber-100 mt-2">
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.footer_text && (
                    <p className="text-xs font-black mt-4 bg-white/15 border border-white/20 rounded-full px-4 py-2 w-fit">
                      {banner.footer_text}
                    </p>
                  )}
                </div>
              )}

              {banner.image_url && hasText && (
                <div className="absolute left-4 top-4 max-w-[60%] text-white">
                  {banner.title && (
                    <h2 className="text-xl md:text-3xl font-black leading-tight">
                      {banner.title}
                    </h2>
                  )}

                  {banner.subtitle && (
                    <p className="text-xs md:text-sm mt-2">
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.footer_text && (
                    <p className="text-xs font-black mt-3 bg-black/35 rounded-full px-3 py-1.5 w-fit">
                      {banner.footer_text}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToBanner(index)}
              className={`
                h-2
                rounded-full
                transition-all
                ${
                  index === currentBanner
                    ? 'w-6 bg-[#4A1F08]'
                    : 'w-2 bg-zinc-300'
                }
              `}
            />
          ))}
        </div>
      )}

    </div>
  )
}