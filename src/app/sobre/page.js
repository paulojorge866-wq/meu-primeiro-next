import Link from 'next/link'

export default function Sobre() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        
        <span className="bg-purple-500/10 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-4">
          ● Rota Secundária: /sobre
        </span>

        <h1 className="text-2xl font-bold text-white mb-2">
          Página Sobre 👨‍💻
        </h1>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Você acabou de navegar para uma nova rota sem precisar de NENHUMA biblioteca de rotas externa. Apenas criando a pasta <code className="text-purple-400">app/sobre</code>!
        </p>

        {/* Componente Link nativo do Next.js para navegação ultra rápida */}
        <Link 
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm"
        >
          ← Voltar para a Home
        </Link>

      </div>
    </main>
  )
}