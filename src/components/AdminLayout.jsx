import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, Users, Megaphone, BarChart3, DollarSign, QrCode, Star, Store, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { supabase } from '../lib/supabase'

const menuItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Produtos',
    path: '/admin/products',
    icon: Package
  },
  {
    label: 'Pedidos',
    path: '/admin/orders',
    icon: ClipboardList
  },
  {
    label: 'Clientes',
    path: '/admin/customers',
    icon: Users
  },
  {
    label: 'Marketing',
    path: '/admin/marketing',
    icon: Megaphone
  },
  {
    label: 'Relatórios',
    path: '/admin/reports',
    icon: BarChart3
  },
  {
    label: 'Gastos',
    path: '/admin/expenses',
    icon: DollarSign
  },
  {
    label: 'PIX',
    path: '/admin/pix',
    icon: QrCode
  },
  {
    label: 'Fidelidade',
    path: '/admin/loyalty',
    icon: Star
  },
  {
    label: 'Loja',
    path: '/admin/store',
    icon: Store
  }
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  function playNotificationSound() {
  const enabled = localStorage.getItem('admin_sound_enabled') === 'true'

  if (!enabled) return

  if (navigator.vibrate) {
    navigator.vibrate([700, 200, 700])
  }

  const audio = new Audio('/notification.mp3')
  audio.volume = 1

  audio.play().catch(() => {})
}

function showBrowserNotification(order) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  new Notification('🔔 Novo pedido recebido!', {
    body: `${order.customer_name || 'Cliente'} · R$ ${Number(order.total_amount || 0).toFixed(2)}`,
    icon: '/vite.svg'
  })
}

useEffect(() => {
  const channel = supabase
    .channel('admin-global-orders')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        const order = payload.new

        toast.success('🔔 Novo pedido recebido!')
        playNotificationSound()
        showBrowserNotification(order)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin-login')
  }

  function SidebarContent() {
    return (
      <div className="h-full flex flex-col bg-[#1b0f0b] text-zinc-200">

        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-title text-[#4A1F08]-700 tracking-wide">
            HORA BOA
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Painel Admin
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all
                  ${active
                    ? 'bg-[#4A1F08]/70 text-white'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              text-sm
              text-zinc-300
              hover:bg-white/10
              hover:text-white
              transition-all
            "
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf4ee]">

      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-40
          bg-[#1b0f0b]
          text-white
          p-3
          rounded-xl
          shadow-lg
        "
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            <SidebarContent />

            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

      <main className="md:ml-64 p-6 md:p-10">
        {children}
      </main>

    </div>
  )
}