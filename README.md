# 🍔 DevLanches — Gestão de Pedidos em Tempo Real

> Aplicação web para gerenciamento e acompanhamento de pedidos em tempo real para estabelecimentos alimentícios, focada em performance, usabilidade e notificação instantânea.

🔗 **Link do Projeto Online:** [Acesse o DevLanches no Vercel](https://seu-link-aqui.vercel.app)

---

## 🔑 Acesso para Testes / Demonstração

Para explorar a aplicação e simular a gestão de pedidos, utilize as credenciais abaixo:

* **URL de Acesso:** https://meu-primeiro-next-blush.vercel.app
* **Usuário:** `admin`
* **Senha:** `1234`
* **Perfil:** Administrador / Gerente de Pedidos

---

## 🚀 Tecnologias e Ferramentas

* **Front-end:** React.js / Next.js
* **Estilização:** Tailwind CSS (Layout Responsivo)
* **Consumo de API:** Fetch API com `async/await` e tratamento de erros (`try/catch/finally`)
* **Gerenciamento de Estado & Hooks:** `useState`, `useEffect` (Ciclo de Vida / Efeitos Colaterais)
* **Recursos Especiais:** Web Audio API (Notificações sonoras automatizadas para novos pedidos)
* **Deploy:** Vercel

---

## 🎯 Principais Funcionalidades

- [x] **Painel de Acompanhamento:** Listagem de pedidos recebidos com atualização dinâmica de status.
- [x] **Alertas Sonoros:** Sistema de notificação por áudio para avisar a equipe da cozinha quando um pedido é concluído/recebido.
- [x] **Manipulação Eficiente de Dados:** Uso de métodos avançados de array (`.map`, `.filter`, `.reduce`) para cálculo de totais e filtragem por status sem re-renderizações desnecessárias.
- [x] **Tratamento de Erros & Loading:** Interface amigável para o usuário com estados de carregamento e mensagens de feedback em caso de falhas na rede.
- [x] **Design Responsivo:** Adaptado para telas de celular, tablet e computador.

---

## 💡 Desafios Técnicos & Aprendizados

Durante o desenvolvimento do DevLanches, os principais focos de aprendizado foram:

1. **Prevenção de Renderizações Infinitas:** Implementação correta do array de dependências do `useEffect` para controle do ciclo de vida dos componentes.
2. **Manipulação de Dados em Tempo Real:** Encadeamento de `.filter()` e `.reduce()` para agregação de valores de pedidos com boa legibilidade e nomenclatura declarativa de variáveis.
3. **Resiliência na Comunicação com API:** Estruturação de requisições assíncronas em blocos `try/catch/finally` para garantir resiliência da interface mesmo diante de instabilidades de rede.

---

## 🛠️ Como rodar o projeto localmente

```bash
# 1. Clone o repositório
git clone https://github.com/paulojorge866-wq/devlanches

# 2. Entre na pasta do projeto
cd dev-lanches

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev