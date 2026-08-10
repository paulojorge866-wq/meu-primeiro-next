'use client' // <--- ESSENCIAL! Avisa o Next.js que este componente roda no navegador

import { useState } from 'react'

export default function Contador() {
  const [qtd, setQtd] = useState(0)

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center my-4">
      <p className="text-xs text-slate-400 mb-2 uppercase font-mono tracking-wider">
        ⚡ Client Component Interativo
      </p>

      <span className="text-4xl font-extrabold text-blue-400 block mb-4">
        {qtd}
      </span>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setQtd(prev => prev - 1)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition border border-slate-700"
        >
          - Reduzir
        </button>

        <button
          onClick={() => setQtd(prev => prev + 1)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          + Aumentar
        </button>
      </div>
    </div>
  )
}