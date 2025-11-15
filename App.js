// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ModulePalavras from './screens/ModulePalavras';
import ModuleImagens from './screens/ModuleImagens';
import Resultado from './screens/Resultado';
import ModuleMatematica from './screens/ModuleMatematica';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Início"
        screenOptions={{
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen name="Início" component={HomeScreen} options={{ title: 'Tela Inicial' }} />
        <Stack.Screen name="ModuloPalavras" component={ModulePalavras} options={{ title: 'Módulo: Palavras' }} />
        <Stack.Screen name="ModuloImagens" component={ModuleImagens} options={{ title: 'Módulo: Imagens' }} />
        <Stack.Screen name="Resultado" component={Resultado} options={{ title: 'Resultado' }} />
        <Stack.Screen name="ModuleMatematica" component={ModuleMatematica} options={{ title: 'Módulo: Matemática' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
