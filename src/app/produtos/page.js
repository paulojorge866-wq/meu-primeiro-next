'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Função para buscar a lista de produtos da NOSSA API
  const carregarProdutos = async () => {
    const res = await fetch('/api/produtos')
    const dados = await res.json()
    setProdutos(dados)
  }

  // Executa assim que a tela abre
  useEffect(() => {
    carregarProdutos()
  }, [])

  // Função para enviar o novo produto para a NOSSA API via POST
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)

    await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, preco }),
    })

    setNome('')
    setPreco('')
    setCarregando(false)
    carregarProdutos() // Recarrega a lista para mostrar o novo item adicionado!
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-3">
            ● Full-Stack: Next.js API Route + Frontend
          </span>
          <h1 className="text-3xl font-bold text-white">Gerenciador de Produtos</h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre itens enviando dados diretamente para a sua API interna em <code className="text-amber-400">/api/produtos</code>.
          </p>
        </div>

        {/* Formulário para Cadastrar Produto */}
        <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nome do produto"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço (R$)"
            required
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full sm:w-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <button
            type="submit"
            disabled={carregando}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition duration-200 text-sm disabled:opacity-50"
          >
            {carregando ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>

        {/* Lista de Produtos Cadastrados */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-2">Produtos no Servidor:</h2>
          {produtos.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nenhum produto cadastrado.</p>
          ) : (
            produtos.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center"
              >
                <span className="font-medium text-slate-200 text-sm">{item.nome}</span>
                <span className="text-amber-400 font-bold text-sm">R$ {item.preco}</span>
              </div>
            ))
          )}
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