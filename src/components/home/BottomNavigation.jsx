import { Link } from 'react-router-dom'
import { ShoppingBag, ClipboardList, Star, User } from 'lucide-react'

export default function BottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#faf4ee] border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 py-2">

        <Link to="/" className="flex flex-col items-center gap-1 text-[#4A1F08] text-xs font-bold">
          <ShoppingBag className="w-5 h-5" />
          Cardápio
        </Link>

        <Link to="/my-orders" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
          <ClipboardList className="w-5 h-5" />
          Pedidos
        </Link>

        <Link to="/loyalty" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
          <Star className="w-5 h-5" />
          Fidelidade
        </Link>

        <Link to="/profile" className="flex flex-col items-center gap-1 text-zinc-500 text-xs font-bold">
          <User className="w-5 h-5" />
          Perfil
        </Link>

      </div>
    </nav>
  )
}