import { useEffect, useState } from 'react'
import { Tag, Percent, DollarSign, Power } from 'lucide-react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminMarketing() {
  const [coupons, setCoupons] = useState([])

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')

  async function loadCoupons() {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('id', { ascending: false })

    setCoupons(data || [])
  }

  async function createCoupon() {
    if (!code.trim()) return
    if (!discountValue) return

    await supabase
      .from('coupons')
      .insert([
        {
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: discountValue,
          active: true
        }
      ])

    setCode('')
    setDiscountType('percentage')
    setDiscountValue('')

    loadCoupons()
  }

  async function toggleCoupon(coupon) {
    await supabase
      .from('coupons')
      .update({ active: !coupon.active })
      .eq('id', coupon.id)

    loadCoupons()
  }

  async function deleteCoupon(id) {
    const confirmDelete = window.confirm('Deseja excluir este cupom?')

    if (!confirmDelete) return

    await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    loadCoupons()
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  return (
    <AdminLayout>

      <div>

        <div className="mb-8">
          <h1 className="text-4xl font-black">
            MARKETING
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Crie e gerencie cupons de desconto
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Cupons
            </p>

            <p className="text-3xl font-black mt-2">
              {coupons.length}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Ativos
            </p>

            <p className="text-3xl font-black mt-2 text-green-600">
              {coupons.filter(coupon => coupon.active).length}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Inativos
            </p>

            <p className="text-3xl font-black mt-2 text-red-500">
              {coupons.filter(coupon => !coupon.active).length}
            </p>
          </div>

        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm mb-8">

          <h2 className="text-xl font-black mb-4">
            Criar Cupom
          </h2>

          <div className="grid gap-3 md:grid-cols-4">

            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Código. Ex: PRIMEIRA10"
              className="border rounded-xl p-3"
            />

            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="border rounded-xl p-3"
            >
              <option value="percentage">Porcentagem</option>
              <option value="fixed">Valor fixo</option>
            </select>

            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="Valor"
              className="border rounded-xl p-3"
            />

            <button
              onClick={createCoupon}
              className="
                bg-amber-900
                text-white
                rounded-xl
                font-bold
                transition-all
                hover:scale-105
                active:scale-95
              "
            >
              Criar
            </button>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {coupons.map(coupon => (

            <div
              key={coupon.id}
              className="bg-white border rounded-2xl p-5 shadow-sm"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="bg-amber-100 text-amber-800 p-2 rounded-xl">
                      <Tag className="w-5 h-5" />
                    </div>

                    <h2 className="text-2xl font-black">
                      {coupon.code}
                    </h2>

                  </div>

                  <div className="mt-4 flex items-center gap-2 text-zinc-600">

                    {coupon.discount_type === 'percentage' ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}

                    <span className="font-bold">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `R$ ${Number(coupon.discount_value).toFixed(2)} OFF`
                      }
                    </span>

                  </div>

                </div>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                    border
                    ${coupon.active
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-red-50 text-red-600 border-red-300'
                    }
                  `}
                >
                  {coupon.active ? 'Ativo' : 'Inativo'}
                </span>

              </div>

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() => toggleCoupon(coupon)}
                  className="
                    flex-1
                    border
                    rounded-xl
                    py-3
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-zinc-100
                  "
                >
                  <Power className="w-4 h-4" />
                  {coupon.active ? 'Desativar' : 'Ativar'}
                </button>

                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="
                    flex-1
                    border
                    border-red-200
                    text-red-600
                    rounded-xl
                    py-3
                    font-bold
                    hover:bg-red-50
                  "
                >
                  Excluir
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </AdminLayout>
  )
}