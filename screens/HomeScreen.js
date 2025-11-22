// screens/HomeScreen.js
import React, { useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LargeButton from '../components/LargeButton';
import useTTS from '../utils/useTTS';
import { removeToken } from '../services/authService';

export default function HomeScreen({ navigation }) {
  const { speak } = useTTS();

  // fala quando a tela fica em foco (bom para acessibilidade por áudio)
  useFocusEffect(
    useCallback(() => {
      speak('Bem-vinda(o) ao Letra Viva. Escolha um módulo para começar. Aperte em 1 para ir ao módulo de palavras. Aperte em 2 para ir ao módulo de matemática. Aperte em 4 para ir o módulo de jogos. Por fim, aperte em 5 para sair da sua conta.');
      // se quiser parar o TTS ao sair, retorne função cleanup:
      return () => {};
    }, [])
  );

const handleLogout = async () => {
  // fala primeiro (para acessibilidade)
  speak('Você apertou para sair. Deseja realmente sair da sua conta? Aperte em 1 para sair. Ou aperte em 2 para cancelar');

  // pequeno atraso só para a fala começar antes do popup
  setTimeout(() => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: '2. Cancelar', style: 'cancel' },
        {
          text: '1. Sim',
          onPress: async () => {
            await removeToken();
            navigation.replace('Inicial');
          },
          style: 'destructive',
        },
      ]
    );
  }, 500); // meio segundo
};


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF7', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#4A90E2', marginBottom: 24, textAlign: 'center' }}>
        Bem-vindo ao Letra Viva!
      </Text>
      

      <LargeButton
        title="🧩 Módulo 1: Português"
        color="#6C63FF"
        onPress={() => navigation.navigate('ModuloPalavras')}
      />

      <LargeButton
        title="🧮 Módulo 2: Matemática"
        color="#c76fa1ff"
        onPress={() => navigation.navigate('ModuleMatematica')}
      />

    <LargeButton
        title="🧮 Módulo 3: Tecnologia"
        color="#4A88E0"
        onPress={() => navigation.navigate('ModuleTecnology')}
      />
      
      <LargeButton
        title=" 🎮 Módulo 4: Jogos"
        color="#add778"
        onPress={() => navigation.navigate('ModuloJogos')}
      />

      <LargeButton
        title="⚙️ Perfil / Segurança"
        color="#8AC6D1"
        onPress={() => navigation.navigate('Perfil')}
      />

      <LargeButton
        title="🔒 5. Sair"
        color="#FF6B6B"
        onPress={handleLogout}
      />
    </View>
  );
}
