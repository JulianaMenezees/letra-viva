// screens/ModuleTecnology.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { techActivities, techSituacoes } from '../utils/techData';

export default function ModuleTecnology({ navigation }) {
  // Unifica todas as questões
  const todasQuestoes = [
    ...(Array.isArray(techActivities) ? techActivities.map(q => ({ ...q, tipo: 'atividade' })) : []),
    ...(Array.isArray(techSituacoes) ? techSituacoes.map(q => ({ ...q, tipo: 'situacao' })) : []),
  ];

  const [index, setIndex] = useState(0);
  const [resposta, setResposta] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);

  const atual = todasQuestoes[index] ?? null;

  const normalizar = (txt) => txt?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  // Fala automática quando a questão muda
  useEffect(() => {
    setResposta('');
    setMensagemErro('');
    if (atual) {
      Speech.speak(atual.fala ?? atual.pergunta ?? '', { language: 'pt-BR' });
    }
  }, [index]);

  // Verifica resposta
  const verificar = (opcao = null) => {
    if (!atual) return;

    let acertou = false;

    if (atual.tipo === 'atividade') {
      acertou = normalizar(resposta) === normalizar(atual.palavra);
    } else if (atual.tipo === 'situacao') {
      acertou = opcao === (atual.correta ?? '');
    }

    if (acertou) {
      setAcertos(prev => prev + 1);
      Speech.speak('Muito bem! Você acertou.', { language: 'pt-BR' });
      setShowPopup(true);
    } else {
      setErros(prev => prev + 1);
      Speech.speak('Resposta incorreta!', { language: 'pt-BR' });
      if (atual.tipo === 'atividade') setMensagemErro('Resposta incorreta, tente novamente.');
    }
  };

  // Avança para a próxima questão
  const proximaQuestao = () => {
    setShowPopup(false);
    setMensagemErro('');

    if (index + 1 < todasQuestoes.length) {
      setIndex(prev => prev + 1);
    } else {
      const total = todasQuestoes.length;
      const porcentagem = (acertos / total) * 100;

      navigation.replace("Resultado", {
        acertos,
        erros,
        modulo: "Tecnologia",
        aprovado: porcentagem >= 75,
        porcentagem
      });
    }
  };

  if (!atual) return (
    <View style={styles.container}>
      <Text>Carregando questões...</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Módulo: Tecnologia</Text>
      <Text style={styles.subtitulo}>Questão {index + 1} de {todasQuestoes.length}</Text>

      {/* Atividade de digitar palavra */}
      {atual.tipo === 'atividade' && (
        <>
          <Text style={styles.palavra}>{atual.palavra ?? ''}</Text>
          <LargeButton
            title="🔊 Ouvir Palavra"
            color="#FFB703"
            onPress={() => Speech.speak(atual.fala ?? '', { language: 'pt-BR' })}
          />
          <TextInput
            value={resposta}
            onChangeText={setResposta}
            placeholder="Digite a palavra igual"
            autoCapitalize="characters"
            style={styles.input}
          />
          <LargeButton title="Verificar" onPress={() => verificar()} />
          {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}
        </>
      )}

      {/* Situação de escolha múltipla */}
      {atual.tipo === 'situacao' && Array.isArray(atual.opcoes) && (
        <>
          <Text style={styles.situacaoPergunta}>{atual.pergunta ?? ''}</Text>
          {atual.opcoes.map((opc, i) => (
            <TouchableOpacity key={i} style={styles.botaoOpcao} onPress={() => verificar(opc)}>
              <Text style={styles.textoOpcao}>{opc ?? ''}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Popup de explicação */}
      {showPopup && (
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.popupFundo}>
            <View style={styles.popup}>
              <Text style={styles.popupTitulo}>Explicação</Text>
              <Text style={styles.popupTexto}>{atual.explicacao ?? ''}</Text>
              <LargeButton title="Continuar ➜" color="#4CAF50" onPress={proximaQuestao} />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFFDF7', padding: 20, alignItems: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { fontSize: 18, marginBottom: 20 },
  palavra: { fontSize: 40, color: '#4A90E2', fontWeight: 'bold', marginBottom: 20 },
  situacaoPergunta: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  botaoOpcao: { width: '90%', padding: 15, borderWidth: 2, borderColor: '#4A90E2', borderRadius: 12, backgroundColor: '#fff', marginVertical: 8 },
  textoOpcao: { fontSize: 18, textAlign: 'center' },
  input: { borderWidth: 2, borderColor: '#4A90E2', borderRadius: 10, width: '80%', padding: 12, fontSize: 20, textAlign: 'center', backgroundColor: '#fff', marginVertical: 15 },
  textoErro: { color: 'red', fontSize: 16, marginTop: 10 },
  popupFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popup: { backgroundColor: 'white', width: '80%', borderRadius: 15, padding: 20, alignItems: 'center' },
  popupTitulo: { fontSize: 22, fontWeight: 'bold' },
  popupTexto: { fontSize: 18, marginVertical: 15, textAlign: 'center' },
});
