// screens/ModuleTecnology.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { techActivities } from '../utils/techData';

export default function ModuleTecnology({ navigation }) {
  const [index, setIndex] = useState(0);
  const [resposta, setResposta] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [ultimoAcerto, setUltimoAcerto] = useState(false);

  const atual = techActivities[index];

  const normalizar = (txt) => {
    if (!txt) return '';
    return String(txt)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  };

  useEffect(() => {
    setResposta("");
    setMensagemErro("");
    // REMOVIDA a fala automática aqui
  }, [index, atual]);

  const falarPalavra = () => {
    Speech.stop(); // Para qualquer fala anterior
    if (atual && atual.fala) {
      Speech.speak(atual.fala, { 
        language: "pt-BR", 
        rate: 0.8 
      });
    }
  };

  const falarExplicacao = () => {
    Speech.stop(); // Para qualquer fala anterior
    if (atual && atual.explicacao) {
      Speech.speak(atual.explicacao, { 
        language: "pt-BR", 
        rate: 0.7 
      });
    }
  };

  const falarFeedback = (mensagem) => {
    Speech.stop(); // Para qualquer fala anterior
    Speech.speak(mensagem, { 
      language: "pt-BR", 
      rate: 0.8 
    });
  };

  const verificar = () => {
    if (!atual) return;

    const respostaNormalizada = normalizar(resposta);
    const palavraNormalizada = normalizar(atual.palavra);
    const acertou = respostaNormalizada === palavraNormalizada;

    setUltimoAcerto(acertou);

    if (acertou) {
      setAcertos(a => a + 1);
      falarFeedback("Muito bem! Você acertou!");
      setShowPopup(true);
      
      setTimeout(() => {
        falarExplicacao();
      }, 1500);
    } else {
      setErros(e => e + 1);
      falarFeedback("Resposta incorreta!");
      setMensagemErro("Resposta incorreta, tente novamente.");
    }
  };

  const proxima = () => {
    Speech.stop(); // Para fala ao mudar de tela
    setShowPopup(false);
    setMensagemErro("");

    if (index + 1 < techActivities.length) {
      setIndex(i => i + 1);
    } else {
      const porcentagem = (acertos / techActivities.length) * 100;
      
      navigation.replace("Resultado", {
        acertos,
        erros,
        modulo: "Tecnologia",
        aprovado: porcentagem >= 75,
        porcentagem: Math.round(porcentagem)
      });
    }
  };

  if (!atual) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Módulo: Tecnologia</Text>
        <Text style={styles.subtitulo}>Carregando...</Text>
        <LargeButton 
          title="Voltar ao Início" 
          color="#4A88E0"
          onPress={() => navigation.goBack()} 
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* SETA VOLTAR */}
        <TouchableOpacity 
          style={styles.botaoVoltarSeta}
          onPress={() => {
            Speech.stop(); // Para fala ao voltar
            navigation.goBack();
          }}
        >
          <Text style={styles.botaoVoltarTextoSeta}>←</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Módulo: Tecnologia</Text>

        <Text style={styles.contador}>
          Exercício {index + 1} de {techActivities.length}
        </Text>

        {/* PALAVRA PARA O USUÁRIO ESCREVER */}
        <Text style={styles.palavra}>{atual.palavra}</Text>

        {/* BOTÃO OUVIR - AGORA CONTROLADO MANUALMENTE */}
        <LargeButton
          title="🔊 Ouvir Palavra"
          color="#ec707a"
          onPress={falarPalavra}
        />

        {/* INPUT PARA DIGITAR */}
        <TextInput
          value={resposta}
          onChangeText={setResposta}
          placeholder="Digite a palavra igual"
          autoCapitalize="characters"
          style={styles.input}
        />

        {/* BOTÃO VERIFICAR */}
        <LargeButton 
          title="Verificar" 
          color="#9a5fcc"
          onPress={verificar} 
          disabled={!resposta.trim()} 
        />

        {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}

        {/* POPUP DE EXPLICAÇÃO */}
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.popupFundo}>
            <View style={styles.popup}>
              <Text style={styles.popupTitulo}>
                {ultimoAcerto ? "✅ Acertou!" : "❌ Errou"}
              </Text>
              <Text style={styles.popupTexto}>{atual.explicacao}</Text>
              
              <LargeButton 
                title="🔊 Ouvir Explicação" 
                color="#4A88E0"
                onPress={falarExplicacao} 
              />
              
              <LargeButton 
                title="Continuar ➜" 
                color="#9a5fcc"
                onPress={proxima} 
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#2C3E50",
  },
  contador: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: "center",
    color: "#7F8C8D",
  },
  palavra: {
    fontSize: 36,
    color: "#9a5fcc",
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "#9a5fcc",
    borderRadius: 10,
    width: "80%",
    padding: 15,
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 20,
    color: "#2C3E50",
  },
  textoErro: {
    color: "#E74C3C",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  popupFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  popupTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  popupTexto: {
    fontSize: 18,
    marginVertical: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  botaoVoltarSeta: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  botaoVoltarTextoSeta: {
    color: '#4A88E0',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
});