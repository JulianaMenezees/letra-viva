// src/screens/InitialScreen.js
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';
import useTTS from '../utils/useTTS';
import { Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

export default function InitialScreen({ navigation }) {
  const { speak } = useTTS();

  const falarConteudo = () => {
    speak(
      'Bem vindo. Toque em 1 para cadastrar-se e configurar seu PIN ou biometria. Ou toque em 2 para fazer login e entrar no aplicativo.'
    );
  };


  const speakAndNavigate = (text, route) => {
    speak(text);
    setTimeout(() => navigation.navigate(route), 700);
  };

  const ModernButton = ({ onPress, colors, text }) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }], marginBottom: 18 }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            borderRadius: 16,
            overflow: 'hidden',

            // sombra moderna
            shadowColor: '#000',
            shadowOpacity: 0.10,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 22,
              paddingHorizontal: 20,
              alignItems: 'center',
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: '#fff',
                letterSpacing: 0.4,
                textShadowColor: 'rgba(0,0,0,0.15)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {text}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View
      style={{
        flex: 2,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
      }}
    >

      {/* TOPO */}
      <View style={{ paddingTop: 60, alignItems: 'center', marginTop: 60 }}>
        <Image
          source={require('../assets/images/institucional/logo.png')}
          style={{
            width: 160,
            height: 160,
            resizeMode: 'contain',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
          }}
        />
      </View>

      <View style={{ paddingHorizontal: 30, marginBottom: 20, marginTop: 50 }}>


        {/* Bolinhas de controle de áudio */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, marginTop: -5 }}>
          <TouchableOpacity onPress={falarConteudo} style={{ marginHorizontal: 10 }}>
            <Text style={{ fontSize: 24 }}>🔊</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Speech.stop()} style={{ marginHorizontal: 10 }}>
            <Text style={{ fontSize: 24 }}>🔇</Text>
          </TouchableOpacity>
        </View>

        <ModernButton
          text="1. Cadastre-se"
          colors={['#9B64CC', '#9B64CC']}  // pastel moderno leve
          onPress={() => speakAndNavigate('Você escolheu cadastrar-se.', 'PinSetup')}
        />

        <ModernButton
          text="2. Fazer Login"
          colors={['#F9DD7F', '#F9DD7F']}  // roxo pastel bonito
          onPress={() => speakAndNavigate('Você escolheu fazer login.', 'Login')}
        />
      </View>


      {/* IMAGEM INFERIOR */}
      <ImageBackground
        source={require('../assets/images/institucional/home__idosos.png')}
        style={{
          width: 420,
          height: 200,
          alignSelf: 'center', // mantém centralizada
        }}
        imageStyle={{ resizeMode: 'contain' }}
      />
    </View>
  );
}
