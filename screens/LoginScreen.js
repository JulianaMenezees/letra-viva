// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { verifyPin, isBiometryEnabled, authWithBiometrics, getToken, removeToken } from '../services/authService';
import useTTS from '../utils/useTTS';

export default function LoginScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [biometryOn, setBiometryOn] = useState(false);
  const { speak } = useTTS();

  useEffect(() => {
    (async () => {
      const enabled = await isBiometryEnabled();
      setBiometryOn(enabled);
      if (enabled) {
        speak('A autenticação por biometria está ativa. Toque para autenticar com biometria ou digite o PIN.');
      } else {
        speak('Digite seu PIN de seis dígitos, no quadradinho abaixo. Depois disso, aperte em 1. para entrar no app. Caso tenha esquecido o PIN, aperte em 2 para criar um novo.');
      }
    })();
  }, []);

  const handleBiometry = async () => {
    const ok = await authWithBiometrics('Autentique para entrar');
    if (ok) {
      // token já deve existir se registro aconteceu antes; apenas navegar para Home
      speak('Autenticado com biometria. Entrando.');
      navigation.replace('Início');
    } else {
      Alert.alert('Falha', 'Biometria não reconhecida ou cancelada.');
    }
  };

  const handlePin = async () => {
    const ok = await verifyPin(pin);
    if (ok) {
      speak('PIN correto. Entrando.');
      navigation.replace('Início');
    } else {
      speak('PIN incorreto. Digite novamente ou caso tenha esquecido, aperte no número 2. para criar um novo PIN.');
      Alert.alert('Erro', 'PIN incorreto.');
    }
  };

  const forgotPin = async () => {
    Alert.alert('2. Esqueci PIN', 'Você será desconectado e poderá registrar um novo PIN.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Redefinir',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          // opcional: limpar PINs no authService
          navigation.replace('PinSetup'); // redireciona ao fluxo de login "tradicional"
        }
      }
    ]);
  };

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center' }}>
      <Text style={{ fontSize:20, marginBottom:12 }}>Login</Text>

      {biometryOn && <Button title="Entrar com biometria" onPress={handleBiometry} />}

      <Text style={{ marginTop:12 }}>Ou digite o PIN</Text>
      <TextInput keyboardType="number-pad" maxLength={6} placeholder="******" secureTextEntry value={pin} onChangeText={setPin} style={{ borderWidth:1, padding:8, marginTop:8 }} />
      <Button title="1. Entrar" onPress={handlePin} />

      <View style={{ height:12 }} />
      <Button title="2. Esqueci PIN" color="red" onPress={forgotPin} />
    </View>
  );
}
