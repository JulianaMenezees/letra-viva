import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput } from 'react-native';
import * as Speech from 'expo-speech';
import LargeButton from '../components/LargeButton';
import { imagens } from '../utils/data';

export default function ModuleImagens({ navigation }) {
  const [idx, setIdx] = useState(0);
  const [resposta, setResposta] = useState('');
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [respondido, setRespondido] = useState(false);
  const timeoutRef = useRef(null);

  const atual = imagens[idx];

  useEffect(() => {
    setResposta('');
    setFeedback('');
    setRespondido(false);
    Speech.speak('O que é isso?', { language: 'pt-BR' });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [idx]);

  const verificar = () => {
    if (respondido) return;
    setRespondido(true);

    const acertou = resposta.trim().toUpperCase() === atual.nome.toUpperCase();

    // Calcula valores finais localmente
    const newAcertos = acertou ? acertos + 1 : acertos;
    const newErros = acertou ? erros : erros + 1;

    // Atualiza estado
    if (acertou) {
      setAcertos(newAcertos);
      setFeedback('✅ Acertou!');
      Speech.speak('Parabéns, você acertou!', { language: 'pt-BR' });
    } else {
      setErros(newErros);
      setFeedback(`❌ Errou! Era ${atual.nome}.`);
      Speech.speak(`A resposta correta é ${atual.nome}`, { language: 'pt-BR' });
    }

    // Avança automaticamente: 1.5s se acertou, 3s se errou
    const delay = acertou ? 1500 : 3000;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      // Se ainda houver exercícios (limitando a 5 exercícios: índices 0..4)
      if (idx < 4) {
        setIdx(i => i + 1);
      } else {
        // Navega para Resultado passando os valores calculados (garante precisão)
        navigation.replace('Resultado', { acertos: newAcertos, erros: newErros, modulo: 'Imagens' });
      }
    }, delay);
  };

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:20, backgroundColor:'#FFFDF7' }}>
      <Text style={{ fontSize:26, fontWeight:'bold' }}>Módulo: Imagens</Text>
      <Text style={{ fontSize:20, marginTop:10 }}>Exercício {idx + 1} de 5</Text>

      <Image source={atual.src} style={{ width:250, height:200, marginVertical:20, borderRadius:12 }} resizeMode="contain" />

      <LargeButton
        title="🔊 Ouvir Pergunta"
        color="#FFB703"
        onPress={() => Speech.speak('O que é isso?', { language: 'pt-BR' })}
      />

      <TextInput
        value={resposta}
        onChangeText={setResposta}
        editable={!respondido}
        placeholder="Digite o nome do objeto"
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
          backgroundColor: respondido ? '#eee' : '#fff'
        }}
      />

      {!respondido && <LargeButton title="Verificar" onPress={verificar} />}

      {feedback ? <Text style={{ fontSize:20, marginTop:10 }}>{feedback}</Text> : null}

      <LargeButton title="⬅️ Voltar" color="#999" onPress={() => navigation.goBack()} />
    </View>
  );
}
