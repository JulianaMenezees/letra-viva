import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { palavras } from '../utils/data';

export default function ModulePalavras({ navigation }) {
  const [index, setIndex] = useState(0);
  const [resposta, setResposta] = useState('');
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [respondido, setRespondido] = useState(false);
  const timeoutRef = useRef(null);

  const atual = palavras[index];

  useEffect(() => {
    setResposta('');
    setFeedback('');
    setRespondido(false);
    Speech.speak(atual.fala, { language: 'pt-BR' });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [index]);

  const verificar = () => {
    if (respondido) return;
    setRespondido(true);

    const acertou = resposta.trim().toUpperCase() === atual.correta.toUpperCase();

    const newAcertos = acertou ? acertos + 1 : acertos;
    const newErros = acertou ? erros : erros + 1;

    if (acertou) {
      setAcertos(newAcertos);
      setFeedback('✅ Acertou!');
      Speech.speak('Parabéns, você acertou!', { language: 'pt-BR' });
    } else {
      setErros(newErros);
      setFeedback(`❌ Errou! A resposta era ${atual.correta}.`);
      Speech.speak(`A resposta correta é ${atual.fala}`, { language: 'pt-BR' });
    }

    const delay = acertou ? 1500 : 3000;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (index < 4) {
        setIndex(i => i + 1);
      } else {
        navigation.replace('Resultado', { acertos: newAcertos, erros: newErros, modulo: 'Palavras' });
      }
    }, delay);
  };

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:20, backgroundColor:'#FFFDF7' }}>
      <Text style={{ fontSize:26, fontWeight:'bold' }}>Módulo: Palavras</Text>
      <Text style={{ fontSize:20, marginTop:10 }}>Exercício {index + 1} de 5</Text>

      <Text style={{ fontSize:36, color:'#4A90E2', marginVertical:20 }}>{atual.incompleta}</Text>

      <LargeButton
        title="🔊 Ouvir Palavra"
        color="#FFB703"
        onPress={() => Speech.speak(atual.fala, { language: 'pt-BR' })}
      />

      <TextInput
        value={resposta}
        onChangeText={setResposta}
        editable={!respondido}
        placeholder="Digite a letra que falta"
        autoCapitalize="characters"
        onSubmitEditing={verificar}
        style={{
          borderWidth: 2,
          borderColor: '#4A90E2',
          borderRadius: 10,
          width: '80%',
          padding: 12,
          fontSize: 20,
          textAlign: 'center',
          marginVertical: 12,
          backgroundColor: respondido ? '#eee' : '#fff',
        }}
      />

      {!respondido && <LargeButton title="Verificar" onPress={verificar} />}

      {feedback ? <Text style={{ fontSize:20, marginTop:10 }}>{feedback}</Text> : null}

      <LargeButton title="⬅️ Voltar" color="#999" onPress={() => navigation.goBack()} />
    </View>
  );
}
