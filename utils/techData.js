// utils/techData.js
export const situacoesSeguranca = [
  {
    id: 1,
    situacao: "Você recebe uma mensagem: 'Seu neto sofreu acidente, envie R$ 500 urgentemente para este número'. O que você faz?",
    opcoes: [
      "Envio o dinheiro rápido para ajudar",
      "Ligo para meu neto no telefone que já tenho salvo",
      "Pergunto mais detalhes por mensagem",
      "Ignoro completamente"
    ],
    respostaCorreta: "Ligo para meu neto no telefone que já tenho salvo",
    explicacao: "Excelente! Sempre confirme por telefone direto. Golpistas criam urgência para você não pensar."
  },
  {
    id: 2,
    situacao: "Alguém liga dizendo ser do banco e pede o código que chegou no seu celular. O que você faz?",
    opcoes: [
      "Passo o código para resolver o problema",
      "Desligo e não passo nada",
      "Peço o nome e matrícula da pessoa",
      "Dou meus dados pessoais para confirmar"
    ],
    respostaCorreta: "Desligo e não passo nada",
    explicacao: "Perfeito! Bancos NUNCA pedem códigos pelo telefone. São golpistas tentando acessar suas contas."
  },
  {
    id: 3,
    situacao: "Você recebe um link por WhatsApp: 'Clique aqui para ganhar um prêmio'. O que faz?",
    opcoes: [
      "Clique rápido para ver o prêmio",
      "Encaminho para todos os contatos",
      "Não clico e deleto a mensagem",
      "Respondo pedindo mais informações"
    ],
    respostaCorreta: "Não clico e deleto a mensagem",
    explicacao: "Muito bem! Links desconhecidos podem ter vírus ou golpes. Se parece bom demais, provavelmente é golpe."
  },
  {
    id: 4,
    situacao: "Um vídeo do seu filho pede dinheiro pelo WhatsApp, mas a voz parece estranha. O que você faz?",
    opcoes: [
      "Envio o dinheiro pelo Pix",
      "Ligo para meu filho para confirmar",
      "Pergunto por que ele precisa",
      "Ignoro pensando que é brincadeira"
    ],
    respostaCorreta: "Ligo para meu filho para confirmar",
    explicacao: "Ótimo! Deepfakes podem falsificar vídeos. Sempre confirme por telefone antes de transferir dinheiro."
  },
  {
    id: 5,
    situacao: "No caixa eletrônico, um estranho oferece ajuda para digitar. O que você faz?",
    opcoes: [
      "Aceito a ajuda com gratidão",
      "Peço para ele digitar minha senha",
      "Recuso e chamo um funcionário do banco",
      "Saio correndo assustado"
    ],
    respostaCorreta: "Recuso e chamo um funcionário do banco",
    explicacao: "Excelente decisão! No caixa, apenas funcionários do banco podem ajudar. Sua segurança vem primeiro."
  },
  {
    id: 6,
    situacao: "Você recebe um email do 'banco' pedindo para atualizar seus dados. O que faz?",
    opcoes: [
      "Clique no link e atualizo meus dados",
      "Ligo para o banco usando o número oficial",
      "Respondo o email com minhas informações",
      "Ignoro completamente"
    ],
    respostaCorreta: "Ligo para o banco usando o número oficial",
    explicacao: "Perfeito! Phishing usa emails falsos. Sempre use números oficiais para confirmar."
  },
  {
    id: 7,
    situacao: "Alguém na rua pede para usar seu celular para uma ligação urgente. O que você faz?",
    opcoes: [
      "Empresto meu celular",
      "Faço a ligação por ele",
      "Ofereço dinheiro para orelhão",
      "Digo que não posso ajudar"
    ],
    respostaCorreta: "Digo que não posso ajudar",
    explicacao: "Muito bem! Não empreste seu celular. A pessoa pode fugir com ele ou acessar suas informações."
  },
  {
    id: 8,
    situacao: "Um aplicativo desconhecido pede acesso a seus contatos e fotos. O que você faz?",
    opcoes: [
      "Permito tudo para usar o app",
      "Permito só o necessário",
      "Não permito e desinstalo",
      "Pergunto para um familiar"
    ],
    respostaCorreta: "Não permito e desinstalo",
    explicacao: "Excelente! Apps desconhecidos podem roubar seus dados. Só use apps confiáveis da loja oficial."
  },
  {
  id: 9,
  situacao: "Seu celular ficou sem bateria enquanto você está na rua. O que você faz?",
  opcoes: [
    "Pede o celular de um desconhecido emprestado",
    "Procura um lugar seguro para carregar",
    "Tenta ligar mesmo sem bateria",
    "Desiste de usar o celular hoje"
  ],
  respostaCorreta: "Procura um lugar seguro para carregar",
  explicacao: "Perfeito! Quando o celular está sem bateria, o ideal é encontrar um local seguro, como uma loja ou estabelecimento, para carregar o aparelho."
},
  {
    id: 10,
    situacao: "Alguém se passa por técnico da operadora e pede acesso ao seu celular. O que faz?",
    opcoes: [
      "Permito o acesso para consertar",
      "Peço identificação oficial",
      "Ligo para a operadora para confirmar",
      "Deixo a pessoa mexer no celular"
    ],
    respostaCorreta: "Ligo para a operadora para confirmar",
    explicacao: "Muito bem! Técnicos legítimos marcam horário e se identificam. Sempre confirme com a empresa."
  }
];