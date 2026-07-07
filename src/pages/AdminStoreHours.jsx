import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

const weekdays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
]

export default function AdminStoreHours() {
  const [hours, setHours] = useState([])

  async function loadHours() {
    const { data } = await supabase
      .from('store_hours')
      .select('*')
      .order('weekday', { ascending: true })

    setHours(data || [])
  }

  async function saveDay(day) {
    const existing = hours.find(item => item.weekday === day.value)

    const payload = {
      weekday: day.value,
      open_time: existing?.open_time || '17:00',
      close_time: existing?.close_time || '23:00',
      is_closed: existing?.is_closed || false
    }

    if (existing?.id) {
      await supabase
        .from('store_hours')
        .update(payload)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('store_hours')
        .insert([payload])
    }

    loadHours()
  }

  async function updateDay(day, field, value) {
    const existing = hours.find(item => item.weekday === day.value)

    if (!existing) {
      await saveDay(day)
      return
    }

    await supabase
      .from('store_hours')
      .update({
        [field]: value
      })
      .eq('id', existing.id)

    loadHours()
  }

  useEffect(() => {
    loadHours()
  }, [])

  return (
    <AdminLayout>
      <div>

        <div className="mb-8">
          <h1 className="text-4xl font-title">
            HORÁRIOS
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Configure os dias e horários de funcionamento
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">

          {weekdays.map(day => {
            const current = hours.find(item => item.weekday === day.value)

            return (
              <div
                key={day.value}
                className="p-5 border-b last:border-b-0"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">

                  <div>
                    <p className="font-black text-lg">
                      {day.label}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {current?.is_closed
                        ? 'Fechado'
                        : `${current?.open_time?.slice(0, 5) || '17:00'} às ${current?.close_time?.slice(0, 5) || '23:00'}`
                      }
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 md:items-center">

                    {!current && (
                      <button
                        onClick={() => saveDay(day)}
                        className="bg-[#4A1F08] text-white px-4 py-3 rounded-xl font-bold"
                      >
                        Criar horário
                      </button>
                    )}

                    {current && (
                      <>
                        <label className="flex items-center gap-2 text-sm font-bold">
                          <input
                            type="checkbox"
                            checked={current.is_closed}
                            onChange={(e) =>
                              updateDay(day, 'is_closed', e.target.checked)
                            }
                          />
                          Fechado
                        </label>

                        <input
                          type="time"
                          value={current.open_time?.slice(0, 5) || '17:00'}
                          disabled={current.is_closed}
                          onChange={(e) =>
                            updateDay(day, 'open_time', e.target.value)
                          }
                          className="border border-zinc-200 rounded-xl p-3 disabled:bg-zinc-100"
                        />

                        <input
                          type="time"
                          value={current.close_time?.slice(0, 5) || '23:00'}
                          disabled={current.is_closed}
                          onChange={(e) =>
                            updateDay(day, 'close_time', e.target.value)
                          }
                          className="border border-zinc-200 rounded-xl p-3 disabled:bg-zinc-100"
                        />
                      </>
                    )}

                  </div>

                </div>
              </div>
            )
          })}

        </div>

      </div>
    </AdminLayout>
  )
}