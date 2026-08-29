import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Buscar todos os pedidos
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('devlanches')
    const pedidos = await db.collection('pedidos').find({}).sort({ criadoEm: -1 }).toArray()
    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro no GET /api/pedidos:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST: Criar um novo pedido
export async function POST(request) {
  try {
    const body = await request.json()
    const { itens, total, mesa, pagamentoStatus } = body

    if (!itens || itens.length === 0) {
      return NextResponse.json({ error: 'O carrinho está vazio.' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('devlanches')

    const novoPedido = {
      mesa: Number(mesa) || 1,
      itens: itens.map((item) => ({
        nome: item.nome,
        preco: Number(item.preco),
        quantidade: Number(item.quantidade),
        observacao: item.observacao || '', // Suporte a observações individuais por item
      })),
      total: Number(total),
      status: 'Pendente',
      pagamentoStatus: pagamentoStatus || 'Pendente',
      criadoEm: new Date(),
    }

    const resultado = await db.collection('pedidos').insertOne(novoPedido)

    return NextResponse.json(
      { mensagem: 'Pedido gerado!', id: resultado.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no POST /api/pedidos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Atualizar pedido e vincular ao fechamento da conta
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { status, pagamentoStatus, formaPagamento, codigoFechamento, valorPago, troco } = body

    if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

    const client = await clientPromise
    const db = client.db('devlanches')

    const camposAtualizados = {}
    if (status) camposAtualizados.status = status
    if (pagamentoStatus) camposAtualizados.pagamentoStatus = pagamentoStatus
    if (formaPagamento) camposAtualizados.formaPagamento = formaPagamento
    if (codigoFechamento) camposAtualizados.codigoFechamento = codigoFechamento
    if (valorPago !== undefined) camposAtualizados.valorPago = Number(valorPago)
    if (troco !== undefined) camposAtualizados.troco = Number(troco)

    await db.collection('pedidos').updateOne(
      { _id: new ObjectId(id) },
      { $set: camposAtualizados }
    )

    return NextResponse.json({ mensagem: 'Atualizado com sucesso!' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Cancelar / Estornar um pedido individual
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID do pedido obrigatório.' }, { status: 400 })

    const client = await clientPromise
    const db = client.db('devlanches')

    await db.collection('pedidos').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ mensagem: 'Pedido cancelado com sucesso!' })
  } catch (error) {
    console.error('Erro no DELETE /api/pedidos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}