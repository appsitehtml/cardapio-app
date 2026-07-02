import { Link } from 'react-router-dom'
import { ShoppingBag, ClipboardList, Star, User } from 'lucide-react'

export default function Header({
  logo,
  categories,
  selectedCategory,
  onSelectCategory
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#faf4ee]/95 backdrop-blur border-b border-zinc-200">

      <div className="max-w-7xl mx-auto px-4">

        <div className="h-16 flex items-center justify-between">

          <Link to="/">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-10 object-contain"
              />
            ) : (
              <h1 className="text-xl font-black text-[#4A1F08]">
                Hora Boa
              </h1>
            )}
          </Link>

          <nav className="hidden md:flex gap-8">

            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-bold text-[#4A1F08]"
            >
              <ShoppingBag size={18}/>
              Cardápio
            </Link>

            <Link
              to="/my-orders"
              className="flex items-center gap-2 text-sm font-bold text-zinc-600"
            >
              <ClipboardList size={18}/>
              Pedidos
            </Link>

            <Link
              to="/loyalty"
              className="flex items-center gap-2 text-sm font-bold text-zinc-600"
            >
              <Star size={18}/>
              Fidelidade
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm font-bold text-zinc-600"
            >
              <User size={18}/>
              Perfil
            </Link>

          </nav>

        </div>

        <div className="pb-3 overflow-x-auto hide-scrollbar">

          <div className="flex gap-2 min-w-max">

            <button
              onClick={() => onSelectCategory('')}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-[#4A1F08] text-white'
                  : 'bg-white border'
              }`}
            >
              Todos
            </button>

            {categories.map(category => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-[#4A1F08] text-white'
                    : 'bg-white border'
                }`}
              >
                {category}
              </button>
            ))}

          </div>

        </div>

      </div>

    </header>
  )
}