// screens/HomeScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import LargeButton from '../components/LargeButton';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDF7' }}>
      <Text style={{ fontSize:28, fontWeight:'bold', color:'#4A90E2', marginBottom:30 }}>
        Bem-vindo ao Letra Viva!
      </Text>

      <LargeButton
        title="🧩 Módulo 1: Palavras"
        color="#6C63FF"
        onPress={() => navigation.navigate('ModuloPalavras')}
      />

      <LargeButton
        title="🖼️ Módulo 2: Imagens"
        color="#FFB703"
        onPress={() => navigation.navigate('ModuloImagens')}
      />
    </View>
  );
}
