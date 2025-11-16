import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useTTS from '../utils/useTTS';

export default function ModuloJogos({ navigation }) {
  const { speak } = useTTS();

  useEffect(() => {
    speak(
      'Você está no módulo de jogos. Aqui você pode treinar seus conhecimentos, jogando!. Espero que você se divirta. Aperte em 1 para ir ao jogo de caça palavras. Outros jogos serão adicionados em breve.'
    );
  }, []);

  const GameButton = ({ title, emoji, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{emoji} {title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Módulo de Jogos</Text>

      <GameButton
        title="1. Caça Palavras"
        emoji="🧩"
        onPress={() => navigation.navigate('CacaPalavras')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontSize: 30,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#4A90E2"
  },
  button: {
    width: "90%",
    backgroundColor: "#6C63FF",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold"
  }
});
