import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';

import { palavras, imagens, corretoIncorreto } from '../utils/data';

export default function ModulePalavras({ navigation }) {
  const [etapa, setEtapa] = useState('palavras');
  const [index, setIndex] = useState(0);

  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [respondido, setRespondido] = useState(false);

  const timeoutRef = useRef(null);

  // ITEM ATUAL
  const atual =
    etapa === 'palavras'
      ? palavras[index]
      : etapa === 'imagens'
      ? imagens[index]
      : etapa === 'ditado'
      ? palavras[index]
      : etapa === 'corretoIncorreto'
      ? corretoIncorreto[index]
      : palavras[index];

  // Total agora: 5 + 5 + 5 + 5 = 20
  const totalExercicios = 20;

  const exercicioAtual =
    etapa === 'palavras'
      ? index + 1
      : etapa === 'imagens'
      ? index + 6
      : etapa === 'ditado'
      ? index + 11
      : index + 16;

  // palavra completa
  const palavraCompleta =
    etapa === 'palavras'
      ? atual.incompleta.replace('_', atual.correta).toUpperCase()
      : etapa === 'imagens'
      ? atual.nome.toUpperCase()
      : etapa === 'ditado'
      ? atual.incompleta.replace('_', atual.correta).toUpperCase()
      : '';

  function gerarSimilares(correta) {
    correta = correta.toUpperCase();
    let base = imagens.map(i => i.nome.toUpperCase());
    let semelhantes = base.filter(n => n !== correta && n.startsWith(correta[0]));

    if (semelhantes.length < 3) {
      const extras = base.filter(n => n !== correta);
      semelhantes = [...semelhantes, ...extras];
    }

    return Array.from(new Set(semelhantes)).slice(0, 3);
  }

  function gerarOpcoes(correta, alternativas, qtd = 4) {
    let opcoes = [correta];
    while (opcoes.length < qtd) {
      const aleatoria =
        alternativas[Math.floor(Math.random() * alternativas.length)];
      if (!opcoes.includes(aleatoria)) opcoes.push(aleatoria);
    }
    return opcoes.sort(() => Math.random() - 0.5);
  }

  // Opções
  const opcoes =
    etapa === 'palavras'
      ? gerarOpcoes(atual.correta.toUpperCase(), ['A', 'E', 'I', 'O', 'U'])
      : etapa === 'imagens'
      ? gerarOpcoes(palavraCompleta, gerarSimilares(atual.nome))
      : etapa === 'ditado'
      ? gerarOpcoes(
          palavraCompleta,
          palavras.map(p => p.incompleta.replace('_', p.correta).toUpperCase())
        )
      : etapa === 'corretoIncorreto'
      ? ['👍', '👎']
      : [];

  // SPEAK
  useEffect(() => {
    setFeedback('');
    setRespondido(false);

    if (etapa === 'palavras') {
      Speech.speak(atual.fala, { language: 'pt-BR' });
    } else if (etapa === 'imagens') {
      Speech.speak('O que é isso?', { language: 'pt-BR' });
    } else if (etapa === 'ditado') {
      Speech.speak(atual.fala, { language: 'pt-BR' });
    } else if (etapa === 'corretoIncorreto') {
      Speech.speak('Essa palavra está escrita corretamente?', {
        language: 'pt-BR',
      });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, etapa]);

  // VERIFICAÇÃO
  const verificar = (resp) => {
    if (respondido) return;
    setRespondido(true);

    const respostaUsuario = (resp || '').toString().toUpperCase();

    // -----------------------------------------------
    // ETAPA CORRETO / INCORRETO
    // -----------------------------------------------
    if (etapa === "corretoIncorreto") {
      const exibida = atual.exibida.toUpperCase();
      const correta = atual.correta.toUpperCase();
      const estaCorreta = exibida === correta;

      const acertou =
        (estaCorreta && respostaUsuario.includes("👍")) ||
        (!estaCorreta && respostaUsuario.includes("👎"));

      const newAcertos = acertou ? acertos + 1 : acertos;
      const newErros = acertou ? erros : erros + 1;

      if (acertou) {
        setAcertos(newAcertos);
        setFeedback("✅ Acertou!");
        Speech.speak("Parabéns, você acertou!", { language: "pt-BR" });
      } else {
        setErros(newErros);
        Speech.speak(
          estaCorreta
            ? "A palavra estava escrita corretamente."
            : "A palavra estava escrita incorretamente.",
          { language: "pt-BR" }
        );
        setFeedback(
          estaCorreta
            ? "❌ A palavra estava correta!"
            : "❌ A palavra estava errada!"
        );
      }

      timeoutRef.current = setTimeout(() => {
        if (index < 4) {
          setIndex(i => i + 1);
        } else {
          navigation.replace("Resultado", {
            acertos: newAcertos,
            erros: newErros,
            modulo: "Português",
          });
        }
      }, acertou ? 1500 : 3000);

      return;
    }

    // -----------------------------------------------
    // PALAVRAS, IMAGENS e DITADO
    // -----------------------------------------------
    const esperado =
      etapa === 'palavras'
        ? atual.correta.toUpperCase()
        : etapa === 'imagens'
        ? atual.nome.toUpperCase()
        : palavraCompleta.toUpperCase();

    const acertou = respostaUsuario === esperado;

    const newAcertos = acertou ? acertos + 1 : acertos;
    const newErros = acertou ? erros : erros + 1;

    if (acertou) {
      setAcertos(newAcertos);
      setFeedback("✅ Acertou!");
      Speech.speak("Parabéns, você acertou!", { language: "pt-BR" });
    } else {
      let corretaMensagem =
        etapa === "palavras"
          ? `a letra ${atual.correta.toUpperCase()}`
          : esperado;

      setErros(newErros);
      setFeedback(`❌ Errou! Era ${corretaMensagem}.`);
      Speech.speak(`A resposta correta é ${corretaMensagem}`, {
        language: "pt-BR",
      });
    }

    const delay = acertou ? 1500 : 3000;

    timeoutRef.current = setTimeout(() => {
      if (index < 4) {
        setIndex(i => i + 1);
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

      if (etapa === "ditado") {
        setEtapa("corretoIncorreto");
        setIndex(0);
        return;
      }

    }, delay);
  };

  // -----------------------------------------------
  // RENDERIZAÇÃO DO COMPONENTE
  // -----------------------------------------------
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
          <Text style={{ fontSize: 36, color: '#9a5fcc', marginVertical: 20 }}>
            {atual.incompleta}
          </Text>

          <LargeButton
            title="🔊 Ouvir Palavra"
            color="#ec707a"
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
            color="#ec707a"
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
            color="#ec707a"
            onPress={() => Speech.speak(atual.fala, { language: 'pt-BR' })}
          />
        </>
      )}

      {/* CORRETO OU INCORRETO */}
      {etapa === 'corretoIncorreto' && (
        <>
          <Image
            source={atual.imagem}
            style={{
              width: 220,
              height: 180,
              marginVertical: 20,
              borderRadius: 12,
            }}
            resizeMode="contain"
          />

          <Text style={{ fontSize: 32, color: '#9a5fcc', marginBottom: 20 }}>
            {atual.exibida}
          </Text>

          <LargeButton
            title="🔊 Ouvir Pergunta"
            color="#ec707a"
            onPress={() =>
              Speech.speak("Essa palavra está escrita corretamente?", {
                language: "pt-BR",
              })
            }
          />
        </>
      )}

      {/* GRID DE OPÇÕES */}
<View
  style={{
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  }}
>
  <View
    style={{
      width: "85%",
      flexDirection: opcoes.length === 2 ? "column" : "row",
      flexWrap: opcoes.length === 2 ? "nowrap" : "wrap",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {opcoes.map((op, idx) => (
      <View
        key={idx}
        style={{
          width: opcoes.length === 2 ? "100%" : "48%",
          marginVertical: opcoes.length === 2 ? 6 : "1%",
          alignItems: "center",
        }}
      >
        <LargeButton
          title={op}
          color="#9a5fcc"
          onPress={() => verificar(op)}
          disabled={respondido}
          style={{ width: "100%" }}
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
        color="#4A88E0"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
