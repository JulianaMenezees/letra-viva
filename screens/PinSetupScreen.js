// src/screens/PinSetupScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert, Platform, ScrollView } from 'react-native';
import { savePin, setBiometry, canUseBiometry, authWithBiometrics, isBiometryEnabled } from '../services/authService';
import useTTS from '../utils/useTTS';
import * as Speech from 'expo-speech';

export default function PinSetupScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [biometry, setBiometryState] = useState(false);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const { speak } = useTTS();

  useEffect(() => {
    (async () => {
      try {
        const ok = await canUseBiometry();
        setBiometryAvailable(ok);
        const enabled = await isBiometryEnabled();
        setBiometryState(enabled && ok);
      } catch (e) {
        console.warn('Erro ao verificar biometria', e);
        setBiometryAvailable(false);
        setBiometryState(false);
      }
    })();

    setTimeout(() => speak(
      'Agora vamos configurar um PIN de seis dígitos. Digite o mesmo PIN nos dois quadradinhos abaixo. Você também pode ativar a biometria, caso o seu celular permita.'
    ), 300);
  }, []);

  const validatePin = (p) => /^\d{6}$/.test(p);

  const handleToggleBiometry = async (value) => {
    if (value) {
      if (!biometryAvailable) {
        Alert.alert('Biometria indisponível', 'Seu celular não suporta ou não tem biometria cadastrada.');
        return;
      }
      speak('Para ativar biometria, confirme com sua impressão digital ou rosto.');
      const ok = await authWithBiometrics('Confirme para ativar biometria');
      if (ok) {
        setBiometryState(true);
        speak('Biometria ativada localmente. Salve para persistir a configuração.');
        Alert.alert('OK', 'Biometria confirmada. Salve para finalizar.');
      } else {
        setBiometryState(false);
        Alert.alert('Falha', 'Biometria não confirmada.');
      }
    } else {
      setBiometryState(false);
      speak('Biometria desativada localmente. Salve para confirmar.');
    }
  };

  const handleTestBiometry = async () => {
    if (!biometryAvailable) {
      Alert.alert('Indisponível', 'Biometria não está disponível neste dispositivo.');
      return;
    }
    speak('Teste de biometria: aproxime seu dedo ou rosto do sensor.');
    const ok = await authWithBiometrics('Teste: autentique-se');
    if (ok) {
      Alert.alert('Sucesso', 'Biometria reconhecida.');
      speak('Biometria reconhecida.');
    } else {
      Alert.alert('Falha', 'Biometria falhou ou foi cancelada.');
      speak('Biometria falhou ou foi cancelada.');
    }
  };

  const handleSave = async () => {
    if (!validatePin(pin)) {
      speak('Erro. O PIN deve ter exatamente 6 dígitos numéricos.');
      return Alert.alert('Erro', 'PIN deve ter 6 dígitos.');
    }
    if (pin !== confirm) {
      speak('Erro. PIN e confirmação não coincidem.');
      return Alert.alert('Erro', 'PIN e confirmação não coincidem.');
    }

    try {
      setSaving(true);
      await savePin(pin);
      await setBiometry(!!biometry);
      speak('PIN salvo com sucesso. Você será levado para a tela de login.');
      setTimeout(() => navigation.replace('Login'), 600);
    } catch (e) {
      console.error('savePin error', e);
      Alert.alert('Erro', 'Não foi possível salvar o PIN. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
      }}
    >
      {/* Título + botões de áudio */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 26,
          fontWeight: '700',
          color: '#6b6f76',
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 3,
          flex: 1,
        }}>
          Crie seu PIN
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => speak('Vamos configurar o PIN')} style={{ marginHorizontal: 6 }}>
            <Text style={{ fontSize: 28 }}>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Speech.stop()} style={{ marginHorizontal: 6 }}>
            <Text style={{ fontSize: 28 }}>🔇</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Digite o mesmo PIN nos dois campos abaixo. Você também pode ativar a biometria.
      </Text>

      {/* Inputs PIN */}
      <TextInput
        value={pin}
        onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        maxLength={6}
        placeholder="******"
        secureTextEntry
        style={{
          borderWidth: 0,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 12,
          fontSize: 20,
          marginBottom: 12,
          textAlign: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: 3,
        }}
      />

      <TextInput
        value={confirm}
        onChangeText={(t) => setConfirm(t.replace(/[^0-9]/g, ''))}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        maxLength={6}
        placeholder="Confirme o PIN"
        secureTextEntry
        style={{
          borderWidth: 0,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 12,
          fontSize: 20,
          marginBottom: 20,
          textAlign: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: 3,
        }}
      />

      {/* Cartão de Biometria */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,
        backgroundColor: 'rgba(254, 231, 141, 0.7)', // 0.7 = 70% opaco
      }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
          1. Ativar biometria {biometryAvailable ? '' : '(indisponível)'}
        </Text>
        <Switch value={biometry} onValueChange={handleToggleBiometry} disabled={!biometryAvailable} />
      </View>


      {/* Botão Testar Biometria */}
      <TouchableOpacity
        onPress={handleTestBiometry}
        disabled={!biometryAvailable}
        style={{
          backgroundColor: '#add778',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 20,
          opacity: !biometryAvailable ? 0.5 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>2. Testar biometria</Text>
      </TouchableOpacity>

      {/* Botão Salvar */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={!validatePin(pin) || pin !== confirm || saving}
        style={{
          backgroundColor: '#9B64CC',
          paddingVertical: 18,
          borderRadius: 20,
          alignItems: 'center',
          marginBottom: 12,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          elevation: 3,
          opacity: (!validatePin(pin) || pin !== confirm || saving) ? 0.5 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
          {saving ? 'Salvando...' : '3. Salvar PIN e prosseguir'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
