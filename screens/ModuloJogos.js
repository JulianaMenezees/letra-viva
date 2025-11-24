import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import useTTS from '../utils/useTTS';

export default function ModuloJogos({ navigation }) {
  const { speak } = useTTS();

  useEffect(() => {
    speak(
      'Você está no módulo de jogos. Aqui você pode treinar seus conhecimentos jogando! Aperte em um dos botões para começar.'
    );
  }, []);

  const GameButton = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.gameText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>🎮 Módulo de Jogos</Text> */}

      <GameButton
        title="1. Caça Palavras"
        icon={require("../assets/images/jogos/cacaPalavras/home_caca.png")}
        onPress={() => navigation.navigate("LevelsCacaPalavras")}
      />

      <GameButton
        title="2. Jogo da Memória"
        icon={require("../assets/images/jogos/cacaPalavras/home_memoria.png")}
        onPress={() =>
          navigation.navigate("LevelsJogoMemoria", {
            gameRouteName: "JogoMemoria",
            progressKey: "memoria_progress_global",
            totalLevels: 4,
          })
        }
      />

      <GameButton
        title="3. Dominó"
        icon={require("../assets/images/jogos/cacaPalavras/home_domino.png")}
        onPress={() => navigation.navigate("LevelsDomino")}
      />

      <GameButton
        title="4. Quebra Cabeça"
        icon={require("../assets/images/jogos/cacaPalavras/home_quebra.png")}
        onPress={() => navigation.navigate("LevelsQuebraCabeca")}
      />

      <GameButton
        title="5. Pista de Jogos"
        icon={require("../assets/images/jogos/cacaPalavras/home_pista.png")}
        onPress={() => navigation.navigate("LevelsTabuleiro")}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#add778',
    justifyContent: "center",
    alignItems: 'center',
    padding: 20,
  },
  // title: {
  //   fontSize: 32,
  //   marginBottom: 25,
  //   fontWeight: 'bold',
  //   color: '#4A90E2',
  // },

  /** CARD BONITO */
  gameCard: {
    width: '92%',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#ffffffff',
    padding: 18,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 5,
    borderColor: "#e5ddc8",
    elevation: 6, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },

  icon: {
    width: 80,
    height: 80,
    marginRight: 20,
  },

  gameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b6f76",
  },
});
