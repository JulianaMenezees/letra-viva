// screens/Resultado.js
import React from 'react';
import { View, Text } from 'react-native';
import LargeButton from '../components/LargeButton';
import * as Speech from 'expo-speech';

export default function Resultado({ route, navigation }) {
  const { acertos, erros, modulo } = route.params;

  React.useEffect(() => {
    Speech.speak(`Você concluiu o módulo ${modulo}.`, { language: 'pt-BR' });
    Speech.speak(`Você acertou ${acertos} e errou ${erros}.`, { language: 'pt-BR' });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFDF7',
        padding: 30,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#4A90E2', marginBottom: 20 }}>
        Resultado - {modulo}
      </Text>

      <Text style={{ fontSize: 24, color: '#333', marginBottom: 10 }}>✅ Acertos: {acertos}</Text>
      <Text style={{ fontSize: 24, color: '#333', marginBottom: 30 }}>❌ Erros: {erros}</Text>

      <LargeButton
        title="🔁 Refazer módulo"
        color="#6C63FF"
        onPress={() =>
          navigation.replace(
            modulo === 'Palavras' ? 'ModuloPalavras' : 'ModuloImagens'
          )
        }
      />

      <LargeButton
        title="🏠 Voltar ao Início"
        color="#4A90E2"
        onPress={() => navigation.navigate('Início')}
      />
    </View>
  );
}
