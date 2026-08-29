import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Buscar produtos
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('devlanches')
    const produtos = await db.collection('produtos').find({}).toArray()
    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro no GET produtos:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// Cadastrar produto
export async function POST(request) {
  try {
    const body = await request.json()
    const { nome, preco, descricao, categoria, imagem } = body

    if (!nome || !preco) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios.' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('devlanches')

    const novoProduto = {
      nome,
      preco: Number(preco),
      descricao: descricao || '',
      categoria: categoria || 'Lanches',
      imagem: imagem || '',
      criadoEm: new Date(),
    }

    const resultado = await db.collection('produtos').insertOne(novoProduto)

    return NextResponse.json(
      { mensagem: 'Produto cadastrado!', id: resultado.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no POST produtos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Editar produto
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { nome, preco, descricao, categoria, imagem } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do produto não informado.' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('devlanches')

    await db.collection('produtos').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nome,
          preco: Number(preco),
          descricao: descricao || '',
          categoria: categoria || 'Lanches',
          imagem: imagem || '',
        },
      }
    )

    return NextResponse.json({ mensagem: 'Produto atualizado!' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Excluir produto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('devlanches')

    await db.collection('produtos').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ mensagem: 'Produto excluído!' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}