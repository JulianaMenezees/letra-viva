import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { techActivities } from '../utils/techData';
import LargeButton from '../components/LargeButton';

export default function ModuleTecnology({ navigation }) {

  const [index, setIndex] = useState(0);
  const [resposta, setResposta] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);

  const atual = techActivities[index];

  // 🔤 Normaliza texto para comparação justa
  const normalizar = (txt) =>
    txt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  useEffect(() => {
    setResposta('');
    setMensagemErro('');
    Speech.speak(atual.fala, { language: 'pt-BR' });
  }, [index]);

  const verificar = () => {
    const digitado = normalizar(resposta);
    const esperado = normalizar(atual.palavra);

    if (digitado === esperado) {
      setAcertos(prev => prev + 1);
      setShowPopup(true);
      Speech.speak('Muito bem!', { language: 'pt-BR' });
    } else {
      const novoErro = erros + 1;
      setErros(novoErro);

      Speech.speak(
        'Ops, algo deu errado, mas tudo bem, vamos tentar novamente!',
        { language: 'pt-BR' }
      );

      setMensagemErro('Resposta incorreta, tente novamente.');

      if (novoErro >= 3) {
        navigation.replace('Resultado', {
          acertos,
          erros: novoErro,
          modulo: 'Tecnologia',
        });
      }
    }
  };

  const proxima = () => {
    setShowPopup(false);

    // 👉 Última questão
    if (index === techActivities.length - 1) {

  const totalAcertos = acertos; // <-- CORRETO AGORA

  if (totalAcertos >= 7) {
        navigation.replace('CruzadinhaTecnologia', { liberado: true });
      } else {
        navigation.replace('Resultado', {
          acertos: totalAcertos,
          erros,
          modulo: 'Tecnologia',
        });
      }
      return;
  }

    // 👉 AVANÇA NORMALMENTE
    setIndex(index + 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Módulo: Tecnologia</Text>
      <Text style={styles.subtitulo}>
        Exercício {index + 1} de {techActivities.length}
      </Text>

      <Text style={styles.palavra}>{atual.palavra}</Text>

      <LargeButton
        title="🔊 Ouvir Palavra"
        color="#FFB703"
        onPress={() => Speech.speak(atual.fala, { language: 'pt-BR' })}
      />

      <TextInput
        value={resposta}
        onChangeText={setResposta}
        placeholder="Digite a palavra igual"
        autoCapitalize="characters"
        style={styles.input}
      />

      <LargeButton title="Verificar" onPress={verificar} />

      {mensagemErro.length > 0 && (
        <Text style={styles.textoErro}>{mensagemErro}</Text>
      )}

      {/* POPUP */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.popupFundo}>
          <View style={styles.popup}>
            <Text style={styles.popupTitulo}>{atual.palavra}</Text>
            <Text style={styles.popupTexto}>{atual.explicacao}</Text>

            <LargeButton
              title="Continuar ➜"
              color="#4CAF50"
              onPress={proxima}
            />
          </View>
        </View>
      </Modal>

      <LargeButton title="⬅️ Voltar" color="#999" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFDF7',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titulo: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { fontSize: 18, marginBottom: 20 },
  palavra: { fontSize: 40, color: '#4A90E2', fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 10,
    width: '80%',
    padding: 12,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginVertical: 15,
  },
  textoErro: { color: 'red', fontSize: 16, marginTop: 10 },
  popupFundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
  popup: {
    backgroundColor: 'white', width: '80%',
    borderRadius: 15, padding: 20, alignItems: 'center'
  },
  popupTitulo: { fontSize: 22, fontWeight: 'bold' },
  popupTexto: { fontSize: 18, marginVertical: 15, textAlign: 'center' },
});
