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

    if (atual && atual.fala) {
      Speech.speak(atual.fala, { 
        language: "pt-BR", 
        rate: 0.8 
      });
    }
  }, [index, atual]);

  const falarExplicacao = () => {
    if (atual && atual.explicacao) {
      Speech.speak(atual.explicacao, { 
        language: "pt-BR", 
        rate: 0.7 
      });
    }
  };

  const verificar = () => {
    if (!atual) return;

    const respostaNormalizada = normalizar(resposta);
    const palavraNormalizada = normalizar(atual.palavra);
    const acertou = respostaNormalizada === palavraNormalizada;

    setUltimoAcerto(acertou);

    if (acertou) {
      setAcertos(a => a + 1);
      Speech.speak("Muito bem! Você acertou! Parabéns!", { 
        language: "pt-BR", 
        rate: 0.8 
      });
      setShowPopup(true);
      
      setTimeout(() => {
        falarExplicacao();
      }, 2000);
    } else {
      setErros(e => e + 1);
      Speech.speak("Vamos tentar novamente. Resposta incorreta.", { 
        language: "pt-BR", 
        rate: 0.8 
      });
      setMensagemErro("Não está correto. Tente digitar novamente com calma.");
    }
  };

  const proxima = () => {
    setShowPopup(false);
    setMensagemErro("");

    if (index + 1 < techActivities.length) {
      setIndex(i => i + 1);
    } else {
      const porcentagem = (acertos / techActivities.length) * 100;
      
      let mensagemFinal = "";
      if (porcentagem >= 90) {
        mensagemFinal = "Excelente! Você dominou a tecnologia!";
      } else if (porcentagem >= 75) {
        mensagemFinal = "Muito bom! Você está se saindo muito bem!";
      } else {
        mensagemFinal = "Bom trabalho! Continue praticando, você está evoluindo!";
      }

      Speech.speak(mensagemFinal, { language: "pt-BR", rate: 0.8 });

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
        <Text style={styles.mensagemCarinhosa}>Carregando sua próxima atividade...</Text>
        <LargeButton 
          title="Voltar ao Início" 
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
        <Text style={styles.titulo}>Módulo: Tecnologia</Text>

        <Text style={styles.instrucaoPrincipal}>📝 Escreva a palavra que você ouviu</Text>

        <Text style={styles.contador}>
          Atividade {index + 1} de {techActivities.length}
        </Text>

        <View style={styles.conteudoCentralizado}>
          <Text style={styles.palavraGrande}>{atual.palavra}</Text>

          <LargeButton
            title="🔊 Ouvir Novamente"
            color="#FFB703"
            onPress={() => {
              Speech.speak(atual.fala, { 
                language: "pt-BR", 
                rate: 0.8 
              });
            }}
          />

          <Text style={styles.instrucaoInput}>Digite a palavra igual ao exemplo acima:</Text>
          
          <TextInput
            value={resposta}
            onChangeText={setResposta}
            placeholder="Digite aqui..."
            autoCapitalize="characters"
            style={styles.inputGrande}
            placeholderTextColor="#999"
          />

          <LargeButton 
            title="✅ Verificar Resposta" 
            onPress={verificar} 
            disabled={!resposta.trim()} 
          />

          {mensagemErro ? (
            <Text style={styles.textoErroSuave}>{mensagemErro}</Text>
          ) : (
            <Text style={styles.dica}>Dica: Escreva com calma, letra por letra</Text>
          )}
        </View>

        {/* POPUP DE FEEDBACK COM EXPLICAÇÃO */}
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.popupFundo}>
            <View style={styles.popup}>
              <Text style={styles.popupTitulo}>
                {ultimoAcerto ? "🎉 Parabéns! Acertou!" : "💡 Vamos Aprender"}
              </Text>
              
              <Text style={styles.popupExplicacao}>{atual.explicacao}</Text>
              
              <View style={styles.botoesPopup}>
                <LargeButton 
                  title="🔊 Ouvir Explicação" 
                  color="#2196F3"
                  onPress={falarExplicacao} 
                />
                
                <LargeButton 
                  title="Continuar ➜" 
                  color="#4CAF50" 
                  onPress={proxima} 
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* BOTÃO VOLTAR */}
        <View style={styles.botaoVoltarContainer}>
          <LargeButton 
            title="Voltar ao Início" 
            color="#999"
            onPress={() => navigation.goBack()} 
          />
        </View>
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
    padding: 25,
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2C3E50",
  },
  instrucaoPrincipal: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#4A90E2",
  },
  contador: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
    color: "#7F8C8D",
    fontWeight: "500",
  },
  mensagemCarinhosa: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontStyle: 'italic',
  },
  conteudoCentralizado: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  palavraGrande: {
    fontSize: 48,
    color: "#4A90E2",
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    letterSpacing: 2,
  },
  instrucaoInput: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    color: "#5D6D7E",
    fontWeight: "500",
  },
  inputGrande: {
    borderWidth: 3,
    borderColor: "#4A90E2",
    borderRadius: 15,
    width: "90%",
    padding: 18,
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 20,
    color: "#2C3E50",
  },
  dica: {
    fontSize: 16,
    marginTop: 15,
    textAlign: "center",
    color: "#27AE60",
    fontStyle: 'italic',
  },
  textoErroSuave: {
    color: "#E74C3C",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    fontStyle: 'italic',
  },
  popupFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popup: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  popupTitulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2C3E50",
  },
  popupExplicacao: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: "center",
    lineHeight: 26,
    color: "#5D6D7E",
  },
  botoesPopup: {
    width: '100%',
    gap: 10,
  },
  botaoVoltarContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
});