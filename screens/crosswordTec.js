import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import LargeButton from '../components/LargeButton';

export default function CruzadinhaTecnologia({ navigation, route }) {
  const liberado = route?.params?.liberado ?? true;

  useEffect(() => {
    if (!liberado) {
      Alert.alert(
        "Acesso bloqueado",
        "Você precisa acertar pelo menos 7 perguntas para acessar a cruzadinha.",
        [{ text: "OK", onPress: () => navigation.replace('ModuleTecnology') }]
      );
    }
  }, []);

  const palavras = [
    { id: 1, resposta: 'EMAIL' },
    { id: 2, resposta: 'CELULAR' },
    { id: 3, resposta: 'INTERNET' },
    { id: 4, resposta: 'SENHA' },
    { id: 5, resposta: 'WIFI' },
    { id: 6, resposta: 'ARQUIVO' },
  ];

  const [inputs, setInputs] = useState(palavras.map(() => ''));

  const finalizar = () => {
    navigation.replace('Resultado', {
      acertos: 0,
      erros: 0,
      modulo: 'Cruzadinha Tecnologia',
    });
  };

  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1,
      backgroundColor: '#FFFDF7',
      alignItems: 'center',
      padding: 20
    }}>
      
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Cruzadinha Final</Text>
      <Text style={{ fontSize: 18, marginVertical: 10, textAlign: 'center' }}>
        Complete as palavras abaixo.
      </Text>

      {palavras.map((p, i) => (
        <View key={p.id} style={{ marginVertical: 15, width: '100%' }}>
          <Text style={{ fontSize: 20 }}>Palavra {i + 1}:</Text>
          <TextInput
            value={inputs[i]}
            onChangeText={(t) => {
              const novo = [...inputs];
              novo[i] = t.toUpperCase();
              setInputs(novo);
            }}
            placeholder="Digite aqui"
            autoCapitalize="characters"
            style={{
              borderWidth: 2,
              borderColor: '#4A90E2',
              borderRadius: 10,
              padding: 10,
              fontSize: 22,
              textAlign: 'center',
              backgroundColor: '#fff',
              marginTop: 5
            }}
          />
        </View>
      ))}

      <LargeButton title="Finalizar" color="#4CAF50" onPress={finalizar} />
    </ScrollView>
  );
}