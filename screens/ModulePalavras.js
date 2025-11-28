import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
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

  // Funções para controle de áudio
  const falarConteudo = () => {
    Speech.stop();
    if (etapa === 'palavras' || etapa === 'ditado') {
      Speech.speak(atual.fala, { language: 'pt-BR', rate: 0.8 });
    } else if (etapa === 'imagens') {
      Speech.speak('O que é isso?', { language: 'pt-BR', rate: 0.8 });
    } else if (etapa === 'corretoIncorreto') {
      Speech.speak('Essa palavra está escrita corretamente?', { 
        language: 'pt-BR', 
        rate: 0.8 
      });
    }
  };

  const falarOpcao = (opcao, numero) => {
    Speech.stop();
    Speech.speak(`Opção ${numero}: ${opcao}`, { 
      language: 'pt-BR', 
      rate: 0.7 
    });
  };

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
      Speech.speak(atual.fala, { language: 'pt-BR', rate: 0.8 });
    } else if (etapa === 'imagens') {
      Speech.speak('O que é isso?', { language: 'pt-BR', rate: 0.8 });
    } else if (etapa === 'ditado') {
      Speech.speak(atual.fala, { language: 'pt-BR', rate: 0.8 });
    } else if (etapa === 'corretoIncorreto') {
      Speech.speak('Essa palavra está escrita corretamente?', {
        language: 'pt-BR',
        rate: 0.8
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
    <View style={styles.container}>
      {/* SETA VOLTAR */}
      <TouchableOpacity 
        style={styles.botaoVoltarSeta}
        onPress={() => {
          Speech.stop();
          navigation.goBack();
        }}
      >
        <Text style={styles.botaoVoltarTextoSeta}>←</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>
        Módulo: Português
      </Text>

      <Text style={styles.contador}>
        Exercício {exercicioAtual} de {totalExercicios}
      </Text>

      {/* PALAVRAS */}
      {etapa === 'palavras' && (
        <>
          <Text style={styles.palavraIncompleta}>
            {atual.incompleta}
          </Text>

          {/* BOLINHAS DE CONTROLE DE ÁUDIO */}
          <View style={styles.controlesContainer}>
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#4CAF50'}]}
              onPress={falarConteudo}
            >
              <Text style={styles.bolinhaTexto}>🔊</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#F44336'}]}
              onPress={() => Speech.stop()}
            >
              <Text style={styles.bolinhaTexto}>🔇</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* IMAGENS */}
      {etapa === 'imagens' && (
        <>
          <Image
            source={atual.src}
            style={styles.imagem}
            resizeMode="contain"
          />

          {/* BOLINHAS DE CONTROLE DE ÁUDIO */}
          <View style={styles.controlesContainer}>
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#4CAF50'}]}
              onPress={falarConteudo}
            >
              <Text style={styles.bolinhaTexto}>🔊</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#F44336'}]}
              onPress={() => Speech.stop()}
            >
              <Text style={styles.bolinhaTexto}>🔇</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* DITADO */}
      {etapa === 'ditado' && (
        <>
          <Text style={styles.instrucaoDitado}>
            Ouça e Escolha:
          </Text>

          {/* BOLINHAS DE CONTROLE DE ÁUDIO */}
          <View style={styles.controlesContainer}>
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#4CAF50'}]}
              onPress={falarConteudo}
            >
              <Text style={styles.bolinhaTexto}>🔊</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#F44336'}]}
              onPress={() => Speech.stop()}
            >
              <Text style={styles.bolinhaTexto}>🔇</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* CORRETO OU INCORRETO */}
      {etapa === 'corretoIncorreto' && (
        <>
          <Image
            source={atual.imagem}
            style={styles.imagem}
            resizeMode="contain"
          />

          <Text style={styles.palavraExibida}>
            {atual.exibida}
          </Text>

          {/* BOLINHAS DE CONTROLE DE ÁUDIO */}
          <View style={styles.controlesContainer}>
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#4CAF50'}]}
              onPress={falarConteudo}
            >
              <Text style={styles.bolinhaTexto}>🔊</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bolinhaControle, {backgroundColor: '#F44336'}]}
              onPress={() => Speech.stop()}
            >
              <Text style={styles.bolinhaTexto}>🔇</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* GRID DE OPÇÕES */}
      <View style={styles.opcoesWrapper}>
        <View style={[
          styles.gridOpcoes, 
          { flexDirection: opcoes.length === 2 ? 'column' : 'row' }
        ]}>
          {opcoes.map((op, idx) => (
            <View
              key={idx}
              style={[
                styles.itemOpcao,
                { width: opcoes.length === 2 ? '100%' : '48%' }
              ]}
            >
              <LargeButton
                title={op}
                color="#9a5fcc"
                onPress={() => verificar(op)}
                onLongPress={() => falarOpcao(op, idx + 1)}
                disabled={respondido}
                style={styles.botaoOpcao}
              />
            </View>
          ))}
        </View>
      </View>

      {feedback !== '' && (
        <Text style={styles.feedback}>{feedback}</Text>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFDF7',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2C3E50',
  },
  contador: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#7F8C8D',
  },
  palavraIncompleta: {
    fontSize: 36,
    color: '#9a5fcc',
    marginVertical: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  instrucaoDitado: {
    fontSize: 24,
    marginVertical: 20,
    textAlign: 'center',
    color: '#2C3E50',
  },
  palavraExibida: {
    fontSize: 32,
    color: '#9a5fcc',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imagem: {
    width: 250,
    height: 200,
    marginVertical: 20,
    borderRadius: 12,
  },
  controlesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bolinhaControle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  bolinhaTexto: {
    fontSize: 18,
    color: 'white',
  },
  opcoesWrapper: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  gridOpcoes: {
    width: '85%',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemOpcao: {
    marginVertical: 6,
    alignItems: 'center',
  },
  botaoOpcao: {
    width: '100%',
  },
  feedback: {
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  botaoVoltarSeta: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  botaoVoltarTextoSeta: {
    color: '#4A88E0',
    fontSize: 32,
    fontWeight: 'bold',
  },
};