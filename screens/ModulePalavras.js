import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { palavras, imagens } from '../utils/data';

export default function ModulePalavras({ navigation }) {
  const [etapa, setEtapa] = useState('palavras');
  const [index, setIndex] = useState(0);

  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [respondido, setRespondido] = useState(false);

  const timeoutRef = useRef(null);

  // Item atual
  const atual =
    etapa === 'palavras'
      ? palavras[index]
      : etapa === 'imagens'
      ? imagens[index]
      : palavras[index]; // ditado usa palavras

  // total = 5 palavras + 5 imagens + 5 ditado = 15
  const totalExercicios = 15;
  const exercicioAtual =
    etapa === 'palavras'
      ? index + 1
      : etapa === 'imagens'
      ? index + 6
      : index + 11;

  // Palavra completa usada para imagens + ditado + mensagens
  const palavraCompleta =
    etapa === 'palavras'
      ? atual.incompleta.replace('_', atual.correta).toUpperCase()
      : etapa === 'imagens'
      ? atual.nome.toUpperCase()
      : atual.incompleta.replace('_', atual.correta).toUpperCase();

  // gera palavras similares para IMAGENS
  function gerarSimilares(correta) {
    correta = correta.toUpperCase();
    let base = imagens.map(i => i.nome.toUpperCase());

    let similares = base.filter(n => n !== correta && n.startsWith(correta[0]));

    if (similares.length < 3) {
      const extras = base.filter(n => n !== correta);
      similares = [...similares, ...extras];
    }

    // garante que existam pelo menos 3 (pode repetir se necessário)
    return Array.from(new Set(similares)).slice(0, 3);
  }

  // função genérica
  function gerarOpcoes(correta, alternativas, qtd = 4) {
    let opcoes = [correta];

    while (opcoes.length < qtd) {
      const aleatoria =
        alternativas[Math.floor(Math.random() * alternativas.length)];
      if (!opcoes.includes(aleatoria)) opcoes.push(aleatoria);
    }

    return opcoes.sort(() => Math.random() - 0.5);
  }

  // opções da etapa atual
  const opcoes =
    etapa === 'palavras'
      ? gerarOpcoes(atual.correta.toUpperCase(), ['A', 'E', 'I', 'O', 'U'])
      : etapa === 'imagens'
      ? gerarOpcoes(palavraCompleta, gerarSimilares(atual.nome))
      : gerarOpcoes(
          palavraCompleta,
          palavras.map(p => p.incompleta.replace('_', p.correta).toUpperCase())
        );

  // efeitos: falar e resetar flags
  useEffect(() => {
    setFeedback('');
    setRespondido(false);

    if (etapa === 'palavras') {
      Speech.speak(atual.fala, { language: 'pt-BR' });
    } else if (etapa === 'imagens') {
      Speech.speak('O que é isso?', { language: 'pt-BR' });
    } else {
      // ditado
      Speech.speak(atual.fala, { language: 'pt-BR' });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, etapa]);

  const verificar = (resp) => {
  if (respondido) return;
  setRespondido(true);

  const respostaUsuario = (resp || '').toString().toUpperCase();

  // 1️⃣ qual é a resposta correta
  const esperado =
    etapa === 'palavras'
      ? atual.correta.toUpperCase()         // só a letra
      : etapa === 'imagens'
      ? atual.nome.toUpperCase()            // nome da imagem
      : palavraCompleta.toUpperCase();      // ditado (palavra completa)

  const acertou = respostaUsuario === esperado;

  // 2️⃣ atualiza contadores corretamente
  const newAcertos = acertou ? acertos + 1 : acertos;
  const newErros = acertou ? erros : erros + 1;

  if (acertou) {
    setAcertos(newAcertos);
    setFeedback("✅ Acertou!");
    Speech.speak("Parabéns, você acertou!", { language: "pt-BR" });
  } else {
    let corretaMensagem;

    if (etapa === "palavras") {
      corretaMensagem = `a letra ${atual.correta.toUpperCase()}`;
    } else {
      corretaMensagem = esperado; // palavra completa
    }

    setErros(newErros);
    setFeedback(`❌ Errou! Era ${corretaMensagem}.`);
    Speech.speak(`A resposta correta é ${corretaMensagem}`, {
      language: "pt-BR",
    });
  }

  // 3️⃣ atraso e troca de etapas
  const delay = acertou ? 1500 : 3000;

  timeoutRef.current = setTimeout(() => {
    if (index < 4) {
      setIndex((i) => i + 1);
      return;
    }

    if (etapa === "palavras") {
      setEtapa("imagens");
      setIndex(0);
      return;
    }

    if (etapa === "imagens") {
      setEtapa("ditado");
      setIndex(0);
      return;
    }

    // final
    navigation.replace("Resultado", {
      acertos: newAcertos,
      erros: newErros,
      modulo: "Português",
    });
  }, delay);
};


  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#FFFDF7',
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: 'bold' }}>
        Módulo: Português
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Exercício {exercicioAtual} de {totalExercicios}
      </Text>

      {/* PALAVRAS */}
      {etapa === 'palavras' && (
        <>
          <Text style={{ fontSize: 36, color: '#4A90E2', marginVertical: 20 }}>
            {atual.incompleta}
          </Text>

          <LargeButton
            title="🔊 Ouvir Palavra"
            color="#FFB703"
            onPress={() => Speech.speak(atual.fala, { language: 'pt-BR' })}
          />
        </>
      )}

      {/* IMAGENS */}
      {etapa === 'imagens' && (
        <>
          <Image
            source={atual.src}
            style={{
              width: 250,
              height: 200,
              marginVertical: 20,
              borderRadius: 12,
            }}
            resizeMode="contain"
          />

          <LargeButton
            title="🔊 Ouvir Pergunta"
            color="#FFB703"
            onPress={() => Speech.speak('O que é isso?', { language: 'pt-BR' })}
          />
        </>
      )}

      {/* DITADO */}
      {etapa === 'ditado' && (
        <>
          <Text style={{ fontSize: 24, marginVertical: 20 }}>
            Ouça e Escolha:
          </Text>

          <LargeButton
            title="🔊 Ouvir Palavra"
            color="#FFB703"
            onPress={() => Speech.speak(atual.fala, { language: 'pt-BR' })}
          />
        </>
      )}

      {/* OPÇÕES (grid 2x2 centralizado) */}
      <View
        style={{
          marginTop: 20,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '85%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {opcoes.map((op, idx) => (
            <View
              key={idx}
              style={{
                width: '48%',
                margin: '1%',
                alignItems: 'center',
              }}
            >
              <LargeButton
                title={op}
                color="#4A90E2"
                onPress={() => verificar(op)}
                disabled={respondido}
                style={{ width: '100%' }}
              />
            </View>
          ))}
        </View>
      </View>

      {feedback !== '' && (
        <Text style={{ fontSize: 20, marginTop: 10 }}>{feedback}</Text>
      )}

      <LargeButton
        title="⬅️ Voltar"
        color="#999"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
