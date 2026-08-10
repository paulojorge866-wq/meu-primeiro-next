import Link from 'next/link'
import Contador from '@/components/Contador'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        
        <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20 inline-block mb-4">
          ● Next.js App Router + Tailwind v4
        </span>

        <h1 className="text-2xl font-bold text-white mb-2">
          Meu Primeiro Projeto Next.js! 🚀
        </h1>

        <p className="text-slate-400 text-sm mb-2 leading-relaxed">
          Esta página pai é renderizada no **servidor**, mas o bloco abaixo é um **Client Component**:
        </p>

        {/* Componente interativo do Contador */}
        <Contador />

        {/* Navegação entre rotas */}
        <div className="mt-6 flex flex-col gap-2">
          <Link 
            href="/usuarios"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm"
          >
            Consumo de API (Server Component) →
          </Link>

          <Link 
            href="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm"
          >
            Acessar Tela de Login / Cadastro
          </Link>

          <Link 
            href="/sobre"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm border border-slate-700"
          >
            Ir para Página Sobre
          </Link>
        </div>

      </div>
    </main>
  )
}