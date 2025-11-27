export const palavras = [
  { id: 1, incompleta: 'C_SA', correta: 'A', fala: 'casa' },
  { id: 2, incompleta: 'B_LA', correta: 'O', fala: 'bola' },
  { id: 3, incompleta: 'M_SA', correta: 'E', fala: 'mesa' },
  { id: 4, incompleta: 'G_TO', correta: 'A', fala: 'gato' },
  { id: 5, incompleta: 'P_TO', correta: 'A', fala: 'pato' },
];

export const imagens = [
  { id: 1, src: require('../assets/images/casa.jpg'), nome: 'CASA' },
  { id: 2, src: require('../assets/images/bola.jpg'), nome: 'BOLA' },
  { id: 3, src: require('../assets/images/gato.jpg'), nome: 'GATO' },
  { id: 4, src: require('../assets/images/pato.jpg'), nome: 'PATO' },
  { id: 5, src: require('../assets/images/mesa.jpg'), nome: 'MESA' },
];

export const corretoIncorreto = [
  {
    imagem: require('../assets/images/maca.png'),
    correta: "MAÇÃ",
    exibida: "MACA"  // errado
  },
  {
    imagem: require('../assets/images/cachorro.png'),
    correta: "CACHORRO",
    exibida: "CACHORO" // errado
  },
  {
    imagem: require('../assets/images/banana.png'),
    correta: "BANANA",
    exibida: "BANANA" // certo
  },
  {
    imagem: require('../assets/images/sol.png'),
    correta: "SOL",
    exibida: "SOUL" // errado
  },
  {
    imagem: require('../assets/images/peixe.png'),
    correta: "PEIXE",
    exibida: "PEIXE" // certo
  }
];
