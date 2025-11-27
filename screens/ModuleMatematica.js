import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { mathActivities } from '../utils/mathData';
import LargeButton from '../components/LargeButton';

const COLORS = {
  roxo: '#9a5fcc',   
  amarelo: '#FFB703', 
  rosa: '#ec707a',
  verde: '#add778',
  fundoBotaoDesabilitado: '#ccc',
};

const { width } = Dimensions.get('window');

export default function ModuleMatematica({ navigation }) {
  const [index, setIndex] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [respondido, setRespondido] = useState(false);
  const timeoutRef = useRef(null);

  const atividade = mathActivities[index];

  useEffect(() => {
    setFeedback('');
    setRespondido(false);
    
    let instrucaoParaFalar = atividade.instrucao;
    if (atividade.tipo === 'toque_imagem') {
      instrucaoParaFalar = `${atividade.instrucao}. Toque na imagem correta.`;
    }

    Speech.speak(instrucaoParaFalar, { language: 'pt-BR' });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [index]);

  const handleResposta = (opcao) => {
    if (respondido) return;
    setRespondido(true);

    const acertou = opcao.correta;
    const newAcertos = acertou ? acertos + 1 : acertos;
    const newErros = acertou ? erros : erros + 1;

    if (acertou) {
      setAcertos(newAcertos);
      setFeedback('✅ Muito bem! Acertou!');
      Speech.speak('Muito bem, você acertou!', { language: 'pt-BR' });
    } else {
      let respostaCorretaTexto = 'Ops! Tente de novo na próxima.';
      if (atividade.tipo !== 'toque_imagem') {
        const opcaoCorreta = atividade.opcoes.find(op => op.correta);
        if (opcaoCorreta) {
            respostaCorretaTexto = `Ops! A resposta certa era ${opcaoCorreta.texto}.`;
        }
      }
      setErros(newErros);
      setFeedback(`❌ ${respostaCorretaTexto}`);
      Speech.speak(respostaCorretaTexto, { language: 'pt-BR' });
    }

    const delay = acertou ? 1500 : 3000;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      
      if (index < mathActivities.length - 1) {
        setIndex(i => i + 1);
      } else {
        navigation.replace('Resultado', { 
          acertos: newAcertos, 
          erros: newErros, 
          modulo: 'Matemática' 
        });
      }
    }, delay);
  };

  const renderOpcoes = () => {
    // --- 'toque_imagem' (Sem bordas) ---
    if (atividade.tipo === 'toque_imagem') {
      return (
        <View style={styles.imageOptionsContainer}>
          {atividade.opcoes.map((opcao) => (
            <TouchableOpacity
              key={opcao.id}
              onPress={() => handleResposta(opcao)}
              disabled={respondido}
              style={[
                styles.imageOptionWrapper, 
                respondido && { opacity: 0.6 } 
              ]}
            >
              <Image source={opcao.imagemSrc} style={styles.imageOption} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.opcoesContainer}>
        {atividade.opcoes.map((opcao) => (
          <View key={opcao.id} style={{ width: '100%', alignItems: 'center' }}>
            <LargeButton
              title={opcao.texto}
              onPress={() => handleResposta(opcao)}
              disabled={respondido}
              color={COLORS.roxo}
              style={[
                styles.botaoTextoCustomizado,
                respondido ? { backgroundColor: COLORS.fundoBotaoDesabilitado } : {}
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.contador}>
          Atividade {index + 1} de {mathActivities.length}
        </Text>

        <Text style={styles.instrucao}>{atividade.instrucao}</Text>

        <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
            <LargeButton
            title="🔊 Ouvir de novo"
            color={COLORS.amarelo}
            onPress={() => {
                let instrucaoParaFalar = atividade.instrucao;
                if (atividade.tipo === 'toque_imagem') {
                instrucaoParaFalar = `${atividade.instrucao}. Toque na imagem correta.`;
                }
                Speech.speak(instrucaoParaFalar, { language: 'pt-BR' });
            }}
            style={{ width: '90%', maxWidth: 350 }}
            />
        </View>

        {/* --- CENTRALIZAÇÃO DA IMAGEM --- */}
        {atividade.tipo !== 'toque_imagem' && atividade.imagem && (
          <View style={styles.imagemContainer}>
             <Image source={atividade.imagem} style={styles.imagemPrincipal} />
          </View>
        )}

        {feedback ? (
          <Text style={[styles.feedback, { color: feedback.startsWith('✅') ? 'green' : 'red' }]}>
            {feedback}
          </Text>
        ) : null}

        {renderOpcoes()}
      </View>

      <View style={styles.footer}>
        <LargeButton 
            title="⬅️ Voltar ao Menu" 
            color={COLORS.roxo} 
            onPress={() => navigation.goBack()}
            style={{ width: '90%', maxWidth: 350 }} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center', 
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    width: '100%', 
  },
  contador: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
    fontWeight: '600',
    alignSelf: 'center',
    textAlign: 'center',
  },
  instrucao: {
    fontSize: 26, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    width: '100%',
  },
  imagemContainer: {
    width: '100%',
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
  },
  imagemPrincipal: {
    width: width * 0.85, 
    height: 300,
    resizeMode: 'contain',
  },
  feedback: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  opcoesContainer: {
    width: '100%',
    marginTop: 10,
    gap: 15,
    alignItems: 'center',
  },
  botaoTextoCustomizado: {
    width: '90%',     
    maxWidth: 350,
    paddingVertical: 15,
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 20,
  },
  imageOptionWrapper: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageOption: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 20,
  }
});