'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  // Estado para alternar entre as abas 'login' e 'cadastro'
  const [modo, setModo] = useState('login')

  // Estados para capturar as entradas do formulário
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Simulação de envio dos dados
    if (modo === 'login') {
      setMensagem(`Bem-vindo de volta! Autenticando ${email}...`)
    } else {
      setMensagem(`Conta de ${nome} criada com sucesso para o e-mail ${email}!`)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
            ● Client Component + Forms
          </span>
          <h1 className="text-3xl font-bold text-white">
            {modo === 'login' ? 'Acessar Conta' : 'Criar Conta'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {modo === 'login' 
              ? 'Entre com suas credenciais para continuar' 
              : 'Preencha os dados abaixo para se cadastrar'}
          </p>
        </div>

        {/* Alternador de Abas (Tabs) */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => { setModo('login'); setMensagem(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              modo === 'login' 
                ? 'bg-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>

          <button
            onClick={() => { setModo('cadastro'); setMensagem(''); }}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              modo === 'cadastro' 
                ? 'bg-slate-800 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastro
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {modo === 'cadastro' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Paulo Jorge"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 mt-2"
          >
            {modo === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {/* Feedback visual ao enviar */}
        {mensagem && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center font-medium">
            {mensagem}
          </div>
        )}

        {/* Botão de retorno à Home */}
        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
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