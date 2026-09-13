'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [autenticado, setAutenticado] = useState(false)
  const [usuarioInput, setUsuarioInput] = useState('')
  const [senhaInput, setSenhaInput] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  const [abaAtiva, setAbaAtiva] = useState('cardapio')
  const [produtos, setProdutos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Formulário Produtos
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('Lanches')
  const [imagem, setImagem] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Filtros e Carrinho
  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [mesa, setMesa] = useState('1')

  // Estado de Mesas e Fechamento
  const [mesaSelecionada, setMesaSelecionada] = useState(null)
  const [formaPagamento, setFormaPagamento] = useState('Pix')
  const [produtoExtraId, setProdutoExtraId] = useState('')
  const [qtdExtra, setQtdExtra] = useState(1)
  const [obsExtra, setObsExtra] = useState('')

  // Calculadora de Troco e Divisão de Pessoas
  const [valorRecebido, setValorRecebido] = useState('')
  const [qtdPessoasDivisao, setQtdPessoasDivisao] = useState(1)

  // Filtro do Relatório por Período
  const [filtroPeriodoRelatorio, setFiltroPeriodoRelatorio] = useState('hoje')
  const [vendaExpandida, setVendaExpandida] = useState(null)

  // NOVO: Estado para guardar os dados do Cupom do Cliente no momento da impressão
  const [dadosCupomCliente, setDadosCupomCliente] = useState(null)

  function handleLogin(e) {
    e.preventDefault()
    if (usuarioInput === 'admin' && senhaInput === '1234') {
      setAutenticado(true)
      setErroLogin('')
    } else {
      setErroLogin('Usuário/senha incorretos!')
    }
  }

  function handleLogout() {
    setAutenticado(false)
    setUsuarioInput('')
    setSenhaInput('')
  }

  async function buscarProdutos() {
    try {
      const resposta = await fetch('/api/produtos')
      if (!resposta.ok) return setProdutos([])
      const dados = await resposta.json()
      if (Array.isArray(dados)) {
        setProdutos(dados)
        if (dados.length > 0) setProdutoExtraId(dados[0]._id)
      }
    } catch (erro) {
      setProdutos([])
    } finally {
      setCarregando(false)
    }
  }

  async function buscarPedidos() {
    try {
      const resposta = await fetch('/api/pedidos')
      if (!resposta.ok) return setPedidos([])
      const dados = await resposta.json()
      if (Array.isArray(dados)) setPedidos(dados)
    } catch (erro) {
      setPedidos([])
    }
  }

  useEffect(() => {
    if (autenticado) {
      buscarProdutos()
      buscarPedidos()

      const interval = setInterval(() => {
        buscarPedidos()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [autenticado])

  // CARRINHO & OBSERVAÇÕES
  function adicionarAoCarrinho(produto) {
    setCarrinho((prev) => {
      const ex = prev.find((i) => i._id === produto._id)
      if (ex) return prev.map((i) => (i._id === produto._id ? { ...i, quantidade: i.quantidade + 1 } : i))
      return [...prev, { ...produto, quantidade: 1, observacao: '' }]
    })
  }

  function atualizarObsCarrinho(id, obsText) {
    setCarrinho((prev) => prev.map((i) => (i._id === id ? { ...i, observacao: obsText } : i)))
  }

  function alterarQuantidade(id, delta) {
    setCarrinho((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantidade: i.quantidade + delta } : i)).filter((i) => i.quantidade > 0)
    )
  }

  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

  async function finalizarPedido() {
    if (carrinho.length === 0) return
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa: Number(mesa),
          itens: carrinho.map((i) => ({
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
            observacao: i.observacao || '',
          })),
          total: valorTotalCarrinho,
          pagamentoStatus: 'Pendente',
        }),
      })
      if (res.ok) {
        alert(`Pedido da Mesa ${mesa} enviado para a cozinha!`)
        setCarrinho([])
        await buscarPedidos()
      }
    } catch (erro) {
      console.error(erro)
    }
  }

  async function adicionarItemDiretoNaMesa() {
    if (!mesaSelecionada) return
    const prod = produtos.find((p) => p._id === produtoExtraId) || produtos[0]
    if (!prod) return
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa: Number(mesaSelecionada),
          itens: [
            {
              nome: prod.nome,
              preco: Number(prod.preco),
              quantidade: Number(qtdExtra),
              observacao: obsExtra,
            },
          ],
          total: Number(prod.preco) * Number(qtdExtra),
          pagamentoStatus: 'Pendente',
        }),
      })
      if (res.ok) {
        await buscarPedidos()
        setQtdExtra(1)
        setObsExtra('')
      }
    } catch (erro) {
      console.error(erro)
    }
  }

  async function cancelarPedido(idPedido) {
    if (!confirm('Deseja realmente cancelar/estornar este pedido da mesa?')) return
    try {
      const res = await fetch(`/api/pedidos?id=${idPedido}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Pedido cancelado e estornado da mesa!')
        await buscarPedidos()
      }
    } catch (erro) {
      console.error(erro)
    }
  }

  async function atualizarStatusPedido(id, novoStatus) {
    try {
      const res = await fetch(`/api/pedidos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (res.ok) await buscarPedidos()
    } catch (erro) {
      console.error(erro)
    }
  }

  async function fecharContaMesa(numMesa, totalMesa) {
    const abertos = pedidos.filter((p) => Number(p.mesa) === Number(numMesa) && p.pagamentoStatus !== 'Pago')
    if (abertos.length === 0) return

    const trocoCalculado = formaPagamento === 'Dinheiro' && Number(valorRecebido) >= totalMesa
      ? Number(valorRecebido) - totalMesa
      : 0

    if (!confirm(`Confirmar pagamento (${formaPagamento}) e fechar Mesa ${numMesa}?`)) return

    const codigoFechamento = Date.now().toString()

    try {
      for (const p of abertos) {
        await fetch(`/api/pedidos?id=${p._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Concluído',
            pagamentoStatus: 'Pago',
            formaPagamento,
            codigoFechamento,
            valorPago: formaPagamento === 'Dinheiro' ? Number(valorRecebido) : totalMesa,
            troco: trocoCalculado,
          }),
        })
      }
      alert(`Mesa ${numMesa} fechada e liberada com sucesso!`)
      setMesaSelecionada(null)
      setValorRecebido('')
      setQtdPessoasDivisao(1)
      await buscarPedidos()
    } catch (erro) {
      console.error(erro)
    }
  }

  // PREPARAR E IMPRIMIR COMPROVANTE DO CLIENTE
  function imprimirComprovanteCliente(dadosMesaOuVenda) {
    let itensCupom = []
    let numMesa = ''
    let totalCupom = 0
    let formaPag = 'Pix'
    let dataHoraStr = new Date().toISOString()
    let valPago = 0
    let trocoVal = 0

    // Se for clicado na aba de Mesas (Mesa em aberto)
    if (typeof dadosMesaOuVenda === 'number' || typeof dadosMesaOuVenda === 'string') {
      numMesa = dadosMesaOuVenda
      const pedidosMesa = pedidos.filter((p) => Number(p.mesa) === Number(numMesa) && p.pagamentoStatus !== 'Pago')
      pedidosMesa.forEach((p) => {
        itensCupom.push(...p.itens)
      })
      totalCupom = pedidosMesa.reduce((acc, p) => acc + Number(p.total), 0)
      formaPag = formaPagamento
      valPago = Number(valorRecebido) || totalCupom
      trocoVal = valPago > totalCupom ? valPago - totalCupom : 0
    } else {
      // Se for clicado na aba de Relatório (Mesa já paga)
      numMesa = dadosMesaOuVenda.mesa
      itensCupom = dadosMesaOuVenda.itens
      totalCupom = dadosMesaOuVenda.total
      formaPag = dadosMesaOuVenda.formaPagamento
      dataHoraStr = dadosMesaOuVenda.data
      valPago = dadosMesaOuVenda.valorPago || totalCupom
      trocoVal = dadosMesaOuVenda.troco || 0
    }

    // Consolida itens repetidos para o cupom
    const itensAgrupados = Object.values(
      itensCupom.reduce((acc, i) => {
        const chave = `${i.nome}_${i.observacao || ''}`
        if (acc[chave]) {
          acc[chave].quantidade += i.quantidade
        } else {
          acc[chave] = { ...i }
        }
        return acc
      }, {})
    )

    setDadosCupomCliente({
      mesa: numMesa,
      itens: itensAgrupados,
      total: totalCupom,
      formaPagamento: formaPag,
      dataHora: dataHoraStr,
      valorPago: valPago,
      troco: trocoVal,
    })

    // Dispara a impressão após atualizar o estado
    setTimeout(() => {
      window.print()
    }, 100)
  }

  function iniciarEdicao(produto) {
    setEditandoId(produto._id)
    setNome(produto.nome)
    setPreco(produto.preco)
    setDescricao(produto.descricao || '')
    setCategoria(produto.categoria || 'Lanches')
    setImagem(produto.imagem || '')
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setPreco('')
    setDescricao('')
    setCategoria('Lanches')
    setImagem('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome || !preco) return
    setEnviando(true)
    try {
      const url = editandoId ? `/api/produtos?id=${editandoId}` : '/api/produtos'
      const res = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco, descricao, categoria, imagem }),
      })
      if (res.ok) {
        cancelarEdicao()
        await buscarProdutos()
      }
    } catch (erro) {
      console.error(erro)
    } finally {
      setEnviando(false)
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir item?')) return
    try {
      const res = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' })
      if (res.ok) await buscarProdutos()
    } catch (erro) {
      console.error(erro)
    }
  }

  const produtosFiltrados = produtos.filter((p) => {
    const bateuCat = filtroCategoria === 'Todos' || (p.categoria || 'Lanches') === filtroCategoria
    const bateuNome = p.nome.toLowerCase().includes(busca.toLowerCase())
    return bateuCat && bateuNome
  })

  const listaMesas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,]

  const pedidosPagos = pedidos.filter((p) => p.pagamentoStatus === 'Pago')

  const vendasAgrupadas = {}
  pedidosPagos.forEach((p) => {
    const key = p.codigoFechamento || p._id
    if (!vendasAgrupadas[key]) {
      vendasAgrupadas[key] = {
        id: key,
        mesa: p.mesa,
        itens: [...p.itens],
        total: Number(p.total),
        formaPagamento: p.formaPagamento || 'Pix',
        data: p.criadoEm,
        valorPago: p.valorPago || p.total,
        troco: p.troco || 0,
      }
    } else {
      vendasAgrupadas[key].itens.push(...p.itens)
      vendasAgrupadas[key].total += Number(p.total)
    }
  })

  const relatorioVendasBruto = Object.values(vendasAgrupadas).sort((a, b) => new Date(b.data) - new Date(a.data))

  const relatorioVendas = relatorioVendasBruto.filter((venda) => {
    if (!venda.data) return true
    const dataVenda = new Date(venda.data)
    const agora = new Date()

    if (filtroPeriodoRelatorio === 'hoje') {
      return dataVenda.toDateString() === agora.toDateString()
    }
    if (filtroPeriodoRelatorio === '7dias') {
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(agora.getDate() - 7)
      return dataVenda >= seteDiasAtras
    }
    if (filtroPeriodoRelatorio === 'mes') {
      return dataVenda.getMonth() === agora.getMonth() && dataVenda.getFullYear() === agora.getFullYear()
    }
    return true
  })

  const faturamentoTotal = relatorioVendas.reduce((acc, v) => acc + v.total, 0)

  function formatarDataHora(dataISO) {
    if (!dataISO) return 'Data N/I'
    const d = new Date(dataISO)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6">
        <div className="bg-slate-800 border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-amber-500 mb-1">🍔 DevLanches</h1>
            <p className="text-xs text-slate-400">Acesso Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usuário</label>
              <input
                type="text"
                value={usuarioInput}
                onChange={(e) => setUsuarioInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            {erroLogin && <p className="text-xs text-red-400 text-center font-semibold">{erroLogin}</p>}
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded text-sm transition-all shadow-lg">
              Entrar
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-3 sm:p-6">
      
      {/* ==================================================================== */}
      {/* ESTILOS DE IMPRESSÃO EXCLUSIVOS PARA O CUPOM DO CLIENTE (PRINT ONLY)  */}
      {/* ==================================================================== */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .only-print {
            display: block !important;
          }
        }
        @media screen {
          .only-print {
            display: none !important;
          }
        }
      `}</style>

      {/* CUPOM TÉRMICO / COMPROVANTE DO CLIENTE (Aparece apenas ao imprimir) */}
      {dadosCupomCliente && (
        <div className="only-print max-w-xs mx-auto text-black font-mono text-xs p-2">
          <div className="text-center border-b border-black pb-2 mb-2">
            <h1 className="text-base font-bold">🍔 DevLanches</h1>
            <p className="text-[10px]">Comprovante de Consumo</p>
            <p className="text-[10px] mt-1">Data/Hora: {formatarDataHora(dadosCupomCliente.dataHora)}</p>
            <p className="text-sm font-bold mt-1">MESA {dadosCupomCliente.mesa}</p>
          </div>

          <table className="w-full text-left mb-2 border-b border-black pb-2">
            <thead>
              <tr className="border-b border-black">
                <th className="pb-1">Item</th>
                <th className="pb-1 text-center">Qtd</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {dadosCupomCliente.itens.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">
                    {item.nome}
                    {item.observacao && <span className="block text-[9px] font-normal">({item.observacao})</span>}
                  </td>
                  <td className="py-1 text-center">{item.quantidade}x</td>
                  <td className="py-1 text-right">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-right font-bold border-b border-black pb-2 mb-2">
            <p className="text-sm">TOTAL: R$ {dadosCupomCliente.total.toFixed(2)}</p>
            <p className="text-[10px] font-normal">Forma Pagto: {dadosCupomCliente.formaPagamento}</p>
            {dadosCupomCliente.formaPagamento === 'Dinheiro' && (
              <>
                <p className="text-[10px] font-normal">Valor Recebido: R$ {dadosCupomCliente.valorPago.toFixed(2)}</p>
                <p className="text-[10px] font-normal">Troco: R$ {dadosCupomCliente.troco.toFixed(2)}</p>
              </>
            )}
          </div>

          <div className="text-center text-[10px] mt-3">
            <p>Obrigado pela preferência!</p>
            <p>Volte Sempre! 😊</p>
          </div>
        </div>
      )}

      {/* ÁREA VISÍVEL DO SISTEMA (ESCONDIDA DURANTE A IMPRESSÃO) */}
      <div className="no-print">
        <header className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700 pb-4 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-500">🍔 DevLanches</h1>
            <p className="text-xs text-slate-400">Atendente: <strong className="text-amber-400">admin</strong></p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="grid grid-cols-2 sm:flex bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1 w-full sm:w-auto">
              <button onClick={() => setAbaAtiva('cardapio')} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-center ${abaAtiva === 'cardapio' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}>📋 Cardápio</button>
              <button onClick={() => setAbaAtiva('mesas')} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-center ${abaAtiva === 'mesas' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}>🪑 Mesas</button>
              <button onClick={() => setAbaAtiva('cozinha')} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${abaAtiva === 'cozinha' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}>
                👨‍🍳 Cozinha
                {pedidos.filter((p) => p.status !== 'Concluído').length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">{pedidos.filter((p) => p.status !== 'Concluído').length}</span>
                )}
              </button>
              <button onClick={() => setAbaAtiva('relatorio')} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-center ${abaAtiva === 'relatorio' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}>📊 Relatório</button>
            </div>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold transition-all w-full sm:w-auto">🚪 Sair</button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {abaAtiva === 'cardapio' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              <section className="bg-slate-800 border border-slate-700 p-4 sm:p-5 rounded-xl shadow-lg lg:sticky lg:top-6 z-10">
                <h2 className="text-lg font-bold mb-4 text-amber-400">{editandoId ? '✏️ Editar Item' : '➕ Cadastrar'}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none" />
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none">
                    <option value="Lanches">🍔 Lanches</option><option value="Bebidas">🥤 Bebidas</option><option value="Sobremesas">🍰 Sobremesas</option>
                  </select>
                  <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Preço" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none" />
                  <input type="text" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="URL Imagem" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none" />
                  <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" rows="2" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"></textarea>
                  <button type="submit" disabled={enviando} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded text-sm disabled:opacity-50">{enviando ? 'Salvando...' : 'Salvar'}</button>
                  {editandoId && <button type="button" onClick={cancelarEdicao} className="w-full bg-slate-700 text-slate-300 font-semibold py-1 rounded text-xs mt-1">Cancelar</button>}
                </form>
              </section>

              <section className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-700 pb-2 gap-2">
                  <h2 className="text-xl font-bold">Cardápio</h2>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {['Todos', 'Lanches', 'Bebidas', 'Sobremesas'].map((c) => (
                      <button key={c} onClick={() => setFiltroCategoria(c)} className={`px-2.5 py-1 rounded ${filtroCategoria === c ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="w-full mb-4 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500" />
                {carregando ? <p>Carregando...</p> : (
                  <div className="grid gap-3">
                    {produtosFiltrados.map((p) => (
                      <div key={p._id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                        {p.imagem ? <img src={p.imagem} alt={p.nome} className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg flex-shrink-0" /> : <div className="w-full sm:w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center text-2xl">🍔</div>}
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><h3 className="text-lg font-bold text-amber-400">{p.nome}</h3></div>
                          <p className="text-slate-300 text-xs">{p.descricao}</p>
                        </div>
                        <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto items-center gap-2 border-t sm:border-0 border-slate-700/60 pt-2 sm:pt-0">
                          <span className="text-amber-400 text-sm font-bold">R$ {Number(p.preco).toFixed(2)}</span>
                          <div className="flex gap-1">
                            <button onClick={() => adicionarAoCarrinho(p)} className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1.5 rounded text-xs">+ Pedir</button>
                            <button onClick={() => iniciarEdicao(p)} className="p-1.5 text-xs">✏️</button>
                            <button onClick={() => handleExcluir(p._id)} className="p-1.5 text-xs">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-slate-800 border border-slate-700 p-4 sm:p-5 rounded-xl shadow-lg lg:sticky lg:top-6 z-10">
                <h2 className="text-lg font-bold mb-4 text-amber-400 flex justify-between">
                  🛒 Pedido
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{carrinho.reduce((a, i) => a + i.quantidade, 0)}</span>
                </h2>
                {carrinho.length === 0 ? <p className="text-xs text-slate-400 text-center">Vazio</p> : (
                  <div className="space-y-3">
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {carrinho.map((item) => (
                        <div key={item._id} className="bg-slate-900 p-2 rounded border border-slate-700 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <div><p className="font-bold text-white">{item.nome}</p><p className="text-slate-400">R$ {(item.preco * item.quantidade).toFixed(2)}</p></div>
                            <div className="flex items-center gap-1.5 bg-slate-800 px-1.5 py-1 rounded">
                              <button onClick={() => alterarQuantidade(item._id, -1)} className="text-amber-400 font-bold px-1">-</button>
                              <span>{item.quantidade}</span>
                              <button onClick={() => alterarQuantidade(item._id, 1)} className="text-amber-400 font-bold px-1">+</button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={item.observacao || ''}
                            onChange={(e) => atualizarObsCarrinho(item._id, e.target.value)}
                            placeholder="✏️ Obs: ex: Sem salada, Maionese à parte..."
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-amber-300 placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 pt-3">
                      <select value={mesa} onChange={(e) => setMesa(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mb-3 focus:outline-none focus:border-amber-500">
                        {listaMesas.map((n) => <option key={n} value={n}>Mesa {n}</option>)}
                      </select>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold">Total:</span><span className="text-lg font-bold text-amber-400">R$ {valorTotalCarrinho.toFixed(2)}</span>
                      </div>
                      <button onClick={finalizarPedido} className="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-bold py-2 rounded text-sm transition-all">Enviar para Cozinha</button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {abaAtiva === 'mesas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-amber-400 border-b border-slate-700 pb-3">🪑 Gestão do Salão</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {listaMesas.map((numMesa) => {
                    const pedidosMesa = pedidos.filter((p) => Number(p.mesa) === numMesa && p.pagamentoStatus !== 'Pago')
                    const ocupada = pedidosMesa.length > 0
                    const totalMesa = pedidosMesa.reduce((acc, p) => acc + Number(p.total), 0)
                    return (
                      <button key={numMesa} onClick={() => setMesaSelecionada(numMesa)} className={`p-4 rounded-xl border text-center transition-all ${mesaSelecionada === numMesa ? 'ring-2 ring-amber-400' : ''} ${ocupada ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                        <p className="text-xs font-bold uppercase mb-1">Mesa {numMesa}</p>
                        <p className="text-base sm:text-lg font-extrabold">{ocupada ? `R$ ${totalMesa.toFixed(2)}` : 'LIVRE'}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl shadow-lg lg:sticky lg:top-6 z-10">
                {!mesaSelecionada ? (
                  <div className="text-center py-12 text-slate-400"><p className="text-3xl mb-2">👈</p><p className="text-sm font-semibold">Selecione uma mesa</p></div>
                ) : (
                  (() => {
                    const pedidosMesa = pedidos.filter((p) => Number(p.mesa) === Number(mesaSelecionada) && p.pagamentoStatus !== 'Pago')
                    const totalMesa = pedidosMesa.reduce((acc, p) => acc + Number(p.total), 0)

                    const valorRecebidoNum = Number(valorRecebido) || 0
                    const trocoCalculado = valorRecebidoNum > totalMesa ? valorRecebidoNum - totalMesa : 0
                    const valorPorPessoa = totalMesa / (Number(qtdPessoasDivisao) || 1)

                    return (
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                          <h3 className="text-xl font-bold text-amber-400">Conta Mesa {mesaSelecionada}</h3>
                          {pedidosMesa.length > 0 && (
                            <button
                              onClick={() => imprimirComprovanteCliente(mesaSelecionada)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-2.5 py-1 rounded transition-all shadow"
                            >
                              🖨️ Cupom Cliente
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl mb-4 space-y-2">
                          <label className="block text-xs font-bold text-amber-400">➕ Lançamento Extra:</label>
                          <div className="flex gap-2">
                            <select value={produtoExtraId} onChange={(e) => setProdutoExtraId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none">
                              {produtos.map((p) => <option key={p._id} value={p._id}>{p.nome} - R$ {Number(p.preco).toFixed(2)}</option>)}
                            </select>
                            <input type="number" min="1" value={qtdExtra} onChange={(e) => setQtdExtra(e.target.value)} className="w-12 bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white text-center focus:outline-none" />
                          </div>
                          <input
                            type="text"
                            value={obsExtra}
                            onChange={(e) => setObsExtra(e.target.value)}
                            placeholder="✏️ Obs extra (opcional)..."
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-amber-300 focus:outline-none"
                          />
                          <button onClick={adicionarItemDiretoNaMesa} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 rounded text-xs transition-all">+ Lançar na Mesa</button>
                        </div>

                        {pedidosMesa.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center">Sem consumo</p>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {pedidosMesa.map((p) => (
                                <div key={p._id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs">
                                  <div className="flex justify-between font-bold border-b border-slate-800 pb-1 mb-1">
                                    <span>Pedido #{p._id.slice(-4)}</span>
                                    <div className="flex items-center gap-2">
                                      <span className={p.status === 'Concluído' ? 'text-green-400' : 'text-amber-400'}>
                                        {p.status === 'Concluído' ? '✓ Pronto' : p.status}
                                      </span>
                                      <button
                                        onClick={() => cancelarPedido(p._id)}
                                        className="text-red-400 hover:text-red-300 text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20"
                                        title="Estornar/Cancelar Pedido"
                                      >
                                        ❌ Estornar
                                      </button>
                                    </div>
                                  </div>
                                  {p.itens.map((i, idx) => (
                                    <div key={idx} className="mb-1">
                                      <div className="flex justify-between text-slate-300">
                                        <span>{i.quantidade}x {i.nome}</span><span>R$ {(i.preco * i.quantidade).toFixed(2)}</span>
                                      </div>
                                      {i.observacao && (
                                        <p className="text-[10px] text-amber-400 italic">Obs: {i.observacao}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>

                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">👥 Dividir conta por pessoas:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={qtdPessoasDivisao}
                                  onChange={(e) => setQtdPessoasDivisao(e.target.value)}
                                  className="w-14 bg-slate-800 border border-slate-700 rounded p-1 text-center text-white focus:outline-none"
                                />
                              </div>
                              {Number(qtdPessoasDivisao) > 1 && (
                                <div className="flex justify-between text-amber-400 font-bold border-t border-slate-800 pt-1">
                                  <span>Valor por pessoa:</span>
                                  <span>R$ {valorPorPessoa.toFixed(2)}</span>
                                </div>
                              )}

                              <div>
                                <label className="block text-slate-400 mb-1">💳 Forma de Pagamento:</label>
                                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none">
                                  <option value="Pix">📱 Pix</option>
                                  <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                                  <option value="Cartão de Débito">💳 Cartão de Débito</option>
                                  <option value="Dinheiro">💵 Dinheiro</option>
                                </select>
                              </div>

                              {formaPagamento === 'Dinheiro' && (
                                <div className="space-y-1.5 border-t border-slate-800 pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">💵 Valor Recebido (R$):</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={valorRecebido}
                                      onChange={(e) => setValorRecebido(e.target.value)}
                                      placeholder="0.00"
                                      className="w-20 bg-slate-800 border border-slate-700 rounded p-1 text-right text-green-400 font-bold focus:outline-none"
                                    />
                                  </div>
                                  {valorRecebidoNum > 0 && (
                                    <div className="flex justify-between font-bold text-sm">
                                      <span className="text-slate-300">Troco a devolver:</span>
                                      <span className={trocoCalculado >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        R$ {trocoCalculado.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="border-t border-slate-700 pt-2 space-y-2">
                              <div className="flex justify-between items-center"><span className="text-sm font-bold">Total da Mesa:</span><span className="text-2xl font-extrabold text-green-400">R$ {totalMesa.toFixed(2)}</span></div>
                              <button onClick={() => fecharContaMesa(mesaSelecionada, totalMesa)} className="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-bold py-2.5 rounded text-sm transition-all">💵 Fechar e Liberar Mesa</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )}

          {abaAtiva === 'cozinha' && (
            <section className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-amber-400 flex justify-between items-center border-b border-slate-700 pb-3">
                <span>👨‍🍳 Pedidos na Cozinha</span>
                <button onClick={buscarPedidos} className="text-xs bg-slate-700 px-3 py-1.5 rounded hover:bg-slate-600 transition-all">🔄 Atualizar</button>
              </h2>
              {pedidos.length === 0 ? <p className="text-center text-slate-400 py-10">Nenhum pedido realizado.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pedidos.map((p) => {
                    const estaConcluido = p.status === 'Concluído'
                    return (
                      <div 
                        key={p._id} 
                        className={`border rounded-xl p-4 shadow-lg transition-all ${
                          estaConcluido 
                            ? 'bg-slate-950/60 border-slate-800 opacity-60' 
                            : p.status === 'Em Preparo' 
                            ? 'bg-slate-900 border-blue-500/50' 
                            : 'bg-slate-900 border-yellow-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded text-xs">
                            MESA {p.mesa}
                          </span>
                          <span className={`text-xs font-bold ${
                            estaConcluido ? 'text-green-400' : p.status === 'Em Preparo' ? 'text-blue-400' : 'text-yellow-400'
                          }`}>
                            {estaConcluido ? '✓ Concluído' : p.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          {p.itens.map((i, idx) => (
                            <div key={idx} className="text-xs text-slate-200">
                              <div className="flex justify-between font-semibold">
                                <span>{i.quantidade}x {i.nome}</span>
                              </div>
                              {i.observacao && (
                                <p className="text-[11px] text-amber-400 font-bold bg-amber-500/10 p-1 rounded mt-0.5">
                                  ⚠️ Obs: {i.observacao}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {p.status === 'Pendente' && (
                          <button onClick={() => atualizarStatusPedido(p._id, 'Em Preparo')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded text-xs transition-all">
                            Iniciar Preparo
                          </button>
                        )}
                        {p.status === 'Em Preparo' && (
                          <button onClick={() => atualizarStatusPedido(p._id, 'Concluído')} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 rounded text-xs transition-all">
                            Concluir Pedido (Pronto)
                          </button>
                        )}
                        {estaConcluido && (
                          <div className="w-full bg-slate-800 text-slate-400 text-center py-1 rounded text-[11px] font-semibold border border-slate-700">
                            Pronto e entregue
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {abaAtiva === 'relatorio' && (
            <section className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-3 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-400">
                  📊 Relatório de Vendas (Gerência)
                </h2>

                <div className="flex items-center gap-1.5 text-xs bg-slate-900 p-1 rounded-lg border border-slate-700 w-full sm:w-auto">
                  <button
                    onClick={() => setFiltroPeriodoRelatorio('hoje')}
                    className={`px-2.5 py-1 rounded font-bold transition-all flex-1 sm:flex-none ${
                      filtroPeriodoRelatorio === 'hoje' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setFiltroPeriodoRelatorio('7dias')}
                    className={`px-2.5 py-1 rounded font-bold transition-all flex-1 sm:flex-none ${
                      filtroPeriodoRelatorio === '7dias' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7 Dias
                  </button>
                  <button
                    onClick={() => setFiltroPeriodoRelatorio('mes')}
                    className={`px-2.5 py-1 rounded font-bold transition-all flex-1 sm:flex-none ${
                      filtroPeriodoRelatorio === 'mes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Este Mês
                  </button>
                  <button
                    onClick={() => setFiltroPeriodoRelatorio('todos')}
                    className={`px-2.5 py-1 rounded font-bold transition-all flex-1 sm:flex-none ${
                      filtroPeriodoRelatorio === 'todos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Faturamento no Período</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-green-400">R$ {faturamentoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Contas Fechadas no Período</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{relatorioVendas.length}</p>
                </div>
              </div>

              <div>
                {relatorioVendas.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Nenhuma conta finalizada neste período.</p>
                ) : (
                  <div className="space-y-3">
                    {relatorioVendas.map((venda) => {
                      const estaAberto = vendaExpandida === venda.id

                      const itensUnicos = Object.values(
                        venda.itens.reduce((acc, i) => {
                          const chave = `${i.nome}_${i.observacao || ''}`
                          if (acc[chave]) {
                            acc[chave].quantidade += i.quantidade
                          } else {
                            acc[chave] = { ...i }
                          }
                          return acc
                        }, {})
                      )

                      return (
                        <div
                          key={venda.id}
                          className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-md transition-all"
                        >
                          <div
                            onClick={() => setVendaExpandida(estaAberto ? null : venda.id)}
                            className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-slate-800/80 transition-all gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="bg-amber-500/20 text-amber-400 font-extrabold px-3 py-1 rounded-lg text-sm border border-amber-500/30">
                                MESA {venda.mesa}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-white">
                                  Pagamento: <span className="text-slate-300 font-normal">{venda.formaPagamento}</span>
                                </p>
                                <p className="text-[11px] text-amber-400/90 font-semibold">
                                  🕒 {formatarDataHora(venda.data)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-0 border-slate-800 pt-2 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <p className="text-xs text-slate-400">Total Pago</p>
                                <p className="text-base sm:text-lg font-extrabold text-green-400">R$ {venda.total.toFixed(2)}</p>
                              </div>
                              <span className="text-amber-400 font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                                {estaAberto ? '▲ Ocultar' : '▼ Detalhes'}
                              </span>
                            </div>
                          </div>

                          {estaAberto && (
                            <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                  🧾 Recibo Detalhado da Mesa {venda.mesa}
                                </h4>
                                <button
                                  onClick={() => imprimirComprovanteCliente(venda)}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-2.5 py-1 rounded transition-all shadow"
                                >
                                  🖨️ Cupom Cliente
                                </button>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="text-slate-400 border-b border-slate-800">
                                    <tr>
                                      <th className="pb-2">Item Consumido</th>
                                      <th className="pb-2 text-center">Qtd</th>
                                      <th className="pb-2 text-right">Preço Un.</th>
                                      <th className="pb-2 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-900">
                                    {itensUnicos.map((item, idx) => {
                                      const subtotal = Number(item.preco) * Number(item.quantidade)
                                      return (
                                        <tr key={idx} className="text-slate-200">
                                          <td className="py-2 font-medium">
                                            {item.nome}
                                            {item.observacao && (
                                              <span className="block text-[10px] text-amber-400 italic">
                                                Obs: {item.observacao}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 text-center font-bold text-amber-400">{item.quantidade}x</td>
                                          <td className="py-2 text-right text-slate-400">R$ {Number(item.preco).toFixed(2)}</td>
                                          <td className="py-2 text-right font-bold text-white">R$ {subtotal.toFixed(2)}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-slate-800 pt-2 text-xs gap-1">
                                <span className="text-slate-400">
                                  Forma: <strong className="text-white">{venda.formaPagamento}</strong>
                                  {venda.formaPagamento === 'Dinheiro' && (
                                    <span className="ml-2 text-slate-400">
                                      (Pago: R$ {venda.valorPago.toFixed(2)} | Troco: R$ {venda.troco.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                                <span className="text-amber-400 font-bold">Total Consolidado: R$ {venda.total.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}