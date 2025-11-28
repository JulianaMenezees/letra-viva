// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { verifyPin, isBiometryEnabled, authWithBiometrics, removeToken } from '../services/authService';
import useTTS from '../utils/useTTS';
import * as Speech from 'expo-speech';

export default function LoginScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [biometryOn, setBiometryOn] = useState(false);
  const { speak } = useTTS();

  useEffect(() => {
    (async () => {
      const enabled = await isBiometryEnabled();
      setBiometryOn(enabled);
      // if (enabled) {
      //   speak('A autenticação por biometria está ativa. Toque em 1 para autenticar com biometria ou digite o PIN.');
      // } else {
      //   speak('Digite seu PIN de seis dígitos no quadradinho abaixo. Caso tenha esquecido, aperte no botão para criar um novo PIN.');
      // }
    })();
  }, []);

  const handleBiometry = async () => {
    const ok = await authWithBiometrics('Autentique para entrar');
    if (ok) {
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
      speak('PIN incorreto. Digite novamente ou redefina seu PIN.');
      Alert.alert('Erro', 'PIN incorreto.');
    }
  };

  const forgotPin = async () => {
    Alert.alert('Redefinir PIN', 'Você será desconectado e poderá registrar um novo PIN.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Redefinir',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          navigation.replace('PinSetup');
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f8f8' }}>

      {/* Cabeçalho: Bem-vindo à esquerda, Botões de áudio à direita */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>

        {/* Texto Bem-vindo */}
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: '#6b6f76',
          textAlign: 'left', // Texto à esquerda
        }}>
          Bem-vindo
        </Text>

        {/* Botões de áudio */}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => speak(' Toque em 1 para logar com a sua biometria cadastrada. Em 2. você pode digitar seu PIN de seis números no quadradinho abaixo. E Para confirmar, aperte em 3. Caso tenha esquecido o PIN, aperte em 4 para criar um novo.')}
            style={{ marginRight: 12 }}
          >
            <Text style={{ fontSize: 28, top: 10 }}>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Speech.stop()}
          >
            <Text style={{ fontSize: 27, top: 13}}>🔇</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Biometria */}
      {biometryOn && (
        <TouchableOpacity
          onPress={handleBiometry}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#add778',
            paddingVertical: 14,
            borderRadius: 12,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
            elevation: 2,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>1. Entrar com Biometria</Text>
        </TouchableOpacity>
      )}

      {/* Card do PIN */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>2. Digite seu PIN</Text>
        <TextInput
          value={pin}
          onChangeText={t => setPin(t.replace(/[^0-9]/g, ''))}
          maxLength={6}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          secureTextEntry
          placeholder="******"
          style={{
            borderWidth: 0,
            backgroundColor: '#f7f7f7',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 12,
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 16,
          }}
        />

        <TouchableOpacity
          onPress={handlePin}
          style={{
            backgroundColor: '#9B64CC',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginBottom: 12,
            opacity: pin.length === 6 ? 1 : 0.5,
          }}
          disabled={pin.length !== 6}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>3. Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={forgotPin}
          style={{
            alignItems: 'center',
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: 'red', fontWeight: '600', fontSize: 16 }}>4. Esqueci meu PIN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>


  );
}
