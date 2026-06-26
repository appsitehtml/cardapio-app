import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, ClipboardList, ShoppingBag } from 'lucide-react'

export default function OrderSuccess() {
  const location = useLocation()

  const orderId = location.state?.orderId
  const customerSaved = location.state?.customerSaved

  return (
    <div className="min-h-screen bg-[#faf4ee] flex items-center justify-center px-4">

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-6 max-w-md w-full text-center">

        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 animate-bounce" />
        </div>

        <h1 className="text-3xl font-title">
          Pedido enviado!
        </h1>

        {orderId && (
          <p className="text-zinc-500 mt-2">
            Pedido #{orderId}
          </p>
        )}

        <p className="text-zinc-600 mt-4">
          Recebemos seu pedido. Agora é só acompanhar o preparo.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-5">

  <p className="text-xs uppercase tracking-wide text-zinc-500 font-bold">
    Tempo estimado
  </p>

  <p className="text-3xl font-title text-amber-900 mt-1">
    30–50 min
  </p>

</div>

        {customerSaved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-5 text-left">
            <p className="font-bold text-amber-900">
              Suas informações foram salvas para o próximo pedido.
            </p>
          </div>
        )}

        <p className="text-sm text-zinc-500 mt-5 leading-relaxed">
Você receberá atualizações conforme o pedido for preparado.
</p>

        <div className="grid gap-3 mt-6">

          <Link
            to="/my-orders"
            className="bg-amber-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-5 h-5" />
            Acompanhar pedido
          </Link>

          <Link
            to="/"
            className="bg-white border border-zinc-200 rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Fazer outro pedido
          </Link>

        </div>

      </div>

    </div>
  )
}