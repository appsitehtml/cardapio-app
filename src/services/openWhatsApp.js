export function openWhatsAppOrder({
  whatsappNumber,
  message
}) {
  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  window.open(whatsappUrl, '_blank')
}