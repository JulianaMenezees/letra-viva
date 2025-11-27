// screens/ModuleTecnology.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { situacoesSeguranca } from '../utils/techData';

export default function ModuleTecnology({ navigation }) {
  const [index, setIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [ultimoAcerto, setUltimoAcerto] = useState(false);
  const [respondido, setRespondido] = useState(false);

  const atual = situacoesSeguranca[index];

  useEffect(() => {
    setMensagemErro("");
    setRespondido(false);
    
    // Fala a situação automaticamente
    if (atual && atual.situacao) {
      Speech.speak(atual.situacao, { 
        language: "pt-BR", 
        rate: 0.8 
      });
    }
  }, [index, atual]);

  const falarSituacao = () => {
    Speech.stop();
    if (atual && atual.situacao) {
      Speech.speak(atual.situacao, { 
        language: "pt-BR", 
        rate: 0.8 
      });
    }
  };

  const falarOpcao = (opcao, numero) => {
    Speech.stop();
    Speech.speak(`Opção ${numero}: ${opcao}`, { 
      language: "pt-BR", 
      rate: 0.7 
    });
  };

  const falarExplicacao = () => {
    Speech.stop();
    if (atual && atual.explicacao) {
      Speech.speak(atual.explicacao, { 
        language: "pt-BR", 
        rate: 0.7 
      });
    }
  };

  const verificar = (opcaoEscolhida) => {
  if (respondido) return;

  const acertou = opcaoEscolhida === atual.respostaCorreta;

  setUltimoAcerto(acertou);

  if (acertou) {
    setAcertos(a => a + 1);
    Speech.speak("Muito bem! Você se protegeu!", { 
      language: "pt-BR", 
      rate: 0.8 
    });
    setShowPopup(true);
    setRespondido(true); // Só bloqueia quando acerta
  } else {
    setErros(e => e + 1); // Armazena o erro
    Speech.speak("Essa não é a escolha mais segura. Tente outra opção.", { 
      language: "pt-BR", 
      rate: 0.8 
    });
    setMensagemErro("Tente novamente. Escolha outra opção.");
    // NÃO chama setRespondido(true) - usuário pode tentar novamente
  }
};

  const proxima = () => {
    Speech.stop();
    setShowPopup(false);
    setMensagemErro("");

    if (index + 1 < situacoesSeguranca.length) {
      setIndex(i => i + 1);
    } else {
      const porcentagem = (acertos / situacoesSeguranca.length) * 100;
      
      navigation.replace("Resultado", {
        acertos,
        erros,
        modulo: "Segurança Digital",
        aprovado: porcentagem >= 75,
        porcentagem: Math.round(porcentagem)
      });
    }
  };

  if (!atual) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Módulo: Segurança Digital</Text>
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
  <View style={styles.container}>
    {/* Seta voltar - FIXA NO CANTO */}
    <TouchableOpacity 
      style={styles.botaoVoltarSeta}
      onPress={() => {
        Speech.stop();
        navigation.goBack();
      }}
    >
      <Text style={styles.botaoVoltarTextoSeta}>←</Text>
    </TouchableOpacity>

    {/* CONTEÚDO CENTRALIZADO */}
    <View style={styles.conteudoCentral}>
      
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Módulo: Segurança Digital</Text>
        <Text style={styles.contador}>
          Situação {index + 1} de {situacoesSeguranca.length}
        </Text>
      </View>

      {/* Situação */}
      <View style={styles.situacaoContainer}>
        <Text style={styles.situacaoTexto}>{atual.situacao}</Text>
      </View>

      {/* Controles de voz */}
      <View style={styles.controlesContainer}>
        <TouchableOpacity 
          style={[styles.bolinhaControle, {backgroundColor: '#ADD778'}]}
          onPress={falarSituacao}
        >
          <Text style={styles.bolinhaTexto}>🔊</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bolinhaControle, {backgroundColor: '#EC707A'}]}
          onPress={() => Speech.stop()}
        >
          <Text style={styles.bolinhaTexto}>🔇</Text>
        </TouchableOpacity>
      </View>

      {/* Instrução */}
      <Text style={styles.instrucaoOpcoes}>
        Segure cada opção para ouvi-la. Toque para escolher.
      </Text>

      {/* Opções */}
      <View style={styles.opcoesContainer}>
        {atual.opcoes.map((opcao, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.botaoOpcao,
              respondido && opcao === atual.respostaCorreta && styles.botaoOpcaoCorreta,
              respondido && opcao !== atual.respostaCorreta && styles.botaoOpcaoErrada
            ]}
            onPress={() => verificar(opcao)}
            onLongPress={() => falarOpcao(opcao, i + 1)}
            disabled={respondido}
          >
            <Text style={styles.textoOpcao}>
              <Text style={{fontWeight: 'bold'}}>{i + 1}.</Text>
              {` ${opcao}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback */}
      {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}
    </View>

    {/* Popup */}
    <Modal visible={showPopup} transparent animationType="fade">
      <View style={styles.popupFundo}>
        <View style={styles.popup}>
          <Text style={styles.popupTitulo}>
            {ultimoAcerto ? "✅ Excelente Escolha!" : "💡 Aprenda Mais"}
          </Text>
          <Text style={styles.popupTexto}>{atual.explicacao}</Text>
          
          <LargeButton 
            title="🔊 Ouvir Explicação" 
            color="#4A88E0"
            onPress={falarExplicacao} 
          />
          
          <LargeButton 
            title="Próxima Situação ➜" 
            color="#9a5fcc"
            onPress={proxima} 
          />
        </View>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },
  conteudoCentral: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 5,
  },
  contador: {
    fontSize: 16,
    textAlign: "center",
    color: "#7F8C8D",
  },
  situacaoContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 15,
  },
  situacaoTexto: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  controlesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
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
  instrucaoOpcoes: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  opcoesContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  botaoOpcao: {
    backgroundColor: '#9a5fcc',
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9a5fcc',
    width: '100%',
    minHeight: 50,
    justifyContent: 'center',
  },
  textoOpcao: {
  fontSize: 14,
  textAlign: 'center',
  color: '#FFFFFF',
  lineHeight: 18,
  fontWeight: '500',
},
numeroOpcao: {
  fontWeight: 'bold',
  color: '#FFFFFF',
},
  textoErro: {
    color: "#E74C3C",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    fontWeight: '500',
  },
  botaoVoltarSeta: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 1,
  },
  botaoVoltarTextoSeta: {
    color: '#4A88E0',
    fontSize: 28,
    fontWeight: 'bold',
  },
  
  popupFundo: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},
popup: {
  backgroundColor: "white",
  width: "100%",
  maxWidth: 400,
  borderRadius: 15,
  padding: 25,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 8,
},
popupTitulo: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 15,
  textAlign: "center",
  color: "#2C3E50",
},
popupTexto: {
  fontSize: 16,
  marginVertical: 15,
  textAlign: "center",
  lineHeight: 22,
  color: "#5D6D7E",
},
// Estilos que estavam faltando:
numeroOpcao: {
  fontWeight: 'bold',
  color: '#9a5fcc',
},
botaoOpcaoCorreta: {
  backgroundColor: '#d4edda',
  borderColor: '#ADD778',
},
botaoOpcaoErrada: {
  backgroundColor: '#f8d7da',
  borderColor: '#EC707A',
},
subtitulo: {
  fontSize: 18,
  textAlign: "center",
  color: "#666",
  marginBottom: 30,
},
});