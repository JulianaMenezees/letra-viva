import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech'; // 1. Importa o Expo Speech
import { mathActivities } from '../utils/mathData';
import LargeButton from '../components/LargeButton';

export default function ModuleMatematica({ navigation }) {
  // --- Estados (igual ao ModulePalavras) ---
  const [index, setIndex] = useState(0); // Qual atividade estamos
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState(''); // "✅ Acertou!" ou "❌ Errou!"
  const [respondido, setRespondido] = useState(false); // Trava a tela após responder
  const timeoutRef = useRef(null); // Para controlar o delay

  // Pega a atividade atual do nosso mathData.js
  const atividade = mathActivities[index];

  // --- Efeito de Áudio (igual ao ModulePalavras) ---
  // Roda toda vez que o 'index' (atividade) muda
  useEffect(() => {
    // Reseta a tela
    setFeedback('');
    setRespondido(false);
    
    // 2. FALA a instrução da atividade
    // (Ex: "Quantas maçãs você vê?")
    if (atividade && atividade.instrucao) {
      Speech.speak(atividade.instrucao, { language: 'pt-BR' });
    }

    // Limpa o timeout se o usuário sair da tela
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [index]); // Dependência: Roda quando o 'index' muda

  // --- Função de Resposta (adaptada para botões) ---
  const handleResposta = (opcao) => {
    // 3. Trava a tela (igual ao ModulePalavras)
    if (respondido) return;
    setRespondido(true);

    const acertou = opcao.correta; // A lógica aqui é mais simples
    const newAcertos = acertou ? acertos + 1 : acertos;
    const newErros = acertou ? erros : erros + 1;

    if (acertou) {
      // --- Se Acertou ---
      setAcertos(newAcertos);
      setFeedback('✅ Muito bem! Acertou!');
      Speech.speak('Muito bem, você acertou!', { language: 'pt-BR' });
    } else {
      // --- Se Errou ---
      // Encontra a resposta certa para mostrar ao idoso
      const respostaCorreta = atividade.opcoes.find(op => op.correta).texto;
      setErros(newErros);
      setFeedback(`❌ Ops! A resposta certa era ${respostaCorreta}.`);
      Speech.speak(`Ops! A resposta certa era ${respostaCorreta}.`, { language: 'pt-BR' });
    }

    // --- Delay para avançar (igual ao ModulePalavras) ---
    const delay = acertou ? 1500 : 3000; // Mais tempo para ler o erro
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      
      // Verifica se tem mais atividades
      if (index < mathActivities.length - 1) {
        setIndex(i => i + 1); // Avança para próxima atividade
      } else {
        // --- Fim do Módulo ---
        // 4. Navega para Resultado (igual ao ModulePalavras)
        navigation.replace('Resultado', { 
          acertos: newAcertos, 
          erros: newErros, 
          modulo: 'Matemática' 
        });
      }
    }, delay);
  };

  return (
    <View style={styles.container}>
      {/* 5. Contador (igual ao ModulePalavras) */}
      <Text style={styles.contador}>
        Atividade {index + 1} de {mathActivities.length}
      </Text>

      {/* Instrução */}
      <Text style={styles.instrucao}>{atividade.instrucao}</Text>

      {/* 6. Botão de Ouvir (igual ao ModulePalavras) */}
      <LargeButton
        title="🔊 Ouvir de novo"
        color="#FFB703" // Cor do botão de ouvir do Módulo 1
        onPress={() => Speech.speak(atividade.instrucao, { language: 'pt-BR' })}
      />

      {/* Imagem principal (Maçãs, Gatos, etc.) */}
      <Image source={atividade.imagem} style={styles.imagemPrincipal} />

      {/* 7. Feedback de Acerto/Erro (igual ao ModulePalavras) */}
      {feedback ? (
        <Text style={[styles.feedback, { color: feedback.startsWith('✅') ? 'green' : 'red' }]}>
          {feedback}
        </Text>
      ) : null}

      {/* Área dos botões de resposta */}
      <View style={styles.opcoesContainer}>
        {atividade.opcoes.map((opcao) => (
          <LargeButton
            key={opcao.id}
            title={opcao.texto}
            // 8. Trava o botão após a resposta (igual ao ModulePalavras)
            onPress={() => handleResposta(opcao)}
            disabled={respondido}
            color="#007BFF"
            // Estilo para parecer desabilitado
            style={respondido ? { backgroundColor: '#ccc' } : {}}
          />
        ))}
      </View>

      {/* 9. Botão de Voltar (opcional, mas bom ter) */}
      <LargeButton title="⬅️ Voltar ao Menu" color="#999" onPress={() => navigation.goBack()} />
    </View>
  );
}

// Estilos (combinei os seus com os do esqueleto anterior)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    padding: 20,
  },
  contador: {
    fontSize: 20,
    color: '#555',
    position: 'absolute',
    top: 60, // Posição no topo
  },
  instrucao: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 15, // Espaçamento
  },
  imagemPrincipal: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20, // Espaço antes do feedback/botões
    borderWidth: 2,
    borderColor: '#EEE',
    borderRadius: 10,
  },
  feedback: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  opcoesContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});