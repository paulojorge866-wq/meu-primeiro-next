import { NextResponse } from 'next/server'

// Nosso "banco de dados" temporário na memória do servidor
let produtos = [
  { id: 1, nome: 'Teclado Mecânico RGB', preco: '250.00' },
  { id: 2, nome: 'Mouse Gamer 10000 DPI', preco: '120.00' },
]

// 1. Método GET - Retorna a lista de produtos
export async function GET() {
  return NextResponse.json(produtos)
}

// 2. Método POST - Recebe um novo produto do formulário e salva
export async function POST(request) {
  const body = await request.json()

  if (!body.nome || !body.preco) {
    return NextResponse.json(
      { erro: 'Nome e preço são obrigatórios!' }, 
      { status: 400 }
    )
  }

  const novoProduto = {
    id: Date.now(),
    nome: body.nome,
    preco: body.preco
  }

  produtos.push(novoProduto)

  return NextResponse.json(novoProduto, { status: 201 })
}