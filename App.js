// App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InitialScreen from './screens/InitialScreen';
import PinSetupScreen from './screens/PinSetupScreen';
import LoginScreen from './screens/LoginScreen';   // PIN + BIOMETRIA
import HomeScreen from './screens/HomeScreen';
import ModulePalavras from './screens/ModulePalavras';
import ModuleMatematica from './screens/ModuleMatematica';
import ModuleTecnology from './screens/ModuleTecnology';
import ModuloJogos from './screens/ModuloJogos';
import LevelsCacaPalavras from './screens/LevelsCacaPalavras';
import CacaPalavrasScreen from './screens/CacaPalavrasScreen';
import JogoMemoriaScreen from './screens/JogoMemoriaScreen';
import LevelsJogoMemoria from './screens/LevelsJogoMemoria';
import DominoScreen from './screens/DominoScreen';
import LevelsDomino from './screens/LevelsDomino';
import QuebraCabecaScreen from './screens/QuebraCabecaScreen';
import LevelsQuebraCabeca from './screens/LevelsQuebraCabeca';
import TabuleiroScreen from './screens/TabuleiroScreen';
import LevelsTabuleiro from './screens/LevelsTabuleiro';

import Resultado from './screens/Resultado';


import { getToken } from './services/authService';
import * as SecureStore from 'expo-secure-store';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [hasPin, setHasPin] = useState(false);

  // Carregar estado inicial: se usuário já está logado e se PIN existe
  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      const storedPin = await SecureStore.getItemAsync('app_pin_hash');

      setToken(storedToken);
      setHasPin(!!storedPin);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* 1) Tela inicial (antes de qualquer coisa) */}
        <Stack.Screen name="Inicial" component={InitialScreen} />

        {/* 2) Cadastro */}

        {/* 3) Configuração do PIN */}
        <Stack.Screen name="PinSetup" component={PinSetupScreen} />

        {/* 4) Tela de login (PIN + biometria) */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 5) Fluxo principal — só acessível após login */}
        <Stack.Screen name="Início" component={HomeScreen} />
        <Stack.Screen name="ModuloPalavras" component={ModulePalavras} />
        <Stack.Screen name="ModuleMatematica" component={ModuleMatematica} />
        <Stack.Screen name="ModuleTecnology" component={ModuleTecnology} />
        <Stack.Screen name="ModuloJogos" component={ModuloJogos} />
        <Stack.Screen name="LevelsCacaPalavras" component={LevelsCacaPalavras} />
        <Stack.Screen name="CacaPalavras" component={CacaPalavrasScreen} />
        <Stack.Screen name="LevelsJogoMemoria" component={LevelsJogoMemoria} />
        <Stack.Screen name="JogoMemoria" component={JogoMemoriaScreen} />
        <Stack.Screen name="DominoScreen" component={DominoScreen} />
        <Stack.Screen name="LevelsDomino" component={LevelsDomino} />
        <Stack.Screen name="QuebraCabeca" component={QuebraCabecaScreen} />
        <Stack.Screen name="LevelsQuebraCabeca" component={LevelsQuebraCabeca} />
        <Stack.Screen name="Pista" component={TabuleiroScreen} />
        <Stack.Screen name="LevelsTabuleiro" component={LevelsTabuleiro} />
        <Stack.Screen name="Resultado" component={Resultado} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
