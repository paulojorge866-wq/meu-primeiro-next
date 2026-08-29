import { MongoClient } from 'mongodb'
import dns from 'dns'

// Força o Node a priorizar IPv4 para evitar o erro de SRV do Windows
dns.setDefaultResultOrder('ipv4first')

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Por favor, adicione a MONGODB_URI no seu arquivo .env.local')
}

// Opções para acelerar a reconexão
const options = {
  serverSelectionTimeoutMS: 5000,
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise