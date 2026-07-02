export function buildWhatsAppMessage({
  orderId,
  cart,
  name,
  phone,
  address,
  notes,
  selectedReward,
  paymentLabel,
  paymentMethod,
  changeFor,
  appliedCoupon,
  discountAmount,
  finalTotal
}) {
  const itemsText = cart
    .map(item => {
      const extrasText =
        item.extras?.length > 0
          ? `\n${item.extras.map(extra => `   + ${extra.name}`).join('\n')}`
          : ''

      const noteText = item.note
        ? `\n   Obs: ${item.note}`
        : ''

      return `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}${extrasText}${noteText}`
    })
    .join('\n')

  let message = `🛒 *Novo Pedido*`

  if (orderId) {
    message += ` #${orderId}`
  }

  message += `\n\n*Cliente:* ${name}`
  message += `\n*Telefone:* ${phone}`
  message += `\n*Endereço:* ${address}`

  if (notes) {
    message += `\n*Observações:* ${notes}`
  }

  message += `\n\n*Itens:*\n${itemsText}`

  if (selectedReward) {
    message += `\n\n*Recompensa de Fidelidade:* ${selectedReward.name}`
    message += `\n*Pontos usados:* ${Number(selectedReward.points_required || 0).toFixed(2)} pts`
  }

  message += `\n\n*Pagamento:* ${paymentLabel(paymentMethod)}`

  if (paymentMethod === 'dinheiro' && changeFor) {
    message += `\n*Troco para:* R$ ${changeFor}`
  }

  if (appliedCoupon) {
    message += `\n*Cupom:* ${appliedCoupon.code}`
    message += `\n*Desconto:* -R$ ${discountAmount.toFixed(2)}`
  }

  message += `\n\n*Total:* R$ ${finalTotal.toFixed(2)}`

  return message
}