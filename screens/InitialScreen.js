// src/screens/InitialScreen.js
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useTTS from '../utils/useTTS';

export default function InitialScreen({ navigation }) {
  const { speak } = useTTS();

  useEffect(() => {
    // fala só ao entrar na tela
    speak('Bem vindo. Toque em 1 para cadastrar-se e configurar seu PIN ou biometria. Ou toque em 2 para fazer login e entrar no aplicativo.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakAndNavigate = (text, route) => {
    speak(text);
    // delay curto para a fala iniciar antes da navegação
    setTimeout(() => navigation.navigate(route), 700);
  };

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDF7', padding:20}}>
      <TouchableOpacity
        onPress={() => speakAndNavigate('Você escolheu cadastrar-se.', 'PinSetup')}
        style={{ backgroundColor:'#6C63FF', padding:20, borderRadius:12, width:'90%', marginBottom:16, alignItems:'center' }}>
        <Text style={{ fontSize:22, color:'#fff' }}>1. Cadastre-se</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => speakAndNavigate('Você escolheu fazer login. Vamos para a tela de login.', 'Login')}
        style={{ backgroundColor:'#FFB703', padding:20, borderRadius:12, width:'90%', alignItems:'center' }}>
        <Text style={{ fontSize:22, color:'#000' }}>2. Fazer Login</Text>
      </TouchableOpacity>
    </View>
  );
}
