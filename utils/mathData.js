export const mathActivities = [
  // --------- ATIVIDADE 1 (Aprender 1-5) ---------
  {
    id: '1A', 
    tipo: 'contagem',
    tema: 'Contagem básica (1-5)',
    parte: 'Aprender',
    instrucao: 'Quantas maçãs você vê?',
    // 🔔 Imagem necessária: assets/images/matematica/3macas.png
    imagem: require('../assets/images/matematica/3macas.png'), 
    opcoes: [
      { id: 'op1', texto: '1', correta: false },
      { id: 'op2', texto: '2', correta: false },
      { id: 'op3', texto: '3', correta: true },
    ],
  },
  // --------- ATIVIDADE 1 (Reforçar 1-5) ---------
  {
    id: '1B', 
    tipo: 'contagem',
    tema: 'Contagem básica (1-5)',
    parte: 'Reforçar',
    instrucao: 'Quantos gatos aparecem na tela?',
    // 🔔 Imagem necessária: assets/images/matematica/5gatos.png
    imagem: require('../assets/images/matematica/5gatos.png'), 
    opcoes: [
      { id: 'op1', texto: '5', correta: true },
      { id: 'op2', texto: '4', correta: false },
      { id: 'op3', texto: '2', correta: false },
    ],
  },

  // --------- ATIVIDADE 2 (Aprender 6-10) ---------
  {
    id: '2A', 
    tipo: 'contagem',
    tema: 'Contagem ampliada (6-10)',
    parte: 'Aprender',
    instrucao: 'Quantos balões temos agora?',
    // 🔔 Imagem necessária: assets/images/matematica/8baloes.png
    imagem: require('../assets/images/matematica/8baloes.png'), 
    opcoes: [
      { id: 'op1', texto: '6', correta: false },
      { id: 'op2', texto: '8', correta: true },
      { id: 'op3', texto: '7', correta: false },
    ],
  },
  // --------- ATIVIDADE 2 (Reforçar 6-10) ---------
  {
    id: '2B',
    tipo: 'contagem',
    tema: 'Contagem ampliada (6-10)',
    parte: 'Reforçar',
    instrucao: 'Quantas laranjas você vê?',
    // 🔔 Imagem necessária: assets/images/matematica/10laranjas.png
    imagem: require('../assets/images/matematica/10laranjas.png'), 
    opcoes: [
      { id: 'op1', texto: '10', correta: true },
      { id: 'op2', texto: '9', correta: false },
      { id: 'op3', texto: '6', correta: false },
    ],
  },

  // --------- ATIVIDADE 3 (Comparação) ---------
  {
    id: '3A', 
    tipo: 'comparacao',
    tema: 'Comparação: Maior / Menor',
    parte: 'Aprender',
    instrucao: 'Qual grupo tem MAIS bananas?',
    // 🔔 Imagem necessária: assets/images/matematica/comparar_bananas.png
    imagem: require('../assets/images/matematica/comparar_bananas.png'), 
    opcoes: [
      { id: 'op1', texto: 'Grupo da esquerda', correta: false },
      { id: 'op2', texto: 'Grupo da direita', correta: true }, // Assumindo que o da direita tem mais
    ],
  },
  // --------- ATIVIDADE 3 (Reforçar) ---------
  {
    id: '3B', 
    tipo: 'comparacao',
    tema: 'Comparação: Maior / Menor',
    parte: 'Reforçar',
    instrucao: 'Qual grupo tem MENOS flores?',
    // 🔔 Imagem necessária: assets/images/matematica/comparar_flores.png
    imagem: require('../assets/images/matematica/comparar_flores.png'), 
    opcoes: [
      { id: 'op1', texto: 'Grupo da esquerda', correta: false }, 
      { id: 'op2', texto: 'Grupo da direita', correta: true }, // Assumindo que o da direita tem menos
    ],
  },
// --------- ATIVIDADE 4 (Soma - Aprender) ---------
  {
    id: '4A', 
    tipo: 'soma',
    tema: 'Noções de soma',
    parte: 'Aprender',
    // Narração: "Tínhamos 2 maçãs. Colocamos mais 1. Quantas temos agora?"
    instrucao: 'Tínhamos 2 maçãs. Colocamos mais 1. Quantas temos agora?',
    // 🔔 Imagem necessária: 'soma_macas.png' (mostrando 2 + 1)
    imagem: require('../assets/images/matematica/soma_macas.png'), 
    opcoes: [
      { id: 'op1', texto: '2', correta: false },
      { id: 'op2', texto: '3', correta: true },
      { id: 'op3', texto: '1', correta: false },
    ],
  },
  // --------- ATIVIDADE 4 (Soma - Reforçar) ---------
  {
    id: '4B', 
    tipo: 'soma',
    tema: 'Noções de soma',
    parte: 'Reforçar',
    // Narração: "Temos 3 flores. Colocamos mais 2. Quantas temos agora?"
    instrucao: 'Temos 3 flores. Colocamos mais 2. Quantas temos agora?',
    // 🔔 Imagem necessária: 'soma_flores.png' (mostrando 3 + 2)
    imagem: require('../assets/images/matematica/soma_flores.png'), 
    opcoes: [
      { id: 'op1', texto: '4', correta: false },
      { id: 'op2', texto: '6', correta: false },
      { id: 'op3', texto: '5', correta: true },
    ],
  },

  // --------- ATIVIDADE 5 (Subtração - Aprender) ---------
  {
    id: '5A', 
    tipo: 'subtracao',
    tema: 'Noções de subtração',
    parte: 'Aprender',
    // Narração: "Tínhamos 5 bananas. Tiramos 2. Quantas sobraram?"
    instrucao: 'Tínhamos 5 bananas. Tiramos 2. Quantas sobraram?',
    // 🔔 Imagem necessária: 'subtracao_bananas.png' (mostrando 5 - 2)
    imagem: require('../assets/images/matematica/subtracao_bananas.png'), 
    opcoes: [
      { id: 'op1', texto: '3', correta: true },
      { id: 'op2', texto: '5', correta: false },
      { id: 'op3', texto: '2', correta: false },
    ],
  },
  // --------- ATIVIDADE 5 (Subtração - Reforçar) ---------
  {
    id: '5B', 
    tipo: 'subtracao',
    tema: 'Noções de subtração',
    parte: 'Reforçar',
    // Narração: "Tínhamos 4 carros. Tiramos 1. Quantos sobraram?"
    instrucao: 'Tínhamos 4 carros. Tiramos 1. Quantos sobraram?',
    // 🔔 Imagem necessária: 'subtracao_carros.png' (mostrando 4 - 1)
    imagem: require('../assets/images/matematica/subtracao_carros.png'), 
    opcoes: [
      { id: 'op1', texto: '1', correta: false },
      { id: 'op2', texto: '3', correta: true },
      { id: 'op3', texto: '4', correta: false },
    ],
  },

// --------- ATIVIDADE 6 (Cores e Formas - Aprender) ---------
  {
    id: '6A', 
    tipo: 'formas',
    tema: 'Cores e Formas',
    parte: 'Aprender',
    instrucao: 'Toque no círculo azul.',
    // 🔔 Imagem: 'formas_simples.png' (mostrar 1 círculo azul, 1 quadrado vermelho, 1 triângulo verde)
    imagem: require('../assets/images/matematica/formas_simples.png'), 
    opcoes: [
      // Aqui, as opções não são "corretas" ou "incorretas" no sentido de avançar
      // O ideal seria a tela ModuleMatematica ter uma lógica para "clique na área certa"
      // Mas, para MANTER O PADRÃO, vamos usar botões de texto.
      { id: 'op1', texto: 'Círculo Azul', correta: true },
      { id: 'op2', texto: 'Quadrado Vermelho', correta: false },
      { id: 'op3', texto: 'Triângulo Verde', correta: false },
    ],
  },
  // --------- ATIVIDADE 6 (Cores e Formas - Reforçar) ---------
  {
    id: '6B', 
    tipo: 'formas',
    tema: 'Cores e Formas',
    parte: 'Reforçar',
    instrucao: 'Toque no triângulo vermelho.',
    // 🔔 Imagem: 'formas_misturadas.png' (mostrar várias formas e cores)
    imagem: require('../assets/images/matematica/formas_misturadas.png'), 
    opcoes: [
      { id: 'op1', texto: 'Círculo Laranja', correta: false },
      { id: 'op2', texto: 'Quadrado Azul', correta: false },
      { id: 'op3', texto: 'Triângulo Vermelho', correta: true },
    ],
  },

  // --------- ATIVIDADE 7 (Sequências - Aprender) ---------
  {
    id: '7A', 
    tipo: 'sequencia',
    tema: 'Sequências e Padrões',
    parte: 'Aprender',
    instrucao: 'Qual item completa a sequência?',
    // 🔔 Imagem: 'seq_frutas.png' (Maçã, Banana, Maçã, Banana, ?)
    imagem: require('../assets/images/matematica/seq_frutas.png'), 
    opcoes: [
      // O "texto" do botão pode ser a imagem, mas vamos manter o padrão por enquanto
      { id: 'op1', texto: 'Maçã', correta: true },
      { id: 'op2', texto: 'Banana', correta: false },
    ],
  },
  // --------- ATIVIDADE 7 (Sequências - Reforçar) ---------
  {
    id: '7B', 
    tipo: 'sequencia',
    tema: 'Sequências e Padrões',
    parte: 'Reforçar',
    instrucao: 'Qual forma completa a sequência?',
    // 🔔 Imagem: 'seq_formas.png' (Círculo, Quadrado, Círculo, Quadrado, ?)
    imagem: require('../assets/images/matematica/seq_formas.png'), 
    opcoes: [
      { id: 'op1', texto: 'Quadrado', correta: true },
      { id: 'op2', texto: 'Círculo', correta: false },
    ],
  },
// --------- ATIVIDADE 8 (Dinheiro- Aprender Moedas) ---------
  {
    id: '8A', 
    tipo: 'dinheiro',
    tema: 'Nosso Dinheiro',
    parte: 'Aprender',
    // 🔔 Imagem: 'moeda_1real.png' (Imagem BEM GRANDE da moeda)
    imagem: require('../assets/images/matematica/moeda_1real.png'), 
    instrucao: 'Esta é uma moeda de 1 Real.',
    opcoes: [
      // Atividade instrutiva, apenas um botão para avançar
      { id: 'op1', texto: 'Entendido, continuar', correta: true },
    ],
  },
  // --------- ATIVIDADE 8 (Dinheiro - Reforçar Moedas e Notas) ---------
  {
    id: '8B', 
    tipo: 'dinheiro',
    tema: 'Nosso Dinheiro',
    parte: 'Reforçar',
    // 🔔 Imagem: 'escolha_notas.png' (Mostrar 1 nota de R$2, 1 de R$5, 1 de R$10)
    imagem: require('../assets/images/matematica/escolha_notas.png'), 
    instrucao: 'Qual destas é a nota de 5 Reais?',
    opcoes: [
      { id: 'op1', texto: 'A nota de 2 Reais', correta: false },
      { id: 'op2', texto: 'A nota de 5 Reais', correta: true },
      { id: 'op3', texto: 'A nota de 10 Reais', correta: false },
    ],
  },

  // --------- ATIVIDADE 9 (Tamanho - Aprender) ---------
  {
    id: '9A', 
    tipo: 'tamanho',
    tema: 'Tamanho e Quantidade',
    parte: 'Aprender',
    instrucao: 'Qual lápis é o mais longo?',
    // 🔔 Imagem: 'tamanho_lapis.png' (1 lápis curto vs 1 lápis longo)
    imagem: require('../assets/images/matematica/tamanho_lapis.png'), 
    opcoes: [
      { id: 'op1', texto: 'O lápis de cima', correta: true }, // Assumindo que o de cima é o longo
      { id: 'op2', texto: 'O lápis de baixo', correta: false },
    ],
  },
  // --------- ATIVIDADE 9 (Tamanho - Reforçar) ---------
  {
    id: '9B', 
    tipo: 'tamanho',
    tema: 'Tamanho e Quantidade',
    parte: 'Reforçar',
    instrucao: 'Qual copo está mais cheio de suco de uva?',
    // 🔔 Imagem: 'quantidade_copo.png' (1 copo cheio vs 1 copo na metade)
    imagem: require('../assets/images/matematica/quantidade_copo.png'), 
    opcoes: [
      { id: 'op1', texto: 'O copo da esquerda', correta: true }, // Assumindo que o da esquerda é o cheio
	  { id: 'op2', texto: 'O copo da direita', correta: false },
    ],
  },
// --------- ATIVIDADE 10 (Compras - Aprender) ---------
  {
    id: '10A', 
    tipo: 'compras',
    tema: 'Compras no Supermercado',
    parte: 'Aprender',
    // 🔔 Imagem: 'preco_tomate.png' (2 tomate com a placa "R$ 2,00")
    imagem: require('../assets/images/matematica/preco_tomate.png'), 
    instrucao: 'O tomate custa 2 reais. Se comprarmos 2, quanto pagamos?',
    opcoes: [
      { id: 'op1', texto: '1 Real', correta: false },
      { id: 'op2', texto: '4 Reais', correta: true },
       { id: 'op3', texto: '3 Reais', correta: false },
    ],
  },
  // --------- ATIVIDADE 10 (Compras - Reforçar) ---------
  {
    id: '10B', 
    tipo: 'compras',
    tema: 'Compras no Supermercado',
    parte: 'Reforçar',
    // 🔔 Imagem: 'carrinho_soma.png' (3 melancias R$8,00 + 1 laranja R$1,00)
    imagem: require('../assets/images/matematica/carrinho_soma.png'), 
    instrucao: 'Três melâncias custa 8 reais e uma laranja custa 1 real. Quanto pagamos pelas frutas?',
    opcoes: [
      { id: 'op1', texto: '5 Reais', correta: false },
      { id: 'op2', texto: '7 Reais', correta: false },
      { id: 'op3', texto: '9 Reais', correta: true },
    ],
  }
];