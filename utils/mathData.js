export const mathActivities = [
  // --------- ATIVIDADE 1 (Aprender 1-5) ---------
  {
    id: '1A', 
    tipo: 'contagem',
    tema: 'Contagem básica (1-5)',
    parte: 'Aprender',
    instrucao: 'Quantas maçãs você vê?',
    imagem: require('../assets/images/matematica/3macas.png'), 
    opcoes: [
      { id: 'op1', texto: '1', correta: false },
      { id: 'op2', texto: '2', correta: false },
      { id: 'op3', texto: '3', correta: true },
    ],
  },
  {
    id: '1B', 
    tipo: 'contagem',
    tema: 'Contagem básica (1-5)',
    parte: 'Reforçar',
    instrucao: 'Quantos gatos aparecem na tela?',
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
    imagem: require('../assets/images/matematica/8baloes.png'), 
    opcoes: [
      { id: 'op1', texto: '6', correta: false },
      { id: 'op2', texto: '8', correta: true },
      { id: 'op3', texto: '7', correta: false },
    ],
  },
  {
    id: '2B',
    tipo: 'contagem',
    tema: 'Contagem ampliada (6-10)',
    parte: 'Reforçar',
    instrucao: 'Quantas laranjas você vê?',
    imagem: require('../assets/images/matematica/10laranjas.png'), 
    opcoes: [
      { id: 'op1', texto: '10', correta: true },
      { id: 'op2', texto: '9', correta: false },
      { id: 'op3', texto: '6', correta: false },
    ],
  },

  // --------- ATIVIDADE 3 (Comparação) - TIPO (TOQUE) ---------
  {
    id: '3A', 
    tipo: 'toque_imagem', 
    tema: 'Comparação: Maior / Menor',
    parte: 'Aprender',
    instrucao: 'Toque no grupo que tem MAIS bananas.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/bananas_poucas.png'), correta: false },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/bananas_muitas.png'), correta: true },
    ],
  },
  {
    id: '3B', 
    tipo: 'toque_imagem', 
    tema: 'Comparação: Maior / Menor',
    parte: 'Reforçar',
    instrucao: 'Toque no grupo que tem MENOS flores.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/flores_muitas.png'), correta: false },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/flores_poucas.png'), correta: true }, 
    ],
  },

  // --------- ATIVIDADE 4 (Soma) --------
  {
    id: '4A', 
    tipo: 'soma',
    tema: 'Noções de soma',
    parte: 'Aprender',
    instrucao: 'Tínhamos 2 maçãs. Colocamos mais 1. Quantas temos agora?',
    imagem: require('../assets/images/matematica/soma_macas.png'), 
    opcoes: [
      { id: 'op1', texto: '2', correta: false },
      { id: 'op2', texto: '3', correta: true },
      { id: 'op3', texto: '1', correta: false },
    ],
  },
  {
    id: '4B', 
    tipo: 'soma',
    tema: 'Noções de soma',
    parte: 'Reforçar',
    instrucao: 'Temos 3 flores. Colocamos mais 2. Quantas temos agora?',
    imagem: require('../assets/images/matematica/soma_flores.png'), 
    opcoes: [
      { id: 'op1', texto: '4', correta: false },
      { id: 'op2', texto: '6', correta: false },
      { id: 'op3', texto: '5', correta: true },
    ],
  },

  // --------- ATIVIDADE 5 (Subtração) ---------
  {
    id: '5A', 
    tipo: 'subtracao',
    tema: 'Noções de subtração',
    parte: 'Aprender',
    instrucao: 'Tínhamos 5 bananas. Tiramos 2. Quantas sobraram?',
    imagem: require('../assets/images/matematica/subtracao_bananas.png'), 
    opcoes: [
      { id: 'op1', texto: '3', correta: true },
      { id: 'op2', texto: '5', correta: false },
      { id: 'op3', texto: '2', correta: false },
    ],
  },
  {
    id: '5B', 
    tipo: 'subtracao',
    tema: 'Noções de subtração',
    parte: 'Reforçar',
    instrucao: 'Tínhamos 4 carrinhos. Tiramos 1. Quantos sobraram?',
    imagem: require('../assets/images/matematica/subtracao_carros.png'), 
    opcoes: [
      { id: 'op1', texto: '1', correta: false },
      { id: 'op2', texto: '3', correta: true },
      { id: 'op3', texto: '4', correta: false },
    ],
  },

  // --------- ATIVIDADE 6 (Cores e Formas) TIPO (TOQUE) ---------
  {
    id: '6A', 
    tipo: 'toque_imagem', 
    tema: 'Cores e Formas',
    parte: 'Aprender',
    instrucao: 'Toque no círculo azul.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/forma_circulo_azul.png'), correta: true },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/forma_quadrado_vermelho.png'), correta: false },
      { id: 'op3', imagemSrc: require('../assets/images/matematica/forma_triangulo_verde.png'), correta: false },
    ],
  },
  {
    id: '6B', 
    tipo: 'toque_imagem', 
    tema: 'Cores e Formas',
    parte: 'Reforçar',
    instrucao: 'Toque no quadrado azul.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/forma_circulo_laranja.png'), correta: false },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/forma_quadrado_azul.png'), correta: true },
      { id: 'op3', imagemSrc: require('../assets/images/matematica/forma_triangulo_vermelho.png'), correta: false },
    ],
  },

  // --------- ATIVIDADE 7 (Sequências) ---------
  {
    id: '7A', 
    tipo: 'sequencia',
    tema: 'Sequências e Padrões',
    parte: 'Aprender',
    instrucao: 'Qual item completa a sequência?',
    imagem: require('../assets/images/matematica/seq_frutas.png'), 
    opcoes: [
      { id: 'op1', texto: 'Maçã', correta: true },
      { id: 'op2', texto: 'Banana', correta: false },
    ],
  },
  {
    id: '7B', 
    tipo: 'toque_imagem', 
    tema: 'Sequências e Padrões',
    parte: 'Reforçar',
    instrucao: 'Toque no triângulo vermelho.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/forma_circulo_laranja.png'), correta: false },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/forma_quadrado_azul.png'), correta: false },
      { id: 'op3', imagemSrc: require('../assets/images/matematica/forma_retangulo_rosa.png'), correta: false },
      { id: 'op4', imagemSrc: require('../assets/images/matematica/forma_triangulo_vermelho.png'), correta: true },
    ],
  },

  // --------- ATIVIDADE 8 (Dinheiro) ---------
  {
    id: '8A', 
    tipo: 'dinheiro',
    tema: 'Nosso Dinheiro',
    parte: 'Aprender',
    instrucao: 'Esta é uma moeda de 1 Real.',
    imagem: require('../assets/images/matematica/moeda_1real.png'), 
    opcoes: [
      { id: 'op1', texto: 'Entendido, continuar', correta: true },
    ],
  },
  {
    id: '8B', 
    tipo: 'toque_imagem', 
    tema: 'Nosso Dinheiro',
    parte: 'Reforçar',
    instrucao: 'Qual destas é a nota de 5 Reais?',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/nota_2.png'), correta: false },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/nota_5.png'), correta: true },
      { id: 'op3', imagemSrc: require('../assets/images/matematica/nota_10.png'), correta: false },
    ],
  },

  // --------- ATIVIDADE 9 (Tamanho) TIPO (TOQUE) ---------
  {
    id: '9A', 
    tipo: 'toque_imagem', 
    tema: 'Tamanho e Quantidade',
    parte: 'Aprender',
    instrucao: 'Toque no maior lápis.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/lapis_longo.png'), correta: true },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/lapis_curto.png'), correta: false },
    ],
  },
  {
    id: '9B', 
    tipo: 'toque_imagem', 
    tema: 'Tamanho e Quantidade',
    parte: 'Reforçar',
    instrucao: 'Toque no copo que está mais cheio.',
    opcoes: [
      { id: 'op1', imagemSrc: require('../assets/images/matematica/copo_cheio.png'), correta: true },
      { id: 'op2', imagemSrc: require('../assets/images/matematica/copo_metade.png'), correta: false },
    ],
  },

  // --------- ATIVIDADE 10 (Compras) ---------
  {
    id: '10A', 
    tipo: 'compras',
    tema: 'Compras no Supermercado',
    parte: 'Aprender',
    imagem: require('../assets/images/matematica/preco_tomate.png'), 
    instrucao: 'Cada tomate custa 2 reais. Se comprarmos 2 tomates, quanto pagamos?',
    opcoes: [
      { id: 'op1', texto: '1 Real', correta: false },
      { id: 'op2', texto: '4 Reais', correta: true },
      { id: 'op3', texto: '3 Reais', correta: false },
    ],
  },
  {
    id: '10B', 
    tipo: 'compras',
    tema: 'Compras no Supermercado',
    parte: 'Reforçar',
    imagem: require('../assets/images/matematica/carrinho_soma.png'), 
    instrucao: '3 melâncias custa 8 reais e uma laranja custa 1 real. Quanto pagamos pelas frutas?',
    opcoes: [
      { id: 'op1', texto: 'R$5,00 Reais', correta: false },
      { id: 'op2', texto: 'R$7,00 Reais', correta: false },
      { id: 'op3', texto: 'R$9,00 Reais', correta: true },
    ],
  }
];