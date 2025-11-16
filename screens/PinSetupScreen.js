// src/screens/PinSetupScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, Platform } from 'react-native';
import { savePin, setBiometry, canUseBiometry, authWithBiometrics, isBiometryEnabled } from '../services/authService';
import useTTS from '../utils/useTTS';

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
        // se já estiver ativada no storage, carregar valor real
        const enabled = await isBiometryEnabled();
        setBiometryState(enabled && ok);
      } catch (e) {
        console.warn('Erro ao verificar biometria', e);
        setBiometryAvailable(false);
        setBiometryState(false);
      }
    })();

    // fala instrução
    setTimeout(() => speak('Agora vamos configurar um PIN de seis dígitos. Digite o mesmo PIN nos dois quadradinhos abaixo. Você também pode ativar a biometria, caso o seu celular permita.'), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePin = (p) => /^\d{6}$/.test(p);

  const canSave = () => validatePin(pin) && pin === confirm && !saving;

  // Ao trocar o switch (tentar ativar/desativar)
  const handleToggleBiometry = async (value) => {
    // se tentar ativar, confirme com biometria imediatamente
    if (value) {
      if (!biometryAvailable) {
        Alert.alert('Biometria indisponível', 'Seu celular não suporta ou não tem biometria cadastrada.');
        return;
      }

      speak('Para ativar biometria, confirme com sua impressão digital, aproximando seu dedo no sensor de bometria do seu celular ou rosto no próximo passo.');
      const ok = await authWithBiometrics('Confirme para ativar biometria');
      if (ok) {
        setBiometryState(true);
        // não salvamos aqui no secure store — vamos salvar no handleSave junto com o PIN
        speak('Biometria ativada localmente. Salve para persistir a configuração.');
        Alert.alert('OK', 'Biometria confirmada. Salve para finalizar.');
      } else {
        Alert.alert('Falha', 'Biometria não confirmada. Não foi ativada.');
        setBiometryState(false);
      }
    } else {
      // desativando: só atualiza o estado local (salvo no handleSave)
      setBiometryState(false);
      speak('Biometria desativada localmente. Salve para confirmar.');
    }
  };

  // Botão para testar autenticação biométrica agora (sem salvar)
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
      // persiste escolha da biometria (true/false)
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
    <View style={{ flex:1, padding:20, justifyContent:'center' }}>
      <Text style={{ fontSize:18, marginBottom:8 }}>Crie um PIN (6 dígitos)</Text>

      <TextInput
        value={pin}
        onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))} // só números
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        maxLength={6}
        placeholder="******"
        secureTextEntry
        style={{ borderWidth:1, padding:8, marginBottom:8 }}
      />

      <TextInput
        value={confirm}
        onChangeText={(t) => setConfirm(t.replace(/[^0-9]/g, ''))}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        maxLength={6}
        placeholder="Confirme o PIN"
        secureTextEntry
        style={{ borderWidth:1, padding:8, marginBottom:12 }}
      />

      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
        <Text style={{ flex:1 }}>
          Ativar biometria {biometryAvailable ? '' : '(indisponível)'}
        </Text>

        {/* o controle é desabilitado se o aparelho não suporta biometria */}
        <Switch
          value={biometry}
          onValueChange={handleToggleBiometry}
          disabled={!biometryAvailable}
        />
      </View>

      {/* Botão de testar biometria (útil para debug e para o usuário checar antes de salvar) */}
      <View style={{ marginBottom: 12 }}>
        <Button title="Testar biometria" onPress={handleTestBiometry} disabled={!biometryAvailable} />
      </View>

      <Button title={saving ? 'Salvando...' : 'Salvar PIN e prosseguir'} onPress={handleSave} disabled={!validatePin(pin) || pin !== confirm || saving} />
    </View>
  );
}
