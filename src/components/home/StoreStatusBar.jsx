import { useState } from 'react'

export default function StoreStatusBar({ storeStatus, storeHours }) {
  const [showHours, setShowHours] = useState(false)

  if (!storeStatus) return null

  return (
    <div className="mb-4">

      <button
        type="button"
        onClick={() => setShowHours(!showHours)}
        className={`
          w-full
          rounded-2xl
          px-4
          py-3
          text-sm
          font-bold
          border
          text-left
          ${
            storeStatus.isOpen
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }
        `}
      >
        {storeStatus.isOpen ? '🟢' : '🔴'} {storeStatus.message}

        <span className="block text-xs mt-1 opacity-80">
          Toque para ver os horários
        </span>
      </button>

      {showHours && (
        <div className="bg-white border border-zinc-200 rounded-2xl mt-2 p-4 space-y-2">
          {storeHours.map(item => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >
              <span className="font-bold">
                {item.dayName}
              </span>

              <span className="text-zinc-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}