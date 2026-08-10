import Link from 'next/link'

// Esta função assíncrona busca os dados direto no servidor durante a renderização!
async function getUsuarios() {
  // Usando uma API pública de testes (JSONPlaceholder)
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'no-store' // Garante dados sempre atualizados
  })
  
  if (!res.ok) {
    throw new Error('Falha ao buscar usuários')
  }

  return res.json()
}

export default async function UsuariosPage() {
  // O consumo da API acontece AQUI, de forma simples e direta:
  const usuarios = await getUsuarios()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-3">
            ● Server Component + Async Fetch
          </span>
          <h1 className="text-3xl font-bold text-white">Lista de Usuários (API)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Estes dados foram buscados no servidor via API antes da página ser entregue ao seu navegador!
          </p>
        </div>

        {/* Lista renderizada com os dados da API */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {usuarios.slice(0, 6).map((user) => (
            <div 
              key={user.id} 
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition"
            >
              <h3 className="font-semibold text-slate-100 text-sm">{user.name}</h3>
              <p className="text-xs text-indigo-400 mt-0.5">@{user.username}</p>
              <p className="text-xs text-slate-500 mt-2">✉️ {user.email}</p>
              <p className="text-xs text-slate-500">🏢 {user.company.name}</p>
            </div>
          ))}
        </div>

        <div className="text-center border-t border-slate-800/80 pt-4">
          <Link 
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            ← Voltar para a Página Inicial
          </Link>
        </div>

      </div>
    </main>
  )
}