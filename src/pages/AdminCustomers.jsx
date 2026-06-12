import { useEffect, useState } from 'react'
import { User, ShoppingBag, DollarSign, Phone, MapPin } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminCustomers() {
  const [orders, setOrders] = useState([])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    setOrders(data || [])
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const customersMap = {}

  orders.forEach(order => {
    const key = order.phone || order.customer_name || `cliente-${order.id}`

    if (!customersMap[key]) {
      customersMap[key] = {
        name: order.customer_name || 'Cliente sem nome',
        phone: order.phone || 'Sem telefone',
        address: order.address || 'Sem endereço',
        orders_count: 0,
        total_spent: 0,
        last_order_id: order.id
      }
    }

    customersMap[key].orders_count += 1
    customersMap[key].total_spent += Number(order.total_amount || 0)

    if (order.id > customersMap[key].last_order_id) {
      customersMap[key].last_order_id = order.id
    }
  })

  const customers = Object.values(customersMap)

  return (
    <AdminLayout>

      <div>

        <div className="mb-8">
          <h1 className="text-4xl font-black">
            CLIENTES
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Clientes gerados automaticamente a partir dos pedidos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">

          <div className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-sm text-zinc-500">
              Clientes
            </p>

            <p className="text-3xl font-black mt-2">
              {customers.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-sm text-zinc-500">
              Pedidos
            </p>

            <p className="text-3xl font-black mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-sm text-zinc-500">
              Receita total
            </p>

            <p className="text-3xl font-black mt-2 text-green-600">
              R$ {orders.reduce((acc, order) => acc + Number(order.total_amount || 0), 0).toFixed(2)}
            </p>
          </div>

        </div>

        {customers.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
            <User className="w-12 h-12 mx-auto text-zinc-300 mb-3" />

            <p className="font-bold text-lg">
              Nenhum cliente ainda
            </p>

            <p className="text-zinc-500 text-sm mt-1">
              Quando os pedidos chegarem, os clientes aparecerão aqui.
            </p>
          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2">

            {customers.map(customer => (

              <div
                key={customer.phone}
                className="bg-white rounded-2xl p-5 border shadow-sm"
              >

                <div className="flex items-start gap-4">

                  <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl">
                    <User className="w-6 h-6" />
                  </div>

                  <div className="flex-1">

                    <h2 className="text-xl font-black">
                      {customer.name}
                    </h2>

                    <div className="mt-3 space-y-2 text-sm text-zinc-500">

                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {customer.address}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <div className="bg-zinc-100 rounded-2xl p-4">
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      Pedidos
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {customer.orders_count}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-4">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Gasto total
                    </p>

                    <p className="text-2xl font-black mt-1 text-green-600">
                      R$ {customer.total_spent.toFixed(2)}
                    </p>
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </AdminLayout>
  )
}